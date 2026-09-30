import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

/** Temporary stub for routes built in later phases; also used as the 404 page. */
export default function ComingSoon({ title = 'Coming soon', phase, notFound = false }) {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden px-4 pt-24">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 animate-blob rounded-full bg-primary/25 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 animate-blob rounded-full bg-secondary/25 blur-[100px] [animation-delay:-7s]" />
      <div className="relative text-center">
        <motion.p initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160 }}
          className="text-gradient font-heading text-8xl font-extrabold md:text-9xl">{notFound ? '404' : '🚧'}</motion.p>
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">{notFound ? "This page took a wrong turn" : title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{notFound ? "The page you're looking for doesn't exist or has moved." : `This page is being built in ${phase}. Say "continue" to get there.`}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button to="/" arrow>Back to Home</Button>
          <Link to="/jobs" className="btn btn-outline">Browse Jobs</Link>
        </div>
      </div>
    </section>
  )
}
