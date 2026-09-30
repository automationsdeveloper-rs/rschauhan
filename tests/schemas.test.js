import { describe, it, expect } from 'vitest'
import { jobRequestSchema, hiringRequestSchema, contactSchema, hiringSteps, jobRequestSteps } from '../shared/schemas.js'

const jr = {
  fullName: 'Asha Rao', email: 'asha@example.com', phone: '9876543210', city: 'Pune', relocate: 'Yes',
  desiredRole: 'Product Designer', industry: 'IT & Software', preferredLocations: ['Pune', 'Remote'], expectedSalary: '12',
  expYears: '3', skills: ['Figma'], qualification: "Bachelor's degree", cvPath: 'requests/abc/cv.pdf', plan: 'priority', consent: true,
}
const first = (r) => r.error.issues[0]

describe('jobRequestSchema', () => {
  it('accepts a complete request', () => expect(jobRequestSchema.safeParse(jr).success).toBe(true))
  it('rejects an invalid Indian mobile number', () => expect(first(jobRequestSchema.safeParse({ ...jr, phone: '12345' })).path).toEqual(['phone']))
  it('rejects a CV path outside the requests/ folder', () => expect(first(jobRequestSchema.safeParse({ ...jr, cvPath: '../../etc/passwd' })).path).toEqual(['cvPath']))
  it('rejects an unknown plan id', () => expect(jobRequestSchema.safeParse({ ...jr, plan: 'free' }).success).toBe(false))
  it('requires consent', () => expect(first(jobRequestSchema.safeParse({ ...jr, consent: false })).path).toEqual(['consent']))
  it('lists every step-1..3 field exactly once', () => {
    const all = jobRequestSteps.flat()
    expect(new Set(all).size).toBe(all.length)
    expect(all).toContain('cvPath')
  })
})

const pos = { jobTitle: 'Developer', openings: '2', employmentType: 'Full-time', workMode: 'Remote', location: 'Pune', expMin: '2', expMax: '5', budgetMin: '10', budgetMax: '20', skills: ['React'], description: 'Build and ship the web platform.' }
const hr = { companyName: 'Acme', industry: 'IT & Software', contactPerson: 'Ravi', email: 'r@acme.co', phone: '9876543210', city: 'Pune', positions: [pos], plan: 'single', consent: true }

describe('hiringRequestSchema', () => {
  it('accepts a complete request', () => expect(hiringRequestSchema.safeParse(hr).success).toBe(true))
  it('rejects max experience below min', () => expect(first(hiringRequestSchema.safeParse({ ...hr, positions: [{ ...pos, expMax: '1' }] })).message).toMatch(/Max/))
  it('rejects budget max below min', () => expect(first(hiringRequestSchema.safeParse({ ...hr, positions: [{ ...pos, budgetMax: '5' }] })).path).toEqual(['positions', 0, 'budgetMax']))
  it('needs a description or a JD file', () => {
    expect(hiringRequestSchema.safeParse({ ...hr, positions: [{ ...pos, description: '' }] }).success).toBe(false)
    expect(hiringRequestSchema.safeParse({ ...hr, positions: [{ ...pos, description: '', jdPath: 'jd/x/brief.pdf' }] }).success).toBe(true)
  })
  it('rejects a website without a scheme', () => expect(first(hiringRequestSchema.safeParse({ ...hr, website: 'acme.co' })).path).toEqual(['website']))
  it('scales the per-step field list with the number of positions', () => {
    expect(hiringSteps(1)[1]).toHaveLength(7)
    expect(hiringSteps(3)[1]).toHaveLength(21)
    expect(hiringSteps(2)[2][0]).toBe('positions.0.expMin')
  })
})

describe('contactSchema', () => {
  const ok = { name: 'Riya', email: 'riya@example.com', phone: '', subject: 'General enquiry', message: 'Hello, I have a question about pricing.' }
  it('accepts a message with an empty optional phone', () => expect(contactSchema.safeParse(ok).success).toBe(true))
  it('rejects a bad phone when one is given', () => expect(first(contactSchema.safeParse({ ...ok, phone: '123' })).path).toEqual(['phone']))
  it('rejects a too-short message', () => expect(first(contactSchema.safeParse({ ...ok, message: 'hi' })).path).toEqual(['message']))
  it('rejects an unknown subject', () => expect(contactSchema.safeParse({ ...ok, subject: 'Spam' }).success).toBe(false))
})
