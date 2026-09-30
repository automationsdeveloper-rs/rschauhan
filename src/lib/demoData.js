// Sample data so dashboards can be previewed without Supabase keys (read-only).
import { jobs } from '../data/jobs'

const day = (n) => new Date(Date.now() - n * 864e5).toISOString()
const id = (p, n) => `${p}-0000-4000-8000-${String(n).padStart(12, '0')}`
const skillsPool = [['React', 'TypeScript', 'Node.js'], ['SQL', 'Python', 'Power BI'], ['Sales', 'CRM', 'Negotiation'], ['Figma', 'UX', 'Prototyping'], ['Java', 'Spring', 'AWS'], ['SEO', 'Content', 'Analytics']]
const names = ['Ananya Sharma', 'Rohit Verma', 'Sneha Iyer', 'Karan Mehta', 'Pooja Nair', 'Amit Deshmukh', 'Riya Kapoor', 'Vikram Singh', 'Neha Gupta', 'Arjun Reddy']
const cities = ['Bengaluru', 'Mumbai', 'Pune', 'Delhi', 'Hyderabad', 'Chennai']

export const demoCandidates = names.map((n, i) => ({
  id: id('c', i + 1), user_id: null, full_name: n, email: n.toLowerCase().replace(' ', '.') + '@example.com', phone: '+9198765' + (10000 + i * 37),
  city: cities[i % 6], experience_years: 1 + (i % 8), current_company: ['Infosys', 'Zoho', 'Paytm'][i % 3], designation: 'Associate',
  current_ctc: 6 + i, expected_ctc: 9 + i * 1.5, notice_period: ['Immediate', '30 days', '60 days'][i % 3], skills: skillsPool[i % 6], qualification: "Bachelor's degree",
  linkedin_url: null, cv_url: null, created_at: day(i * 3 + 1),
}))

export const demoApplications = Array.from({ length: 24 }, (_, i) => ({
  id: id('a', i + 1), job_id: jobs[i % 20].id, candidate_id: demoCandidates[i % 10].id, cover_note: null, cv_url: null,
  status: ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'][i % 6], created_at: day(i * 1.2),
  jobs: { title: jobs[i % 20].title, company_name: jobs[i % 20].company, location: jobs[i % 20].location },
  candidates: demoCandidates[i % 10],
}))

export const demoCandRequests = Array.from({ length: 6 }, (_, i) => ({
  id: id('r', i + 1), request_code: `HN-JR-DEMO${100 + i}`, desired_role: ['Product Designer', 'Data Analyst', 'Sales Manager', 'DevOps Engineer', 'HR Executive', 'Accountant'][i],
  industry: 'IT & Software', preferred_locations: ['Bengaluru', 'Remote'], expected_salary: 10 + i * 2, plan: ['basic', 'priority', 'premium'][i % 3],
  payment_status: ['paid', 'paid', 'pending', 'paid', 'failed', 'paid'][i], status: ['submitted', 'in_progress', 'submitted', 'matches_shared', 'submitted', 'closed'][i],
  assigned_recruiter: i % 2 ? 'Priya' : null, admin_notes: null, created_at: day(i * 4 + 2), candidates: demoCandidates[i],
}))

const positions = [
  { id: id('p', 1), request_id: id('e', 1), job_title: 'Senior React Developer', openings: 2, employment_type: 'Full-time', work_mode: 'Hybrid', location: 'Bengaluru', urgency: '15 days', exp_min: 4, exp_max: 8, budget_min: 20, budget_max: 32, skills: ['React', 'TypeScript'] },
  { id: id('p', 2), request_id: id('e', 1), job_title: 'QA Engineer', openings: 1, employment_type: 'Full-time', work_mode: 'Onsite', location: 'Bengaluru', urgency: '30 days', exp_min: 2, exp_max: 5, budget_min: 8, budget_max: 14, skills: ['Selenium', 'API testing'] },
]
export const demoEmployerRequests = [
  { id: id('e', 1), request_code: 'HN-HR-DEMO201', plan: 'growth', payment_status: 'paid', status: 'profiles_shared', assigned_recruiter: 'Priya', admin_notes: null, created_at: day(6), employers: { company_name: 'Acme Technologies', contact_person: 'Ravi Menon', email: 'ravi@acme.example', phone: '+919812300000' }, employer_positions: positions },
  { id: id('e', 2), request_code: 'HN-HR-DEMO202', plan: 'single', payment_status: 'paid', status: 'in_progress', assigned_recruiter: null, admin_notes: null, created_at: day(2), employers: { company_name: 'BrightPath EdTech', contact_person: 'Karan Mehta', email: 'karan@brightpath.example', phone: '+919811100000' }, employer_positions: [{ ...positions[0], id: id('p', 3), request_id: id('e', 2), job_title: 'Content Lead' }] },
  { id: id('e', 3), request_code: 'HN-HR-DEMO203', plan: 'enterprise', payment_status: 'pending', status: 'submitted', assigned_recruiter: null, admin_notes: null, created_at: day(1), employers: { company_name: 'Nexa Logistics', contact_person: 'Rohit Verma', email: 'rohit@nexa.example', phone: '+919899900000' }, employer_positions: [{ ...positions[1], id: id('p', 4), request_id: id('e', 3), job_title: 'Warehouse Manager', openings: 12 }] },
]

export const demoMatches = [0, 1, 2].map((i) => ({
  match_id: id('m', i + 1), position_id: positions[0].id, request_id: id('e', 1), status: ['shared', 'shortlisted', 'shared'][i], shared_at: day(i + 1),
  full_name: demoCandidates[i].full_name, city: demoCandidates[i].city, experience_years: demoCandidates[i].experience_years, current_company: demoCandidates[i].current_company,
  designation: 'Senior Developer', expected_ctc: demoCandidates[i].expected_ctc, notice_period: demoCandidates[i].notice_period, skills: demoCandidates[i].skills, qualification: demoCandidates[i].qualification, cv_url: null,
}))

const planPrice = { basic: 499, priority: 999, premium: 1999, single: 2999, growth: 9999 }
export const demoPayments = [
  ...demoCandRequests.filter((r) => r.payment_status === 'paid').map((r, i) => ({ id: id('y', i + 1), type: 'candidate_request', reference_id: r.id, amount: Math.round(planPrice[r.plan] * 1.18), status: 'paid', razorpay_order_id: 'order_DEMO' + i, razorpay_payment_id: 'pay_DEMO' + i, created_at: r.created_at, ref: r.request_code, plan: r.plan })),
  ...demoEmployerRequests.filter((r) => r.payment_status === 'paid').map((r, i) => ({ id: id('y', i + 20), type: 'employer_request', reference_id: r.id, amount: Math.round(planPrice[r.plan] * 1.18), status: 'paid', razorpay_order_id: 'order_DEMOE' + i, razorpay_payment_id: 'pay_DEMOE' + i, created_at: r.created_at, ref: r.request_code, plan: r.plan })),
]

export const demoNotifications = [
  { id: id('n', 1), title: 'Application update: Shortlisted 🎉', body: 'Your application for Senior React Developer at Razorpay is now "Shortlisted".', read: false, created_at: day(0.2) },
  { id: id('n', 2), title: 'Job request HN-JR-DEMO101: In Progress', body: 'Our recruiter has started searching for your role.', read: true, created_at: day(3) },
]

export const demoJobs = jobs.map((j) => ({ ...j, company_name: j.company, status: 'open', created_at: day(j.posted_days_ago) }))
