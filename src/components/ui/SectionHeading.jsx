import { Reveal } from './Motion'

export default function SectionHeading({ eyebrow, title, text, center = true }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="h-section">{title}</h2>
      {text && <p className={`p-section ${center ? 'mx-auto' : ''}`}>{text}</p>}
    </Reveal>
  )
}
