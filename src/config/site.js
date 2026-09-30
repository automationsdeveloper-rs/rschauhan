// Single source of truth for brand + content. Change the name here and the whole site updates.
export const site = {
  name: 'HireNest',
  tagline: "India's smartest way to get hired & hire.",
  url: 'https://hirenest.example.com',
  email: 'hello@hirenest.example.com',
  phone: '+91 98765 43210',
  whatsapp: '919876543210', // country code + number, no "+"
  address: 'WeWork Galaxy, Residency Road, Bengaluru, Karnataka 560025',
  hours: 'Mon–Sat, 9:30 AM – 7:00 PM IST',
  social: { linkedin: '#', instagram: '#', x: '#' },
}

export const nav = [
  { label: 'Find Jobs', to: '/jobs' },
  { label: 'For Employers', to: '/hire' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const partners = ['Infosys', 'Zomato', 'Razorpay', 'Freshworks', 'Paytm', 'Swiggy', 'Zoho', 'Cred', 'Delhivery', 'Meesho']

export const stats = [
  { value: 5000, suffix: '+', label: 'Candidates Placed' },
  { value: 200, suffix: '+', label: 'Hiring Partners' },
  { value: 48, suffix: ' hrs', label: 'Avg. First Profile Delivery' },
  { value: 95, suffix: '%', label: 'Client Satisfaction' },
]

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

export const steps = {
  candidates: [
    { title: 'Browse or request a job', text: 'Explore open roles — or tell us the job you want and we hunt for it.' },
    { title: 'Upload your CV & details', text: 'A 2-minute form. Your CV is stored privately and securely.' },
    { title: 'We shortlist & match you', text: 'Our recruiters match your profile to the right openings and employers.' },
    { title: 'Interview & get hired', text: 'We coordinate interviews and support you until the offer letter.' },
  ],
  employers: [
    { title: 'Submit your requirement', text: 'Position, budget, experience, skills — share what you need.' },
    { title: 'We source & screen', text: 'Recruiters search, call and verify candidates against your brief.' },
    { title: 'Receive shortlisted profiles', text: 'First verified profiles land in your dashboard within 48 hours.' },
    { title: 'Interview & hire', text: 'Pick your favourites, schedule interviews, close the position.' },
  ],
}

export const whyUs = [
  { icon: 'Target', title: 'Custom Job Requests', text: "Can't find your job? We hunt it for you.", span: 'md:col-span-2' },
  { icon: 'ShieldCheck', title: 'Verified Profiles', text: 'Every candidate is screened.' },
  { icon: 'Zap', title: 'Fast Turnaround', text: 'First profiles within 48 hours.' },
  { icon: 'BadgeIndianRupee', title: 'Transparent Pricing', text: 'No hidden charges.' },
  { icon: 'UserCheck', title: 'Dedicated Recruiter', text: 'One point of contact.' },
  { icon: 'Lock', title: 'Data Privacy', text: 'Your CV and details are secure.', span: 'md:col-span-2' },
]

// Pricing lives in /shared/plans.js so the payment API and the UI can never disagree.
export { pricing } from '../../shared/plans.js'

export const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN')
