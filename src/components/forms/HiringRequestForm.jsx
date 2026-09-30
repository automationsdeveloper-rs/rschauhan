import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Loader2, Lock, Plus, Trash2 } from 'lucide-react'
import { Input, Select, Textarea, TagInput, FieldError } from './Fields'
import { StepIndicator, StepPanel } from './StepShell'
import UploadField from './UploadField'
import Turnstile, { captchaEnabled } from './Turnstile'
import { PlanPicker, OrderSummary, SuccessScreen } from './PaymentBits'
import { hiringRequestSchema, hiringSteps, JOB_TYPES, WORK_MODES, QUALS, companySizes, urgencies } from '../../../shared/schemas'
import { pricing, getPlan, breakdown } from '../../../shared/plans'
import { industries, formatINR } from '../../config/site'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { useCheckout } from '../../lib/useCheckout'
import { clearDraft, loadDraft, loadStep, saveStep, useDraftSaver } from '../../lib/useDraft'
import { isDemo } from '../../lib/supabase'

const KEY = 'draft:hiring-request'
const STEPS = ['Company', 'Position', 'Requirements', 'Plan & Pay', 'Done']
const industryNames = industries.map((i) => i.name)
const emptyPosition = () => ({
  jobTitle: '', department: '', openings: '1', employmentType: '', workMode: '', location: '', urgency: '',
  expMin: '', expMax: '', budgetMin: '', budgetMax: '', skills: [], qualification: '', preferredIndustry: '', description: '', jdPath: '', jdName: '', notes: '',
})

export default function HiringRequestForm() {
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const [sp] = useSearchParams()
  const [step, setStep] = useState(() => Math.min(loadStep(KEY), 3))
  const [dir, setDir] = useState(1)
  const [active, setActive] = useState(0)
  const [captcha, setCaptcha] = useState(null)
  const [done, setDone] = useState(null)
  const { run, busy } = useCheckout('employer')

  const { register, control, handleSubmit, trigger, watch, setValue, getFieldState, formState: { errors } } = useForm({
    resolver: zodResolver(hiringRequestSchema),
    defaultValues: {
      companyName: '', industry: '', size: '', website: '', contactPerson: profile?.name ?? '', designation: '', email: user?.email ?? '', phone: '', city: '',
      positions: [emptyPosition()], plan: 'growth', consent: false,
      ...loadDraft(KEY),
      ...(pricing.employer.some((p) => p.id === sp.get('plan')) && { plan: sp.get('plan') }),
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'positions' })
  useDraftSaver(KEY, watch, !done)

  const positions = watch('positions')
  const plan = getPlan('employer', watch('plan'))
  const i = Math.min(active, fields.length - 1)

  const go = useCallback((n) => { setDir(n > step ? 1 : -1); setStep(n); saveStep(KEY, n); window.scrollTo({ top: document.getElementById('hire-form')?.offsetTop - 90 || 0, behavior: 'smooth' }) }, [step])

  const next = async () => {
    const names = hiringSteps(fields.length)[step]
    const ok = await trigger(names)
    if (!ok) {
      const bad = names.find((n) => getFieldState(n).error)
      const m = bad?.match(/^positions\.(\d+)\./)
      if (m) setActive(+m[1]) // jump to the position tab that has the error
      return toast('Please fix the highlighted fields.', 'error')
    }
    if (step === 2) { // make sure the selected plan can hold this many positions
      const fit = pricing.employer.find((p) => p.maxPositions >= fields.length)
      if (plan.maxPositions < fields.length && fit) setValue('plan', fit.id)
    }
    go(step + 1)
  }

  const pay = async (values) => {
    const res = await run({
      data: values, captchaToken: captcha,
      prefill: { name: values.contactPerson, email: values.email, contact: '+91' + values.phone },
      description: `${plan.name} — hiring request`,
    })
    if (res) { clearDraft(KEY); setDone(res); setDir(1); setStep(4) }
  }

  const addPosition = () => { append(emptyPosition()); setActive(fields.length) }
  const err = (k) => errors.positions?.[i]?.[k]?.message
  const p = (k) => `positions.${i}.${k}`

  const PositionTabs = (
    <div className="mb-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Positions">
      {fields.map((f, idx) => (
        <button key={f.id} type="button" role="tab" aria-selected={idx === i} onClick={() => setActive(idx)}
          className={`flex max-w-[11rem] items-center gap-2 truncate rounded-full border px-4 py-2 text-sm font-semibold transition ${idx === i ? 'border-primary bg-primary/10 text-primary' : errors.positions?.[idx] ? 'border-danger text-danger' : 'border-line text-muted hover:border-primary/50'}`}>
          {positions?.[idx]?.jobTitle || `Position ${idx + 1}`}
        </button>
      ))}
      <button type="button" onClick={addPosition} className="flex items-center gap-1.5 rounded-full border border-dashed border-primary/60 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"><Plus className="h-4 w-4" />Add another position</button>
      {fields.length > 1 && <button type="button" onClick={() => { remove(i); setActive(0) }} className="ml-auto flex items-center gap-1.5 text-sm text-danger hover:underline"><Trash2 className="h-4 w-4" />Remove this position</button>}
    </div>
  )

  return (
    <div id="hire-form" className="card mx-auto max-w-3xl scroll-mt-24 p-6 md:p-10">
      <StepIndicator steps={STEPS} current={step} />
      {isDemo && step < 4 && <p className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent-600">Demo mode: Supabase keys are not set, so nothing is saved and no payment is taken.</p>}

      <form onSubmit={handleSubmit(pay, () => toast('Please fix the highlighted fields.', 'error'))} noValidate>
        <StepPanel stepKey={step} dir={dir}>
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">About your company</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Company name *" autoComplete="organization" error={errors.companyName?.message} {...register('companyName')} />
                <Select label="Industry *" options={industryNames} error={errors.industry?.message} {...register('industry')} />
                <Select label="Company size" options={companySizes} {...register('size')} />
                <Input label="Website" type="url" error={errors.website?.message} hint="https://yourcompany.com" {...register('website')} />
                <Input label="Contact person *" autoComplete="name" error={errors.contactPerson?.message} {...register('contactPerson')} />
                <Input label="Your designation" {...register('designation')} />
                <Input label="Work email *" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
                <Controller control={control} name="phone" render={({ field }) => (
                  <Input label="Phone *" prefix="+91" inputMode="numeric" maxLength={10} name="phone" error={errors.phone?.message} value={field.value} onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                )} />
                <Input label="City *" error={errors.city?.message} {...register('city')} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-4 text-2xl font-extrabold">Position details</h2>
              {PositionTabs}
              <div key={fields[i]?.id} className="grid gap-4 sm:grid-cols-2">
                <Input label="Job title *" error={err('jobTitle')} {...register(p('jobTitle'))} />
                <Input label="Department" {...register(p('department'))} />
                <Input label="Number of openings *" type="number" min="1" error={err('openings')} {...register(p('openings'))} />
                <Select label="Employment type *" options={JOB_TYPES} error={err('employmentType')} {...register(p('employmentType'))} />
                <Select label="Work mode *" options={WORK_MODES} error={err('workMode')} {...register(p('workMode'))} />
                <Input label="Job location *" error={err('location')} {...register(p('location'))} />
                <Select label="Urgency" options={urgencies} className="sm:col-span-2" {...register(p('urgency'))} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-4 text-2xl font-extrabold">Requirements</h2>
              {PositionTabs}
              <div key={fields[i]?.id} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Min experience (yrs) *" type="number" min="0" step="0.5" error={err('expMin')} {...register(p('expMin'))} />
                  <Input label="Max experience (yrs) *" type="number" min="0" step="0.5" error={err('expMax')} {...register(p('expMax'))} />
                  <Input label="Min budget (LPA) *" type="number" min="0" step="0.1" error={err('budgetMin')} {...register(p('budgetMin'))} />
                  <Input label="Max budget (LPA) *" type="number" min="0" step="0.1" error={err('budgetMax')} {...register(p('budgetMax'))} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Required skills *</p>
                  <Controller control={control} name={p('skills')} render={({ field }) => <TagInput label="Skills" value={field.value} onChange={field.onChange} error={err('skills')} />} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Qualification" options={QUALS} {...register(p('qualification'))} />
                  <Input label="Preferred industry background" {...register(p('preferredIndustry'))} />
                </div>
                <div>
                  <Textarea label="Detailed job description *" rows={6} error={err('description')} {...register(p('description'))} />
                  <p className="mt-1 text-right text-xs text-muted">{(positions?.[i]?.description ?? '').length}/5000</p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">…or upload a JD file <span className="text-muted">(optional)</span></p>
                  <UploadField folder="jd" value={positions?.[i]?.jdPath} name={positions?.[i]?.jdName}
                    onChange={(path, name) => { setValue(p('jdPath'), path, { shouldValidate: true, shouldDirty: true }); setValue(p('jdName'), name, { shouldDirty: true }) }} />
                </div>
                <Textarea label="Additional notes" rows={3} {...register(p('notes'))} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold">Choose your plan</h2>
              <p className="-mt-3 text-sm text-muted">You are hiring for <b className="text-fg">{fields.length}</b> position{fields.length > 1 ? 's' : ''}.</p>
              <Controller control={control} name="plan" render={({ field }) => (
                <PlanPicker plans={pricing.employer} value={field.value} onChange={field.onChange}
                  disabledIf={(pl) => pl.maxPositions < fields.length && `Supports up to ${pl.maxPositions} position${pl.maxPositions > 1 ? 's' : ''}`} />
              )} />
              <OrderSummary plan={plan} />
              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#5B4BFF]" {...register('consent')} />
                  <span>I agree to the Terms, Privacy &amp; Refund Policy and confirm I am authorised to hire on behalf of this company.</span>
                </label>
                <FieldError error={errors.consent?.message} />
              </div>
              <Turnstile onToken={setCaptcha} />
            </div>
          )}

          {step === 4 && done && (
            <SuccessScreen code={done.code} demo={done.demo} dashboardTo="/dashboard/employer"
              title="Hiring request received! 🎉" lead="Our recruiter will contact you within 24 hours."
              timeline={[['Recruiter call', 'A dedicated recruiter calls to confirm the brief (within 24 hours).'], ['Sourcing & screening', 'We search, call and verify candidates against your requirement.'], ['Profiles shared', 'Verified profiles appear in your dashboard within 48 hours.'], ['Interview & hire', 'You interview your favourites and close the position.']]} />
          )}
        </StepPanel>

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(step - 1)} disabled={step === 0 || busy} className="btn btn-outline"><ArrowLeft className="h-4 w-4" />Back</button>
            {step < 3 ? (
              <button type="button" onClick={next} className="btn btn-primary">Next <ArrowRight className="h-4 w-4" /></button>
            ) : (
              <button type="submit" disabled={busy || (captchaEnabled && !captcha && plan?.price != null)} className="btn btn-accent btn-lg">
                {busy ? <><Loader2 className="h-5 w-5 animate-spin" />Processing…</> : <><Lock className="h-4 w-4" />{plan?.price ? `Pay ${formatINR(breakdown(plan.price).total)}` : 'Submit request'}</>}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
