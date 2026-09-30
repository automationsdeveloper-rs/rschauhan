import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowRight, Briefcase, CalendarCheck, FileCheck2, MapPin, Search, TrendingUp } from 'lucide-react'
import Button from '../ui/Button'

const words = ['Get', 'the', 'Job', 'You', 'Deserve.']
const words2 = ['Hire', 'the', 'Talent', 'You', 'Need.']

const wordAnim = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: (i) => ({ opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.25 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
}

function FloatCard({ className, depth, mx, my, delay = 0, children }) {
  const x = useTransform(mx, (v) => v * depth)
  const y = useTransform(my, (v) => v * depth)
  return (
    <motion.div style={{ x, y }} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + delay, duration: 0.6 }} className={`absolute ${className}`}>
      <div className={`glass rounded-2xl p-4 ${delay ? 'animate-float-slow' : 'animate-float'}`} style={{ animationDelay: `${delay * 2}s` }}>{children}</div>
    </motion.div>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [q, setQ] = useState({ what: '', where: '', exp: '' })

  // pointer position: drives parallax (-0.5..0.5) and the spotlight
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 })
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 })
  const [spot, setSpot] = useState({ x: -999, y: -999 })

  const onMove = (e) => {
    if (reduce || e.pointerType === 'touch') return
    const r = ref.current.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 60)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 60)
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const submit = (e) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q.what) p.set('q', q.what)
    if (q.where) p.set('location', q.where)
    if (q.exp) p.set('exp', q.exp)
    navigate(`/jobs?${p}`)
  }

  return (
    <section ref={ref} onPointerMove={onMove} className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
      {/* animated gradient mesh */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="grid-mask absolute inset-0 opacity-60" />
        <div className="absolute -left-24 top-10 h-96 w-96 animate-blob rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute right-0 top-32 h-[26rem] w-[26rem] animate-blob rounded-full bg-secondary/30 blur-[110px] [animation-delay:-6s]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 animate-blob rounded-full bg-accent/20 blur-[100px] [animation-delay:-12s]" />
        <div className="absolute inset-0 hidden transition-opacity duration-300 md:block"
          style={{ background: `radial-gradient(420px circle at ${spot.x}px ${spot.y}px, rgb(91 75 255 / .12), transparent 60%)` }} />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-primary">
            🚀 India&apos;s Smartest Way to Get Hired &amp; Hire
          </motion.span>

          <h1 className="mt-6 text-[2.25rem] font-extrabold leading-[1.05] sm:text-6xl lg:text-[4.5rem]" aria-label="Get the Job You Deserve. Hire the Talent You Need.">
            <motion.span initial="hidden" animate="show" className="block" aria-hidden>
              {words.map((w, i) => <motion.span key={w + i} custom={i} variants={wordAnim} className="mr-[0.25em] inline-block">{w}</motion.span>)}
            </motion.span>
            <motion.span initial="hidden" animate="show" className="text-gradient block pb-2" aria-hidden>
              {words2.map((w, i) => <motion.span key={w + i} custom={i + 5} variants={wordAnim} className="mr-[0.25em] inline-block">{w}</motion.span>)}
            </motion.span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mx-auto mt-6 max-w-2xl text-base text-muted md:text-lg">
            Apply to open jobs in minutes. Can&apos;t find the right one? Tell us what you want — we&apos;ll find it for you. Companies, tell us who you need — we&apos;ll deliver.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/jobs" size="lg" arrow className="w-full sm:w-auto">Find a Job</Button>
            <Button to="/hire" variant="outline" size="lg" className="w-full sm:w-auto">Hire Talent</Button>
          </motion.div>
        </div>

        {/* search */}
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} role="search"
          className="glass mx-auto mt-10 grid max-w-4xl gap-2 rounded-2xl p-2.5 md:grid-cols-[1.4fr_1fr_0.9fr_auto]">
          <label className="flex items-center gap-3 rounded-xl bg-surface/70 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="sr-only">Job title or skill</span>
            <input value={q.what} onChange={(e) => setQ({ ...q, what: e.target.value })} placeholder="Job title / skill" className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70" />
          </label>
          <label className="flex items-center gap-3 rounded-xl bg-surface/70 px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="sr-only">Location</span>
            <input value={q.where} onChange={(e) => setQ({ ...q, where: e.target.value })} placeholder="Location" className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70" />
          </label>
          <label className="flex items-center gap-3 rounded-xl bg-surface/70 px-4 py-3">
            <Briefcase className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="sr-only">Experience</span>
            <select value={q.exp} onChange={(e) => setQ({ ...q, exp: e.target.value })} className="w-full bg-transparent text-sm outline-none">
              <option value="">Experience</option>
              <option value="0-1">Fresher (0–1 yr)</option>
              <option value="1-3">1–3 years</option>
              <option value="3-5">3–5 years</option>
              <option value="5-10">5–10 years</option>
              <option value="10-40">10+ years</option>
            </select>
          </label>
          <button className="btn btn-primary btn-lg group !py-3">Search <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
        </motion.form>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-6 text-center text-sm text-muted">
          Trusted by <b className="text-fg">200+ companies</b> <span className="mx-2 text-line">|</span> <b className="text-fg">5,000+ candidates</b> placed
        </motion.p>

        {/* floating glass cards — desktop only */}
        <div className="pointer-events-none hidden xl:block" aria-hidden>
          <FloatCard className="left-0 top-4" depth={0.5} mx={mx} my={my}>
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><TrendingUp className="h-5 w-5" /></span>
              <div><p className="font-heading text-lg font-extrabold leading-none">500+</p><p className="text-xs text-muted">Placements this quarter</p></div></div>
          </FloatCard>
          <FloatCard className="right-0 top-16" depth={-0.7} mx={mx} my={my} delay={0.3}>
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success"><FileCheck2 className="h-5 w-5" /></span>
              <div><p className="text-sm font-bold leading-none">Resume received</p><p className="mt-1 text-xs text-muted">Shortlisting in progress</p></div></div>
          </FloatCard>
          <FloatCard className="right-6 top-[24rem]" depth={0.9} mx={mx} my={my} delay={0.6}>
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent"><CalendarCheck className="h-5 w-5" /></span>
              <div><p className="text-sm font-bold leading-none">Interview scheduled</p><p className="mt-1 text-xs text-muted">Tomorrow, 11:00 AM</p></div></div>
          </FloatCard>
        </div>
      </div>
    </section>
  )
}
