import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { Reveal } from '../ui/Motion'
import { testimonials, faqs } from '../../data/content'
import { useLang } from '../../i18n'

const initials = (n) => n.split(' ').map((x) => x[0]).join('')

export function Testimonials() {
  const { d } = useLang()
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const go = useCallback((n) => { setDir(n > 0 ? 1 : -1); setI((c) => (c + n + testimonials.length) % testimonials.length) }, [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(1), 6000)
    return () => clearInterval(t)
  }, [paused, go])

  const t = testimonials[i]
  return (
    <section className="section overflow-hidden">
      <div className="container">
        <SectionHeading eyebrow={d.testimonials.eyebrow} title={d.testimonials.title} />
        <div className="relative mx-auto mt-14 max-w-3xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="min-h-[300px] sm:min-h-[260px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.figure key={i} custom={dir}
                initial={{ opacity: 0, x: dir * 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -60 }} transition={{ duration: 0.35 }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
                onDragEnd={(_, info) => { if (info.offset.x < -60) go(1); else if (info.offset.x > 60) go(-1) }}
                className="card cursor-grab p-8 active:cursor-grabbing md:p-10">
                <Quote className="h-8 w-8 text-primary/40" aria-hidden />
                <div className="mt-3 flex gap-0.5 text-accent" role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}</div>
                <blockquote className="mt-4 text-lg font-medium leading-relaxed md:text-xl">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-gradient-ui font-heading font-bold text-white" aria-hidden>{initials(t.name)}</span>
                  <span><b className="block">{t.name}</b><span className="text-sm text-muted">{t.role}</span></span>
                  <span className="ml-auto hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:block">{t.type}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} aria-label="Previous testimonial" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface transition hover:border-primary hover:text-primary"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex gap-2">
              {testimonials.map((_, k) => (
                <button key={k} onClick={() => { setDir(k > i ? 1 : -1); setI(k) }} aria-label={`Testimonial ${k + 1}`} aria-current={k === i} className="grid h-6 min-w-[1.5rem] place-items-center px-0.5">
                  <span aria-hidden className={`block h-2 rounded-full transition-all ${k === i ? 'w-8 bg-primary' : 'w-2 bg-line hover:bg-primary/40'}`} />
                </button>
              ))}
            </div>
            <button onClick={() => go(1)} aria-label="Next testimonial" className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface transition hover:border-primary hover:text-primary"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FAQList({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <Reveal className="space-y-3">
      {items.map((f, k) => {
        const isOpen = open === k
        return (
          <div key={f.q} className={`card overflow-hidden transition-colors ${isOpen ? 'border-primary/50' : ''}`}>
            <h3>
              <button onClick={() => setOpen(isOpen ? -1 : k)} aria-expanded={isOpen} aria-controls={`faq-${k}`}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-heading font-bold md:text-lg">
                {f.q}
                <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={`faq-${k}`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                  <p className="px-5 pb-5 text-muted">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </Reveal>
  )
}

export function FAQ() {
  const { d } = useLang()
  return (
    <section className="section bg-primary/[0.03]">
      <div className="container max-w-3xl">
        <SectionHeading eyebrow={d.faq.eyebrow} title={d.faq.title} />
        <div className="mt-12"><FAQList items={faqs} /></div>
      </div>
    </section>
  )
}
