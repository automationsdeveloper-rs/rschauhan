import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { Input, Select, Textarea } from '../components/forms/Fields'
import Turnstile, { captchaEnabled } from '../components/forms/Turnstile'
import { Reveal } from '../components/ui/Motion'
import { contactSchema, CONTACT_SUBJECTS } from '../../shared/schemas'
import { submitContact } from '../lib/contactApi'
import { isDemo } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import { site } from '../config/site'
import { useSeo } from '../lib/hooks'

const cards = [
  { icon: Mail, label: 'Email us', value: site.email, href: `mailto:${site.email}`, note: 'We reply within one business day.' },
  { icon: Phone, label: 'Call us', value: site.phone, href: `tel:${site.phone.replace(/\s/g, '')}`, note: site.hours },
  { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with a recruiter', href: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi ${site.name}, I have a question.`)}`, note: 'Fastest for quick questions.', external: true },
  { icon: MapPin, label: 'Visit us', value: site.address, href: `https://www.google.com/maps?q=${encodeURIComponent(site.address)}`, note: 'By appointment.', external: true },
]

export default function Contact() {
  useSeo({ title: `Contact — ${site.name}`, description: `Questions about jobs, hiring or payments? Email, call or WhatsApp the ${site.name} team.` })
  const { toast } = useToast()
  const [captcha, setCaptcha] = useState(null)
  const [done, setDone] = useState(false)
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '', website: '' },
  })

  const onSubmit = async (v) => {
    try { await submitContact(v, captcha); setDone(true) }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div className="container pb-20 pt-28 md:pt-36">
      <Reveal className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Contact</span>
        <h1 className="text-4xl font-extrabold md:text-6xl">We&apos;re here to <span className="text-gradient">help.</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">Questions about a job, a hiring request or a payment? Send a message, or reach us directly.</p>
      </Reveal>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {cards.map((c) => (
            <Reveal key={c.label}>
              <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="card flex gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lift">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden><c.icon className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-wider text-muted">{c.label}</span><span className="block break-words font-semibold">{c.value}</span><span className="block text-xs text-muted">{c.note}</span></span>
              </a>
            </Reveal>
          ))}
          <Reveal>
            <div className="card flex items-center gap-3 p-5 text-sm"><Clock className="h-5 w-5 shrink-0 text-primary" aria-hidden /><span><b>Office hours:</b> {site.hours}</span></div>
          </Reveal>
          <Reveal>
            <iframe title={`Map showing the ${site.name} office`} src={`https://www.google.com/maps?q=${encodeURIComponent(site.address)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen
              className="h-64 w-full rounded-2xl border border-line bg-surface" />
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card grid h-full place-items-center p-10 text-center" role="status">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="h-9 w-9" aria-hidden /></span>
                <h2 className="mt-5 text-2xl font-extrabold">Message sent!</h2>
                <p className="mx-auto mt-2 max-w-sm text-muted">Thanks for reaching out. We have emailed you a copy and will reply within one business day.</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit, () => toast('Please fix the highlighted fields.', 'error'))} noValidate className="card space-y-4 p-6 md:p-8">
              <h2 className="text-2xl font-extrabold">Send a message</h2>
              {isDemo && <p className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent-700">Demo mode: Supabase keys are not set, so messages are not saved.</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Your name *" autoComplete="name" error={errors.name?.message} {...register('name')} />
                <Input label="Email *" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
                <Controller control={control} name="phone" render={({ field }) => (
                  <Input label="Phone (optional)" prefix="+91" inputMode="numeric" maxLength={10} autoComplete="tel-national" name="phone" error={errors.phone?.message}
                    value={field.value} onBlur={field.onBlur} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                )} />
                <Select label="Subject *" options={CONTACT_SUBJECTS} error={errors.subject?.message} {...register('subject')} />
              </div>
              <Textarea label="Message *" rows={6} error={errors.message?.message} {...register('message')} />
              {/* honeypot: hidden from humans, bots fill it */}
              <input {...register('website')} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <Turnstile onToken={setCaptcha} />
              <button disabled={isSubmitting || (captchaEnabled && !captcha)} className="btn btn-primary btn-lg w-full">
                {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden />Sending…</> : <><Send className="h-5 w-5" aria-hidden />Send message</>}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  )
}
