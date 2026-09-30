import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { Input, Select, Textarea, TagInput, FieldError } from '../forms/Fields'
import FileDropzone from '../forms/FileDropzone'
import Confetti from '../forms/Confetti'
import Button from '../ui/Button'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { uploadCv } from '../../lib/upload'
import { submitApplication, sendConfirmation } from '../../lib/applicationApi'

const num = (label, { min = 0, max } = {}) =>
  z.string().trim().refine((v) => v !== '' && !isNaN(v), `${label} is required`).refine((v) => Number(v) >= min && (max == null || Number(v) <= max), `Enter a value between ${min} and ${max ?? '∞'}`)
const optNum = z.string().trim().refine((v) => v === '' || (!isNaN(v) && Number(v) >= 0), 'Enter a valid number')

export const applicationSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  city: z.string().trim().min(2, 'Current city is required'),
  company: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  expYears: num('Years', { min: 0, max: 50 }),
  expMonths: num('Months', { min: 0, max: 11 }),
  currentCtc: optNum,
  expectedCtc: z.string().trim().refine((v) => v !== '' && Number(v) > 0, 'Expected CTC is required'),
  noticePeriod: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  qualification: z.string().min(1, 'Select your highest qualification'),
  linkedin: z.string().trim().refine((v) => v === '' || /^https?:\/\/(www\.)?linkedin\.com\//i.test(v), 'Enter a valid LinkedIn URL').optional(),
  coverNote: z.string().max(1000, 'Keep it under 1000 characters').optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'You must accept to continue' }) }),
  website: z.string().max(0).optional(), // honeypot
})

const QUALS = ['10th / 12th', 'Diploma', "Bachelor's degree", "Master's degree", 'MBA / PGDM', 'PhD', 'Other']
const NOTICE = ['Immediate', '15 days', '30 days', '60 days', '90 days']

const Section = ({ title, children }) => (
  <fieldset className="space-y-4">
    <legend className="mb-1 font-heading text-sm font-bold uppercase tracking-wider text-primary">{title}</legend>
    {children}
  </fieldset>
)

export default function ApplicationForm({ job }) {
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const [cv, setCv] = useState({ file: null, progress: 0, path: null })
  const [cvError, setCvError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [doneId, setDoneId] = useState(null)

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: profile?.name ?? '', email: user?.email ?? '', phone: '', city: '', company: '', designation: '',
      expYears: '', expMonths: '0', currentCtc: '', expectedCtc: '', noticePeriod: '', skills: [], qualification: '',
      linkedin: '', coverNote: '', consent: false, website: '',
    },
  })

  const onSubmit = async (v) => {
    if (v.website) return setDoneId('bot') // honeypot tripped: pretend success
    if (!cv.file) { setCvError('Please upload your CV'); return }
    setBusy(true)
    try {
      let path = cv.path
      if (!path) {
        path = await uploadCv(cv.file, (p) => setCv((c) => ({ ...c, progress: p })))
        setCv((c) => ({ ...c, progress: 100, path }))
      }
      const id = await submitApplication(job, v, path)
      sendConfirmation(id)
      setDoneId(id)
    } catch (e) {
      toast(e.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const onInvalid = () => toast('Please fix the highlighted fields.', 'error')

  if (doneId) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card relative overflow-hidden p-10 text-center">
        <Confetti />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-11 w-11" /></motion.div>
        <h2 className="mt-6 text-3xl font-extrabold">Application sent!</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">Thanks for applying to <b className="text-fg">{job.title}</b> at {job.company}. We&apos;ve emailed you a confirmation and our team will review your profile shortly.</p>
        {doneId !== 'bot' && <p className="mt-2 text-xs text-muted">Reference: {doneId}</p>}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/dashboard/candidate" arrow>Track your application</Button>
          <Button to="/jobs" variant="outline">Browse more jobs</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="card space-y-8 p-6 md:p-8">
      <Section title="Personal details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name *" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Email *" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Controller control={control} name="phone" render={({ field }) => (
            <Input label="Phone *" prefix="+91" inputMode="numeric" autoComplete="tel-national" maxLength={10} error={errors.phone?.message} hint="10-digit mobile number"
              value={field.value} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))} onBlur={field.onBlur} name="phone" />
          )} />
          <Input label="Current city *" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
        </div>
      </Section>

      <Section title="Experience">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Current company" error={errors.company?.message} {...register('company')} />
          <Input label="Current designation" error={errors.designation?.message} {...register('designation')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Experience – years *" type="number" min="0" inputMode="numeric" error={errors.expYears?.message} {...register('expYears')} />
            <Input label="Months *" type="number" min="0" max="11" inputMode="numeric" error={errors.expMonths?.message} {...register('expMonths')} />
          </div>
          <Select label="Notice period" options={NOTICE} error={errors.noticePeriod?.message} {...register('noticePeriod')} />
          <Input label="Current CTC (LPA)" type="number" step="0.1" min="0" error={errors.currentCtc?.message} {...register('currentCtc')} />
          <Input label="Expected CTC (LPA) *" type="number" step="0.1" min="0" error={errors.expectedCtc?.message} {...register('expectedCtc')} />
        </div>
        <Select label="Highest qualification *" options={QUALS} error={errors.qualification?.message} {...register('qualification')} />
        <div>
          <p className="mb-2 text-sm font-medium">Key skills *</p>
          <Controller control={control} name="skills" render={({ field }) => (
            <TagInput label="Skills" value={field.value} onChange={field.onChange} error={errors.skills?.message} suggestions={job.skills} />
          )} />
        </div>
      </Section>

      <Section title="Profile & CV">
        <Input label="LinkedIn URL (optional)" type="url" placeholder=" " error={errors.linkedin?.message} {...register('linkedin')} />
        <Textarea label="Cover note (optional)" error={errors.coverNote?.message} {...register('coverNote')} />
        <div>
          <p className="mb-2 text-sm font-medium">Upload CV *</p>
          <FileDropzone file={cv.file} progress={cv.progress} done={!!cv.path} error={cvError}
            onSelect={(file) => { setCvError(null); setCv({ file, progress: 0, path: null }) }}
            onClear={() => setCv({ file: null, progress: 0, path: null })} />
        </div>
      </Section>

      {/* honeypot: hidden from humans, bots fill it */}
      <input {...register('website')} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#5B4BFF]" {...register('consent')} />
          <span>I agree to the <Link to="/terms" className="text-primary underline">Terms</Link> &amp; <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> and allow HireNest to share my profile with employers.</span>
        </label>
        <FieldError error={errors.consent?.message} />
      </div>

      <button type="submit" disabled={busy} className="btn btn-primary btn-lg w-full">
        {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> {cv.progress > 0 && cv.progress < 100 ? `Uploading CV… ${Math.round(cv.progress)}%` : 'Submitting…'}</> : <><Send className="h-5 w-5" /> Submit application</>}
      </button>
    </form>
  )
}
