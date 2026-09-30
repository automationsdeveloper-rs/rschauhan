import { describe, it, expect } from 'vitest'
import { pricing, getPlan, breakdown, GST_RATE } from '../shared/plans.js'

describe('pricing', () => {
  it('adds 18% GST in whole rupees', () => {
    expect(GST_RATE).toBe(0.18)
    expect(breakdown(999)).toEqual({ subtotal: 999, gst: 180, total: 1179 })
    expect(breakdown(2999)).toEqual({ subtotal: 2999, gst: 540, total: 3539 })
  })
  it('looks plans up by kind and id', () => {
    expect(getPlan('employer', 'growth').maxPositions).toBe(5)
    expect(getPlan('candidate', 'priority').popular).toBe(true)
    expect(getPlan('candidate', 'nope')).toBeUndefined()
    expect(getPlan('nope', 'basic')).toBeUndefined()
  })
  it('has exactly one popular plan per side and a priced plan cheaper than the next', () => {
    for (const kind of ['candidate', 'employer']) {
      expect(pricing[kind].filter((p) => p.popular)).toHaveLength(1)
      const priced = pricing[kind].filter((p) => p.price != null).map((p) => p.price)
      expect(priced).toEqual([...priced].sort((a, b) => a - b))
      pricing[kind].forEach((p) => expect(p.features.length).toBeGreaterThanOrEqual(3))
    }
  })
})
