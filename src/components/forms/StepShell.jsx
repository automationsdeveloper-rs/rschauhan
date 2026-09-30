import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

/** Animated step indicator: numbered nodes + a gradient progress bar. */
export function StepIndicator({ steps, current }) {
  const pct = (current / (steps.length - 1)) * 100
  return (
    <div className="mb-8" role="group" aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}>
      <div className="relative">
        <div className="absolute left-4 right-4 top-4 h-1 rounded bg-line" />
        <motion.div className="absolute left-4 top-4 h-1 rounded bg-brand-gradient" initial={false} animate={{ width: `calc((100% - 2rem) * ${pct / 100})` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        <ol className="relative flex justify-between">
          {steps.map((s, i) => (
            <li key={s} className="flex w-16 flex-col items-center gap-2 sm:w-24" aria-current={i === current ? 'step' : undefined}>
              <motion.span animate={{ scale: i === current ? 1.12 : 1 }} className={`grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold transition-colors ${i < current ? 'border-primary bg-primary text-white' : i === current ? 'border-primary bg-surface text-primary shadow-glow' : 'border-line bg-surface text-muted'}`}>
                {i < current ? <Check className="h-4 w-4" /> : i + 1}
              </motion.span>
              <span className={`hidden text-center text-xs font-semibold sm:block ${i <= current ? 'text-fg' : 'text-muted'}`}>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/** Slides content left/right depending on direction (1 = forward, -1 = back). */
export function StepPanel({ stepKey, dir, children }) {
  return (
    <AnimatePresence mode="wait" initial={false} custom={dir}>
      <motion.div key={stepKey} custom={dir}
        variants={{ enter: (d) => ({ opacity: 0, x: d * 40 }), center: { opacity: 1, x: 0 }, exit: (d) => ({ opacity: 0, x: d * -40 }) }}
        initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
