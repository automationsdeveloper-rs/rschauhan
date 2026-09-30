import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/** Renders a router <Link>, <a> or <button> with the shared button styles. */
export default function Button({ variant = 'primary', size, to, href, arrow = false, className = '', children, ...rest }) {
  const cls = `btn btn-${variant} ${size === 'lg' ? 'btn-lg' : ''} ${arrow ? 'group' : ''} ${className}`
  const content = (
    <>
      {children}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />}
    </>
  )
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>
  return <button className={cls} {...rest}>{content}</button>
}
