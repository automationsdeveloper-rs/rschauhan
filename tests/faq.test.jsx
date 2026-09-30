import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FAQList } from '../src/components/home/TestimonialsAndFaq'

const items = [{ q: 'How do I apply?', a: 'Click Apply Now.' }, { q: 'Is it free?', a: 'Yes, applying is free.' }]

describe('FAQList', () => {
  it('opens the first question by default and toggles on click', () => {
    render(<FAQList items={items} />)
    const [first, second] = screen.getAllByRole('button')
    expect(first).toHaveAttribute('aria-expanded', 'true')
    expect(second).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Click Apply Now.')).toBeInTheDocument()

    fireEvent.click(second)
    expect(second).toHaveAttribute('aria-expanded', 'true')
    expect(first).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Yes, applying is free.')).toBeInTheDocument()

    fireEvent.click(second) // collapse the open one
    expect(second).toHaveAttribute('aria-expanded', 'false')
  })
  it('links each trigger to its panel for assistive tech', () => {
    render(<FAQList items={items} />)
    const first = screen.getAllByRole('button')[0]
    expect(document.getElementById(first.getAttribute('aria-controls'))).not.toBeNull()
  })
})
