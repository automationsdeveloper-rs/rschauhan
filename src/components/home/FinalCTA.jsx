import Button from '../ui/Button'
import { Reveal } from '../ui/Motion'

export default function FinalCTA() {
  return (
    <section className="container section">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-6 py-16 text-center text-white shadow-glow md:py-24">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 animate-blob rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 animate-blob rounded-full bg-accent/40 blur-3xl [animation-delay:-8s]" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold md:text-5xl">Ready to make your next big move?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/85">Join thousands who found their fit — or their next great hire — with HireNest.</p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/jobs" variant="white" size="lg" arrow>Find a Job</Button>
            <Button to="/hire" variant="accent" size="lg">Hire Talent</Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
