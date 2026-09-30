// Single source of truth for pricing. Imported by the UI AND by the payment API,
// so the amount charged is always decided on the server from these values.
export const GST_RATE = 0.18

export const pricing = {
  candidate: [
    { id: 'basic', name: 'Basic Request', price: 499, unit: 'one-time', tagline: 'Get started with a single request', features: ['1 job request', 'Profile shared with our recruiters', 'Email updates'] },
    { id: 'priority', name: 'Priority Request', price: 999, unit: 'one-time', popular: true, tagline: 'Faster matching, more support', features: ['1 job request', 'Priority matching', 'Resume review tips', 'Interview support', 'Email + WhatsApp updates'] },
    { id: 'premium', name: 'Premium Career Support', price: 1999, unit: 'one-time', tagline: 'Full-service career partner', features: ['Multiple job requests', 'Dedicated recruiter', 'Resume rewrite', 'Mock interview', 'Priority matching', 'Email + WhatsApp updates'] },
  ],
  employer: [
    { id: 'single', name: 'Single Position', price: 2999, unit: 'per request', maxPositions: 1, tagline: 'Fill one role quickly', features: ['1 position', 'Verified profiles in 48 hrs', 'Recruiter follow-up', 'Or % of annual CTC on success'] },
    { id: 'growth', name: 'Growth', price: 9999, unit: 'up to 5 positions', popular: true, maxPositions: 5, tagline: 'For teams hiring across roles', features: ['Up to 5 positions', 'Dedicated recruiter', 'Priority sourcing', 'Employer dashboard', 'Replacement guarantee'] },
    { id: 'enterprise', name: 'Enterprise', price: null, unit: 'custom pricing', maxPositions: 100, tagline: 'Bulk & ongoing hiring', features: ['Bulk hiring', 'Dedicated account manager', 'Custom SLAs', 'Volume discounts', 'Quarterly hiring plans'] },
  ],
}

export const getPlan = (kind, id) => pricing[kind]?.find((p) => p.id === id)

/** Whole-rupee amounts. Charged total = price + GST. */
export function breakdown(price) {
  const gst = Math.round(price * GST_RATE)
  return { subtotal: price, gst, total: price + gst }
}
