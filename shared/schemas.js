// Validation shared by the browser forms and the serverless API (never trust the client alone).
import { z } from 'zod'

const numStr = (label, min = 0, max) =>
  z.string().trim()
    .refine((v) => v !== '' && !isNaN(v), `${label} is required`)
    .refine((v) => v === '' || isNaN(v) || (Number(v) >= min && (max == null || Number(v) <= max)), `Enter a value between ${min} and ${max ?? '∞'}`)

const phone = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
const email = z.string().trim().email('Enter a valid email address')
const text = (label, min = 2, max = 120) => z.string().trim().min(min, `${label} is required`).max(max, `${label} is too long`)
const tags = (label) => z.array(z.string().trim().min(1).max(60)).min(1, `Add at least one ${label}`).max(20)
const consent = z.literal(true, { errorMap: () => ({ message: 'You must accept to continue' }) })

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
export const WORK_MODES = ['Onsite', 'Hybrid', 'Remote']
export const NOTICE = ['Immediate', '15 days', '30 days', '60 days', '90 days']
export const QUALS = ['10th / 12th', 'Diploma', "Bachelor's degree", "Master's degree", 'MBA / PGDM', 'PhD', 'Other']

// ───────── Candidate job request ─────────
export const jobRequestSchema = z.object({
  // step 1
  fullName: text('Full name'),
  email,
  phone,
  city: text('Current city'),
  relocate: z.enum(['Yes', 'No'], { errorMap: () => ({ message: 'Please choose an option' }) }),
  // step 2
  desiredRole: text('Desired job role'),
  industry: z.string().min(1, 'Select an industry'),
  preferredLocations: tags('location'),
  jobType: z.string().optional(),
  workMode: z.string().optional(),
  expectedSalary: numStr('Expected salary', 0.1, 500),
  noticePeriod: z.string().optional(),
  companyPrefs: z.string().max(300).optional(),
  // step 3
  expYears: numStr('Experience', 0, 50),
  skills: tags('skill'),
  qualification: z.string().min(1, 'Select your highest qualification'),
  lastCompany: z.string().max(120).optional(),
  summary: z.string().max(1000, 'Keep it under 1000 characters').optional(),
  cvPath: z.string().regex(/^requests\//, 'Please upload your CV'),
  // step 4
  plan: z.enum(['basic', 'priority', 'premium'], { errorMap: () => ({ message: 'Choose a plan' }) }),
  consent,
})

export const jobRequestSteps = [
  ['fullName', 'email', 'phone', 'city', 'relocate'],
  ['desiredRole', 'industry', 'preferredLocations', 'jobType', 'workMode', 'expectedSalary', 'noticePeriod', 'companyPrefs'],
  ['expYears', 'skills', 'qualification', 'lastCompany', 'summary', 'cvPath'],
]

// ───────── Employer hiring request ─────────
export const positionSchema = z.object({
  jobTitle: text('Job title'),
  department: z.string().max(80).optional(),
  openings: numStr('Openings', 1, 500),
  employmentType: z.string().min(1, 'Select employment type'),
  workMode: z.string().min(1, 'Select work mode'),
  location: text('Job location'),
  urgency: z.string().optional(),
  expMin: numStr('Min experience', 0, 50),
  expMax: numStr('Max experience', 0, 50),
  budgetMin: numStr('Min budget', 0.1, 500),
  budgetMax: numStr('Max budget', 0.1, 500),
  skills: tags('skill'),
  qualification: z.string().optional(),
  preferredIndustry: z.string().max(120).optional(),
  description: z.string().max(5000).optional(),
  jdPath: z.string().regex(/^jd\//).optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
}).superRefine((p, ctx) => {
  if (Number(p.expMax) < Number(p.expMin)) ctx.addIssue({ code: 'custom', path: ['expMax'], message: 'Max must be ≥ min' })
  if (Number(p.budgetMax) < Number(p.budgetMin)) ctx.addIssue({ code: 'custom', path: ['budgetMax'], message: 'Max must be ≥ min' })
  if ((p.description ?? '').trim().length < 20 && !p.jdPath) ctx.addIssue({ code: 'custom', path: ['description'], message: 'Describe the role (min 20 characters) or upload a JD file' })
})

export const hiringRequestSchema = z.object({
  companyName: text('Company name'),
  industry: z.string().min(1, 'Select an industry'),
  size: z.string().optional(),
  website: z.string().trim().refine((v) => v === '' || /^https?:\/\/.+\..+/.test(v), 'Enter a full URL, e.g. https://company.com').optional(),
  contactPerson: text('Contact person'),
  designation: z.string().max(80).optional(),
  email,
  phone,
  city: text('City'),
  positions: z.array(positionSchema).min(1).max(20),
  plan: z.enum(['single', 'growth', 'enterprise'], { errorMap: () => ({ message: 'Choose a plan' }) }),
  consent,
})

export const companySizes = ['1–10', '11–50', '51–200', '201–1000', '1000+']
export const urgencies = ['Immediate', '15 days', '30 days', 'Flexible']

const posFields = ['jobTitle', 'department', 'openings', 'employmentType', 'workMode', 'location', 'urgency']
const reqFields = ['expMin', 'expMax', 'budgetMin', 'budgetMax', 'skills', 'qualification', 'preferredIndustry', 'description', 'jdPath', 'notes']
export const hiringSteps = (n) => [
  ['companyName', 'industry', 'size', 'website', 'contactPerson', 'designation', 'email', 'phone', 'city'],
  Array.from({ length: n }, (_, i) => posFields.map((f) => `positions.${i}.${f}`)).flat(),
  Array.from({ length: n }, (_, i) => reqFields.map((f) => `positions.${i}.${f}`)).flat(),
]

// ───────── Contact form ─────────
export const CONTACT_SUBJECTS = ['General enquiry', 'I am a candidate', 'I am an employer', 'Payment or refund', 'Partnership', 'Other']
export const contactSchema = z.object({
  name: text('Name'),
  email,
  phone: z.string().trim().refine((v) => v === '' || /^[6-9]\d{9}$/.test(v), 'Enter a valid 10-digit mobile number').optional(),
  subject: z.enum(CONTACT_SUBJECTS, { errorMap: () => ({ message: 'Choose a subject' }) }),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(2000, 'Keep it under 2000 characters'),
  website: z.string().max(0).optional(), // honeypot
})
