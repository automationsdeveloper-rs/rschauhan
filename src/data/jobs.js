// Seed data — mirrors the `jobs` table. Salary in LPA (lakhs per annum), experience in years.
const j = (id, title, company, location, type, mode, smin, smax, emin, emax, skills, industry, daysAgo) => ({
  id: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`, title, company, location, job_type: type, work_mode: mode,
  salary_min: smin, salary_max: smax, exp_min: emin, exp_max: emax, skills, industry, posted_days_ago: daysAgo,
  description: `${company} is hiring a ${title} to join its ${location} team. You will own outcomes, work with cross-functional partners and grow quickly in a high-trust environment.`,
})

export const jobs = [
  j(1, 'Senior React Developer', 'Razorpay', 'Bengaluru', 'Full-time', 'Hybrid', 22, 34, 4, 8, ['React', 'TypeScript', 'Redux'], 'IT & Software', 1),
  j(2, 'Node.js Backend Engineer', 'Zomato', 'Gurugram', 'Full-time', 'Onsite', 18, 28, 3, 6, ['Node.js', 'PostgreSQL', 'AWS'], 'IT & Software', 2),
  j(3, 'Digital Marketing Manager', 'Freshworks', 'Chennai', 'Full-time', 'Hybrid', 12, 18, 4, 7, ['SEO', 'Google Ads', 'Analytics'], 'Sales & Marketing', 2),
  j(4, 'Relationship Manager – Wealth', 'Kotak Mahindra', 'Mumbai', 'Full-time', 'Onsite', 8, 14, 2, 5, ['Sales', 'Wealth Mgmt', 'CRM'], 'Banking & Finance', 3),
  j(5, 'Customer Support Executive', 'Swiggy', 'Hyderabad', 'Full-time', 'Onsite', 3, 5, 0, 2, ['Communication', 'Hindi', 'English'], 'BPO / Customer Support', 1),
  j(6, 'UI/UX Designer', 'Cred', 'Bengaluru', 'Full-time', 'Remote', 16, 26, 3, 6, ['Figma', 'Prototyping', 'Design Systems'], 'IT & Software', 4),
  j(7, 'HR Business Partner', 'Infosys', 'Pune', 'Full-time', 'Hybrid', 10, 16, 5, 8, ['Employee Relations', 'HRIS', 'Talent'], 'HR & Admin', 5),
  j(8, 'Staff Nurse', 'Apollo Hospitals', 'Delhi', 'Full-time', 'Onsite', 3, 5, 1, 4, ['ICU', 'Patient Care', 'BLS'], 'Healthcare', 3),
  j(9, 'Production Supervisor', 'Tata Motors', 'Pune', 'Full-time', 'Onsite', 5, 8, 3, 7, ['Lean', 'Safety', 'Shift Mgmt'], 'Manufacturing', 6),
  j(10, 'Supply Chain Analyst', 'Delhivery', 'Gurugram', 'Full-time', 'Hybrid', 7, 12, 2, 4, ['Excel', 'SQL', 'Forecasting'], 'Logistics', 2),
  j(11, 'Data Analyst', 'Paytm', 'Noida', 'Full-time', 'Hybrid', 10, 16, 2, 5, ['SQL', 'Python', 'Power BI'], 'IT & Software', 1),
  j(12, 'Content Writer (Intern)', 'Meesho', 'Bengaluru', 'Internship', 'Remote', 1, 2, 0, 1, ['Writing', 'SEO', 'Research'], 'Sales & Marketing', 0),
  j(13, 'Hotel Front Office Executive', 'Taj Hotels', 'Jaipur', 'Full-time', 'Onsite', 3, 5, 1, 3, ['Guest Relations', 'PMS', 'English'], 'Hospitality', 4),
  j(14, 'Business Development Executive', 'Zoho', 'Chennai', 'Full-time', 'Onsite', 5, 9, 1, 4, ['B2B Sales', 'Lead Gen', 'Negotiation'], 'Sales & Marketing', 3),
  j(15, 'DevOps Engineer', 'Freshworks', 'Remote', 'Full-time', 'Remote', 20, 32, 4, 8, ['Kubernetes', 'Terraform', 'CI/CD'], 'IT & Software', 5),
  j(16, 'Accounts Executive', 'Deloitte', 'Kolkata', 'Full-time', 'Onsite', 4, 7, 1, 3, ['Tally', 'GST', 'Reconciliation'], 'Banking & Finance', 6),
  j(17, 'School Teacher – Mathematics', 'DPS Group', 'Lucknow', 'Full-time', 'Onsite', 4, 7, 2, 6, ['CBSE', 'Classroom Mgmt', 'B.Ed'], 'Education', 7),
  j(18, 'Warehouse Manager', 'Amazon', 'Bhiwandi', 'Contract', 'Onsite', 8, 13, 5, 9, ['WMS', 'Inventory', 'Team Lead'], 'Logistics', 2),
  j(19, 'Part-time Telecaller', 'PolicyBazaar', 'Gurugram', 'Part-time', 'Onsite', 2, 3, 0, 1, ['Hindi', 'Sales', 'Persuasion'], 'BPO / Customer Support', 1),
  j(20, 'Full Stack Developer', 'Zoho', 'Remote', 'Contract', 'Remote', 15, 24, 3, 6, ['React', 'Node.js', 'MongoDB'], 'IT & Software', 8),
]

// Generic detail copy used when a job has none of its own (seed data + DB rows without these arrays).
export const jobDefaults = {
  responsibilities: ['Own end-to-end delivery of your area of work', 'Collaborate with cross-functional teams to hit quarterly goals', 'Maintain quality, documentation and reporting standards', 'Share knowledge and mentor junior teammates'],
  requirements: ['Relevant experience in a similar role', 'Strong communication and problem-solving skills', 'Ability to work independently and in a team', 'Immediate to 30-day joiners preferred'],
  benefits: ['Competitive salary with annual reviews', 'Health insurance for you and family', 'Learning & development budget', 'Flexible leaves and a friendly culture'],
}

export const postedLabel = (d) => (d === 0 ? 'Today' : d === 1 ? '1 day ago' : `${d} days ago`)
export const salaryLabel = (j) => `₹${j.salary_min}–${j.salary_max} LPA`
export const expLabel = (j) => (j.exp_min === 0 ? `0–${j.exp_max} yrs` : `${j.exp_min}–${j.exp_max} yrs`)
