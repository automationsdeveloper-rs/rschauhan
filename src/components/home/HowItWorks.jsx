import { useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import { steps } from '../../config/site'

const tabs = [{ id: 'candidates', label: 'For Candidates' }, { id: 'employers', label: 'For Employers' }]

export default function HowItWorks() {
  const [tab, setTab] = useState('candidates')
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 26 })

  return (
    <section id="how-it-works" className="section scroll-mt-16">
      <div className="container">
        <SectionHeading eyebrow="How it works" title="Four simple steps to your outcome" text="Whether you're the one searching or the one hiring, we keep it simple." />

        <div role="tablist" aria-label="Audience" className="glass mx-auto mt-10 flex w-fit rounded-2xl p-1.5">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${tab === t.id ? 'text-white' : 'text-muted hover:text-fg'}`}>
              {tab === t.id && <motion.span layoutId="hiw-pill" className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        <div ref={ref} className="relative mx-auto mt-16 max-w-3xl">
          {/* connecting line that draws with scroll */}
          <div className="absolute bottom-6 left-6 top-6 w-0.5 rounded bg-line" aria-hidden />
          <motion.div className="absolute left-6 top-6 w-0.5 origin-top rounded bg-brand-gradient" style={{ scaleY: line, bottom: '1.5rem' }} aria-hidden />

          <AnimatePresence mode="wait">
            <motion.ol key={tab} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="relative space-y-10">
              {steps[tab].map((s, i) => (
                <motion.li key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: i * 0.05 }} className="relative flex gap-6">
                  <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-4 border-bg bg-brand-gradient font-heading font-extrabold text-white shadow-glow">{i + 1}</span>
                  <div className="card flex-1 p-5 md:p-6">
                    <h3 className="text-lg font-bold md:text-xl">{s.title}</h3>
                    <p className="mt-1.5 text-muted">{s.text}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
