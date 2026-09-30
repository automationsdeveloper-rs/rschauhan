// Single source of truth for brand + structure. Change the name here and the whole site updates.
// User-facing copy lives in src/i18n/en.js (and hi.js); this file keeps values, icons and links.
export const site = {
  name: 'HireNest',
  tagline: "India's smartest way to get hired & hire.",
  url: 'https://hirenest.example.com',
  email: 'hello@hirenest.example.com',
  phone: '+91 98765 43210',
  whatsapp: '919876543210', // country code + number, no "+"
  address: 'WeWork Galaxy, Residency Road, Bengaluru, Karnataka 560025',
  hours: 'Mon–Sat, 9:30 AM – 7:00 PM IST',
  founded: 2022,
  social: { linkedin: '#', instagram: '#', x: '#' },
}

// Labels come from i18n `nav.<key>`.
export const nav = [
  { key: 'jobs', to: '/jobs' },
  { key: 'employers', to: '/hire' },
  { key: 'how', to: '/#how-it-works' },
  { key: 'pricing', to: '/pricing' },
  { key: 'about', to: '/about' },
  { key: 'contact', to: '/contact' },
]

export const partners = ['Infosys', 'Zomato', 'Razorpay', 'Freshworks', 'Paytm', 'Swiggy', 'Zoho', 'Cred', 'Delhivery', 'Meesho']

// Labels: i18n `stats[i]`
export const stats = [
  { value: 5000, suffix: '+' },
  { value: 200, suffix: '+' },
  { value: 48, suffix: ' hrs' },
  { value: 95, suffix: '%' },
]

// `name` is the value stored on jobs and used by the /jobs filter (always English); display label: i18n `industries.names[i]`
export const industries = [
  { name: 'IT & Software', icon: 'Code2' },
  { name: 'Sales & Marketing', icon: 'Megaphone' },
  { name: 'Banking & Finance', icon: 'Landmark' },
  { name: 'Healthcare', icon: 'HeartPulse' },
  { name: 'Manufacturing', icon: 'Factory' },
  { name: 'BPO / Customer Support', icon: 'Headphones' },
  { name: 'HR & Admin', icon: 'Users' },
  { name: 'Logistics', icon: 'Truck' },
  { name: 'Education', icon: 'GraduationCap' },
  { name: 'Hospitality', icon: 'ConciergeBell' },
]

// Titles/text: i18n `why.tiles[i]`
export const whyUs = [
  { icon: 'Target', span: 'md:col-span-2' },
  { icon: 'ShieldCheck' },
  { icon: 'Zap' },
  { icon: 'BadgeIndianRupee' },
  { icon: 'UserCheck' },
  { icon: 'Lock', span: 'md:col-span-2' },
]

// Pricing lives in /shared/plans.js so the payment API and the UI can never disagree.
export { pricing } from '../../shared/plans.js'

export const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN')
