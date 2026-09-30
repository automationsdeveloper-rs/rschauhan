import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Loader2, Lock } from 'lucide-react'
import { Input, Select, Textarea, TagInput, FieldError } from './Fields'
import { StepIndicator, StepPanel } from './StepShell'
import UploadField from './UploadField'
import Turnstile, { captchaEnabled } from './Turnstile'
import { PlanPicker, OrderSummary, SuccessScreen } from './PaymentBits'
import { jobRequestSchema, jobRequestSteps, JOB_TYPES, WORK_MODES, NOTICE, QUALS } from '../../../shared/schemas'
import { pricing, getPlan, breakdown } from '../../../shared/plans'
import { industries, formatINR } from '../../config/site'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { useCheckout } from '../../lib/useCheckout'
import { clearDraft, loadDraft, loadStep, saveStep, useDraftSaver } from '../../lib/useDraft'
import { isDemo } from '../../lib/supabase'

const KEY = 'draft:job-request'
const STEPS = ['Personal', 'Preferences', 'Profile', 'Plan & Pay', 'Done']
const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Remote']
const industryNames = industries.map((i) => i.name)

export default function JobRequestForm() {
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const [sp] = useSearchParams()
  const [step, setStep] = useState(() => Math.min(loadStep(KEY), 3))
  const [dir, setDir] = useState(1)
  const [captcha, setCaptcha] = useState(null)
  const [done, setDone] = useState(null)
  const { run, busy } = useCheckout('candidate')

  const draft = loadDraft(KEY)
  const { register, control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(jobRequestSchema),
    defaultValues: {
      fullName: profile?.name ?? '', email: user?.email ?? '', phone: '', city: '', relocate: '', desiredRole: '', industry: '', preferredLocations: [],
      jobType: '', workMode: '', expectedSalary: '', noticePeriod: '', companyPrefs: '', expYears: '', skills: [], qualification: '', lastCompany: '',
      summary: '', cvPath: '', cvName: '', plan: 'priority', consent: false,
      ...draft,
      ...(pricing.candidate.some((p) => p.id === sp.get('plan')) && { plan: sp.get('plan') }), // ?plan= from the pricing page wins over a saved draft
    },
  })
  useDraftSaver(KEY, watch, !done)
  const plan = getPlan('candidate', watch('plan'))

  const go = useCallback((n) => { setDir(n > step ? 1 : -1); setStep(n); saveStep(KEY, n); window.scrollTo({ top: document.getElementById('request-form')?.offsetTop - 90 || 0, behavior: 'smooth' }) }, [step])
  const next = async () => {
    const ok = await trigger(jobRequestSteps[step])
    if (ok) go(step + 1); else toast('Please fix the highlighted fields.', 'error')
  }

  const pay = async (values) => {
    const res = await run({
      data: values, captchaToken: captcha,
      prefill: { name: values.fullName, email: values.email, contact: '+91' + values.phone },
      description: `${plan.name} — job request`,
    })
    if (res) { clearDraft(KEY); setDone(res); setDir(1); setStep(4) }
  }

  const phoneField = (
    <Controller control={control} name="phone" render={({ field }) => (
      <Input label="Phone *" prefix="+91" inputMode="numeric" maxLength={10} autoComplete="tel-national" name="phone" error={errors.phone?.message}
        value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))} />
    )} />
  )

  return (
    <div id="request-form" className="card mx-auto max-w-3xl scroll-mt-24 p-6 md:p-10">
      <StepIndicator steps={STEPS} current={step} />
      {isDemo && step < 4 && <p className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent-600">Demo mode: Supabase keys are not set, so nothing is saved and no payment is taken.</p>}

      <form onSubmit={handleSubmit(pay, () => toast('Please fix the highlighted fields.', 'error'))} noValidate>
        <StepPanel stepKey={step} dir={dir}>
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">Tell us about you</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name *" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
                <Input label="Email *" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
                {phoneField}
                <Input label="Current city *" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Willing to relocate? *</legend>
                <div className="flex gap-3">
                  {['Yes', 'No'].map((o) => (
                    <label key={o} className="flex-1 cursor-pointer">
                      <input type="radio" value={o} className="peer sr-only" {...register('relocate')} />
                      <span className="block rounded-xl border-2 border-line px-4 py-3 text-center text-sm font-semibold transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary">{o}</span>
                    </label>
                  ))}
                </div>
                <FieldError error={errors.relocate?.message} />
              </fieldset>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">What job do you want?</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Desired job role *" error={errors.desiredRole?.message} {...register('desiredRole')} />
                <Select label="Industry *" options={industryNames} error={errors.industry?.message} {...register('industry')} />
                <Select label="Job type" options={JOB_TYPES} {...register('jobType')} />
                <Select label="Work mode" options={WORK_MODES} {...register('workMode')} />
                <Input label="Expected salary (LPA) *" type="number" step="0.1" min="0" error={errors.expectedSalary?.message} {...register('expectedSalary')} />
                <Select label="Notice period" options={NOTICE} {...register('noticePeriod')} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Preferred locations *</p>
                <Controller control={control} name="preferredLocations" render={({ field }) => <TagInput label="Locations" value={field.value} onChange={field.onChange} suggestions={CITIES} error={errors.preferredLocations?.message} />} />
              </div>
              <Textarea label="Any specific company preferences?" error={errors.companyPrefs?.message} {...register('companyPrefs')} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold">Your profile</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Total experience (years) *" type="number" step="0.5" min="0" error={errors.expYears?.message} {...register('expYears')} />
                <Select label="Highest qualification *" options={QUALS} error={errors.qualification?.message} {...register('qualification')} />
              </div>
              <Input label="Current / last company" {...register('lastCompany')} />
              <div>
                <p className="mb-2 text-sm font-medium">Key skills *</p>
                <Controller control={control} name="skills" render={({ field }) => <TagInput label="Skills" value={field.value} onChange={field.onChange} error={errors.skills?.message} />} />
              </div>
              <Textarea label="Short summary about yourself" error={errors.summary?.message} {...register('summary')} />
              <div>
                <p className="mb-2 text-sm font-medium">Upload CV *</p>
                <UploadField folder="requests" value={watch('cvPath')} name={watch('cvName')} error={errors.cvPath?.message}
                  onChange={(path, name) => { setValue('cvPath', path, { shouldValidate: true, shouldDirty: true }); setValue('cvName', name) }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold">Choose your plan</h2>
              <Controller control={control} name="plan" render={({ field }) => <PlanPicker plans={pricing.candidate} value={field.value} onChange={field.onChange} />} />
              <OrderSummary plan={plan} />
              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#5B4BFF]" {...register('consent')} />
                  <span>I agree to the Terms, Privacy &amp; Refund Policy and allow the team to share my profile with employers.</span>
                </label>
                <FieldError error={errors.consent?.message} />
              </div>
              <Turnstile onToken={setCaptcha} />
            </div>
          )}

          {step === 4 && done && (
            <SuccessScreen code={done.code} demo={done.demo} dashboardTo="/dashboard/candidate"
              title="Your job request is in! 🎉" lead="Our recruiters will start searching for jobs that match your profile."
              timeline={[['Profile review', 'A recruiter reviews your CV and preferences within 24 hours.'], ['Job hunting', 'We search open roles and our employer network for matches.'], ['Shortlist shared', 'You get matched opportunities by email/WhatsApp.'], ['Interview & offer', 'We coordinate interviews and support you to the offer.']]} />
          )}
        </StepPanel>

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between gap-3">
            <button type="button" onClick={() => go(step - 1)} disabled={step === 0 || busy} className="btn btn-outline"><ArrowLeft className="h-4 w-4" />Back</button>
            {step < 3 ? (
              <button type="button" onClick={next} className="btn btn-primary">Next <ArrowRight className="h-4 w-4" /></button>
            ) : (
              <button type="submit" disabled={busy || (captchaEnabled && !captcha)} className="btn btn-accent btn-lg">
                {busy ? <><Loader2 className="h-5 w-5 animate-spin" />Processing…</> : <><Lock className="h-4 w-4" />{plan?.price ? `Pay ${formatINR(breakdown(plan.price).total)}` : 'Submit request'}</>}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
