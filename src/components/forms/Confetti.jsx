import { useEffect } from 'react'
import confetti from 'canvas-confetti'

/** Fires a burst once on mount (skipped for reduced-motion users). */
export default function Confetti() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const colors = ['#5B4BFF', '#22D3EE', '#FF7A45', '#16A34A']
    const end = Date.now() + 1200
    ;(function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
      confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
  }, [])
  return null
}
