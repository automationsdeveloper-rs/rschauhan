// POST /api/create-order  { kind: 'candidate' | 'employer', data, captchaToken }
// Validates on the server, stores the request as payment_status=pending, creates a Razorpay order.
// The amount comes from shared/plans.js, never from the client.
import { db, requestCode, rateLimit, verifyCaptcha, userFromRequest } from './_lib.js'
import { getPlan, breakdown } from '../shared/plans.js'
import { jobRequestSchema, hiringRequestSchema } from '../shared/schemas.js'

const fail = (res, code, error) => res.status(code).json({ error })
const num = (v) => (v === '' || v == null ? null : Number(v))

async function razorpayOrder({ amountRupees, receipt, notes }) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
  const r = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountRupees * 100, currency: 'INR', receipt, notes }),
  })
  if (!r.ok) throw new Error('razorpay ' + r.status + ' ' + (await r.text()))
  return r.json()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!rateLimit(req, 'order', 10)) return fail(res, 429, 'Too many attempts. Please try again in a few minutes.')

  const { kind, data, captchaToken } = req.body || {}
  if (!(await verifyCaptcha(captchaToken, req))) return fail(res, 400, 'CAPTCHA verification failed. Please retry.')
  if (kind !== 'candidate' && kind !== 'employer') return fail(res, 400, 'Invalid request type')

  const parsed = (kind === 'candidate' ? jobRequestSchema : hiringRequestSchema).safeParse(data)
  if (!parsed.success) return fail(res, 400, parsed.error.issues[0]?.message || 'Invalid form data')
  const v = parsed.data
  const plan = getPlan(kind, v.plan)
  if (!plan) return fail(res, 400, 'Unknown plan')

  const client = db()
  const userId = await userFromRequest(req, client)
  const code = requestCode(kind === 'candidate' ? 'JR' : 'HR')

  try {
    let requestId
    if (kind === 'candidate') {
      // candidate row: never overwrite an account-linked profile from an anonymous request
      const email = v.email.toLowerCase()
      const { data: existing } = await client.from('candidates').select('id, user_id').eq('email', email).maybeSingle()
      const fields = {
        full_name: v.fullName, phone: '+91' + v.phone, city: v.city, experience_years: num(v.expYears), current_company: v.lastCompany || null,
        skills: v.skills, qualification: v.qualification, notice_period: v.noticePeriod || null, expected_ctc: num(v.expectedSalary), cv_url: v.cvPath,
      }
      let candidateId = existing?.id
      if (!existing) {
        const { data: c, error } = await client.from('candidates').insert({ ...fields, email, user_id: userId }).select('id').single()
        if (error) throw error
        candidateId = c.id
      } else if (!existing.user_id || existing.user_id === userId) {
        await client.from('candidates').update({ ...fields, user_id: existing.user_id ?? userId }).eq('id', existing.id)
      }
      const { data: r, error } = await client.from('candidate_job_requests').insert({
        candidate_id: candidateId, request_code: code, desired_role: v.desiredRole, industry: v.industry, preferred_locations: v.preferredLocations,
        job_type: v.jobType || null, work_mode: v.workMode || null, expected_salary: num(v.expectedSalary), notice_period: v.noticePeriod || null,
        relocate: v.relocate === 'Yes', company_preferences: v.companyPrefs || null, summary: v.summary || null, cv_url: v.cvPath, plan: v.plan,
      }).select('id').single()
      if (error) throw error
      requestId = r.id
    } else {
      if (v.positions.length > plan.maxPositions) return fail(res, 400, `The ${plan.name} plan allows up to ${plan.maxPositions} position(s).`)
      const email = v.email.toLowerCase()
      let { data: emp } = await client.from('employers').select('id').eq('email', email).eq('company_name', v.companyName).maybeSingle()
      if (!emp) {
        const { data, error } = await client.from('employers').insert({
          user_id: userId, company_name: v.companyName, industry: v.industry, size: v.size || null, website: v.website || null,
          contact_person: v.contactPerson, designation: v.designation || null, email, phone: '+91' + v.phone, city: v.city,
        }).select('id').single()
        if (error) throw error
        emp = data
      }
      const { data: r, error } = await client.from('employer_requests').insert({ employer_id: emp.id, request_code: code, plan: v.plan }).select('id').single()
      if (error) throw error
      requestId = r.id
      const { error: pe } = await client.from('employer_positions').insert(v.positions.map((p) => ({
        request_id: requestId, job_title: p.jobTitle, department: p.department || null, openings: num(p.openings), employment_type: p.employmentType,
        work_mode: p.workMode, location: p.location, urgency: p.urgency || null, exp_min: num(p.expMin), exp_max: num(p.expMax),
        budget_min: num(p.budgetMin), budget_max: num(p.budgetMax), skills: p.skills, qualification: p.qualification || null,
        job_description: p.description || null, jd_file_url: p.jdPath || null, notes: [p.preferredIndustry && `Preferred industry: ${p.preferredIndustry}`, p.notes].filter(Boolean).join('\n') || null,
      })))
      if (pe) throw pe
    }

    // Enterprise = custom pricing: no payment, the sales team follows up.
    if (plan.price == null) return res.status(200).json({ requestId, requestCode: code, free: true })

    const { total } = breakdown(plan.price)
    const order = await razorpayOrder({ amountRupees: total, receipt: code, notes: { kind, plan: v.plan, request: code } })
    const { error: payErr } = await client.from('payments').insert({
      user_id: userId, type: kind === 'candidate' ? 'candidate_request' : 'employer_request', reference_id: requestId,
      amount: total, currency: 'INR', razorpay_order_id: order.id, status: 'created',
    })
    if (payErr) throw payErr

    return res.status(200).json({ requestId, requestCode: code, orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (e) {
    console.error('create-order error', e)
    return fail(res, 500, 'We could not start the payment. Please try again.')
  }
}
