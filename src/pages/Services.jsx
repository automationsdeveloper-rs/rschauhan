import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Laptop, Scale, Receipt, BookOpen, Building2, CheckCircle2, ShieldCheck,
  ArrowRight, Clock, Sparkles, Calculator, Check, ChevronDown, ChevronRight,
  PhoneCall, FileText, Landmark, Shield, Award, HelpCircle, Layers, Zap,
  Briefcase, HeartHandshake, UserCheck, BarChart3, Fingerprint, Calendar
} from 'lucide-react'
import { Reveal, Stagger, StaggerItem, TiltCard } from '../components/ui/Motion'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'
import { site } from '../config/site'
import { useSeo } from '../lib/hooks'
import { useToast } from '../context/ToastContext'

const pillars = [
  {
    id: 'recruitment',
    icon: Users,
    badge: 'Talent Acquisition',
    title: 'Recruitment & Executive Search',
    tagline: 'Pre-screened, interview-ready candidates delivered within 48 hours.',
    description: 'We eliminate the resume black hole. Our domain-specialized recruiters source, screen, and interview candidates across IT, BFSI, Sales, Healthcare, and Operations so your hiring managers only talk to top-tier finalists.',
    highlights: [
      'Permanent & Contract Staffing across all experience tiers',
      'Executive Search for VP, Director & C-Suite leadership roles',
      'High-volume hiring drives for customer support, sales & operations',
      'Recruitment Process Outsourcing (RPO) with dedicated onsite/remote recruiters',
      '48-Hour delivery SLA for initial shortlisted and verified profiles',
      '90-Day free candidate replacement guarantee on all permanent placements',
    ],
    deliverables: ['Custom JD formulation', 'Skills assessment screening', 'Culture-fit evaluation', 'Salary negotiation & offer rollout support'],
    stat: '48 hrs',
    statLabel: 'Avg. First Profile Delivery',
    cta: 'Hire Talent Now',
    link: '/hire',
  },
  {
    id: 'hrms',
    icon: Laptop,
    badge: 'HR Tech & Operations',
    title: 'Cloud HRMS & Digital Workplace Implementation',
    tagline: 'Modern, automated HR infrastructure built for growing Indian enterprises.',
    description: 'Replace fragmented spreadsheets and legacy desktop software with a centralized cloud HRMS. We configure, implement, and train your team on end-to-end employee lifecycle automation — from offer letters to exits.',
    highlights: [
      'Centralized digital employee records (single source of truth for KYC & contracts)',
      'Geo-fenced mobile attendance & biometric machine synchronization',
      'Automated leave policies with multi-tier approval workflows & sandwich rules',
      'Employee Self-Service (ESS) mobile app for payslips, leaves, & tax declarations',
      'Performance Management System (PMS) supporting OKRs, KPIs & 360° reviews',
      'Digital onboarding, asset management, and online exit clearance processes',
    ],
    deliverables: ['Full system rollout & data migration', 'Manager & employee training', 'Custom workflow setup', 'Biometric device API integration'],
    stat: '100%',
    statLabel: 'Paperless HR Workflow',
    cta: 'Request HRMS Demo',
    link: '/contact?service=hrms',
  },
  {
    id: 'compliance',
    icon: Scale,
    badge: '100% Indian Labor Law',
    title: 'Statutory Compliance (EPF, ESI, PT, LWF)',
    tagline: 'Zero-penalty, audit-ready labor law compliance across all Indian states.',
    description: 'Indian labor laws are intricate, heavily regulated, and frequently updated. We provide complete statutory governance, handling registrations, monthly ECR challan filings, registers maintenance, and annual audits.',
    highlights: [
      'EPFO Management: Registration, monthly ECR generation, UAN generation & member KYC',
      'ESIC Management: Registration, monthly contribution filing, TIC cards & branch coordination',
      'Professional Tax (PT): Multi-state slab deductions, registration & timely returns filing',
      'Labour Welfare Fund (LWF): State-specific half-yearly & annual remittance compliance',
      'POSH Compliance: Internal Complaints Committee (ICC) constitution, policy drafting & sensitization training',
      'Factories & Shops & Establishments Act: Trade licenses, renewals, and statutory register maintenance (Forms A-D)',
    ],
    deliverables: ['Monthly statutory inspection clearance', 'Quarterly compliance health audits', 'Zero-notice penalty guarantee', 'Liaison with labor commissioners'],
    stat: 'Zero',
    statLabel: 'Notice & Penalty Guarantee',
    cta: 'Get Compliance Audit',
    link: '/contact?service=compliance',
  },
  {
    id: 'payroll',
    icon: Receipt,
    badge: 'Managed Cloud Payroll',
    title: 'End-to-End Payroll & Tax Administration',
    tagline: 'Guaranteed accurate, on-time salary disbursements with automated TDS & Form 16.',
    description: 'Payroll is not just math; it is your employee trust index. Our managed payroll service guarantees on-time processing, tax-optimized salary structures, compliant deductions, direct bank integration, and instantaneous payslip dispatch.',
    highlights: [
      'Gross-to-Net processing with automated statutory deductions (PF, ESI, PT, TDS)',
      'Tax-optimized CTC structuring (HRA, Standard Deduction, LTA, NPS, Flexi Benefits)',
      'One-click password-protected payslip generation delivered via email & WhatsApp',
      'Direct bank disbursement files compatible with HDFC, ICICI, SBI, Axis, and all major banks',
      'TDS tax computation, monthly tax deposit challans, and quarterly Form 24Q e-filing',
      'Full and Final (F&F) settlement processing with gratuity, leave encashment & recovery',
    ],
    deliverables: ['Digitally signed Form 16 (Part A & B)', 'Monthly payroll variance reports', 'Employee tax query resolution desk', 'Reimbursement & claims approval audit'],
    stat: '99.99%',
    statLabel: 'Disbursement Accuracy',
    cta: 'Outsource Payroll',
    link: '/contact?service=payroll',
  },
  {
    id: 'policy',
    icon: BookOpen,
    badge: 'Policy & Architecture',
    title: 'HR Policy Engineering & SOP Implementation',
    tagline: 'Transform unorganized operations into structured, scalable company culture.',
    description: 'A growing company needs clear rules of engagement. We formulate comprehensive HR policy handbooks, employment agreements, code of conduct, grading hierarchies, and performance frameworks aligned with Indian employment law.',
    highlights: [
      'Customized Employee Handbook & Code of Conduct tailored to your industry',
      'Job evaluation, organizational leveling, designation mapping & salary banding',
      'Standard Operating Procedures (SOPs) for recruitment, onboarding, probation & exit',
      'Transparent appraisal cycles, incentive scheme design, and OKR alignment',
      'Disciplinary protocols, grievance redressal mechanisms, and termination guidelines',
      'Workplace diversity, equity, and remote work policy formulation',
    ],
    deliverables: ['Signed legal policy drafts', 'Manager execution guidelines', 'Employee agreement templates', 'Culture & retention strategy toolkit'],
    stat: '14 Days',
    statLabel: 'Turnkey Policy Rollout',
    cta: 'Design HR Policies',
    link: '/contact?service=policy',
  },
  {
    id: 'outsourcing',
    icon: Building2,
    badge: 'Plug-and-Play HR',
    title: 'Virtual HR Department / Complete HR Outsourcing',
    tagline: 'Your complete HR department on demand — saving up to 70% in internal overheads.',
    description: 'Designed specifically for MSMEs, high-growth startups, and branch offices. Get a senior HR Business Partner (HRBP) and dedicated operations desk handling recruitment, daily HR queries, payroll, and compliance at a fraction of the cost.',
    highlights: [
      'Dedicated HR Business Partner (HRBP) acting as your virtual Chief People Officer',
      'All-inclusive operations: Talent sourcing, HR tech, payroll, compliance, and employee support',
      'Seamless scaling from 5 to 500+ employees without adding internal HR headcount',
      'Single monthly subscription model with no surprise costs or hidden legal retainers',
      'Employee helpline for prompt resolution of queries regarding PF, tax, and benefits',
      'Monthly strategic workforce analytics, attrition monitoring, and leadership reviews',
    ],
    deliverables: ['Weekly leadership briefing', 'Complete HR operational ownership', 'Zero employer liability for HR errors', 'Dedicated account manager'],
    stat: '70%',
    statLabel: 'Cost Savings vs In-House HR',
    cta: 'Explore Virtual HR',
    link: '/contact?service=outsourcing',
  },
]

const complianceBadges = [
  { name: 'EPFO India', desc: 'Provident Fund & Pension (UAN/ECR)' },
  { name: 'ESIC India', desc: 'State Insurance & Medical Benefits' },
  { name: 'Income Tax Dept', desc: 'Form 24Q, TDS & Form 16 Automation' },
  { name: 'Professional Tax', desc: 'Compliant across all 28 States' },
  { name: 'POSH Act 2013', desc: 'ICC Formulation & Training' },
  { name: 'Payment of Bonus & Gratuity', desc: 'Strict Statutory Compliance' },
  { name: 'Shops & Est. Act', desc: 'Multi-location Registrations' },
]

const comparisonData = [
  {
    feature: 'Monthly Cost',
    inHouse: 'High (Multiple salaries for HR Manager, Payroll Exec & Legal advisor)',
    fragmented: 'Medium-High (Separate bills from hiring agencies, CAs & legal retainers)',
    hirenest: 'Low & Transparent (Predictable flat monthly retainer covering all services)',
  },
  {
    feature: 'Hiring Turnaround',
    inHouse: '30–45 Days (Dependent on recruiter network & job boards)',
    fragmented: '15–30 Days (High agency fees per placement: 8.33%–15%)',
    hirenest: '48 Hours to First Profiles (Pre-vetted active talent network)',
  },
  {
    feature: 'Statutory Compliance Accountability',
    inHouse: 'Manual risks (Penalties fall 100% on company directors)',
    fragmented: 'Uncoordinated (CA blames HR, HR blames legal for delays)',
    hirenest: '100% Guaranteed & Audit-Ready (Dedicated compliance team)',
  },
  {
    feature: 'HR Technology (HRMS)',
    inHouse: 'Separate software subscription cost (₹75–₹150/user/month)',
    fragmented: 'Disjointed spreadsheets or incompatible disparate tools',
    hirenest: 'Included & Pre-Configured (Modern cloud HRMS + Mobile ESS app)',
  },
  {
    feature: 'Scalability',
    inHouse: 'Slow to scale up or down as company workforce fluctuates',
    fragmented: 'Requires managing multiple vendor contracts and SLAs',
    hirenest: 'Elastic (Instantly scales from 5 to 500+ employees seamlessly)',
  },
]

const serviceFaqs = [
  {
    q: 'When does my company legally need to register for EPF and ESIC in India?',
    a: 'In India, EPF (Employees’ Provident Fund) registration is mandatory once your establishment reaches 20 or more employees (though voluntary registration is available below 20). ESIC (Employees’ State Insurance Corporation) is applicable to establishments with 10 or more employees (20 in some states) whose gross monthly wage is under ₹21,000. HireNest handles both fresh registrations and continuous monthly return filings with zero delay.',
  },
  {
    q: 'How does your 48-Hour Talent Delivery guarantee work?',
    a: 'Unlike traditional agencies that post ads after you contact them, HireNest maintains a continuously refreshed, pre-vetted talent pool across IT, BFSI, Sales, Operations, and Healthcare. When you raise a hiring requirement, our dedicated recruiters conduct instant skill verification and telephonic screening, delivering interview-ready profiles to your dashboard within 48 hours.',
  },
  {
    q: 'Can we hire you only for Payroll & Compliance if we already have an internal HR team?',
    a: 'Yes, absolutely. Our solutions are completely modular. Many of our enterprise and mid-market clients use HireNest solely for managed payroll execution, multi-state PF/ESI compliance, and statutory audit representation while retaining their internal recruiters.',
  },
  {
    q: 'How do you handle multi-state Professional Tax (PT) and Shops & Establishments registrations?',
    a: 'Professional Tax laws, slabs, and return due dates differ dramatically between Maharashtra, Karnataka, Telangana, West Bengal, Tamil Nadu, and other states. HireNest manages multi-state registrations, computes state-specific deductions automatically, and remits returns to the respective state commercial tax departments on time.',
  },
  {
    q: 'What is included in your Virtual HR Department / HR Outsourcing model?',
    a: 'Our Virtual HR model acts as your full people department. You get an assigned Senior HR Business Partner who manages employee onboarding, attendance, leave approvals, monthly payroll computations, statutory filings, employee grievances, policy implementation, and exit clearance. It is the ideal setup for startups and MSMEs with 10 to 250 employees.',
  },
  {
    q: 'How secure is our employee and salary data?',
    a: 'We adhere to stringent enterprise data privacy standards. All salary, PAN, Aadhaar, and bank records are encrypted at rest with AES-256 and transmitted over TLS 1.3. We execute strict Non-Disclosure Agreements (NDAs) prior to onboarding and comply with the Digital Personal Data Protection (DPDP) Act.',
  },
]

export default function Services() {
  useSeo({
    title: 'Complete HR Solutions, HRMS, Payroll & Statutory Compliance — HireNest',
    description: 'Transform your workforce operations: Cloud HRMS implementation, 100% Indian statutory compliance (EPF, ESI, PT), managed payroll, verified recruitment, and complete virtual HR outsourcing.',
  })

  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('recruitment')
  const [companySize, setCompanySize] = useState('11-25')
  const [selectedModules, setSelectedModules] = useState(['hrms', 'payroll', 'compliance'])
  const [openFaq, setOpenFaq] = useState(null)

  const toggleModule = (id) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((m) => m !== id) : prev) : [...prev, id]
    )
  }

  const activePillar = pillars.find((p) => p.id === activeTab) || pillars[0]

  const getEstimatedTimeline = () => {
    if (selectedModules.length <= 2) return '3–5 Business Days'
    if (selectedModules.length <= 4) return '5–7 Business Days'
    return '7–10 Business Days'
  }

  return (
    <div className="pb-24 pt-28 md:pt-36">
      {/* 1. HERO SECTION */}
      <section className="container">
        <Reveal className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Complete 360° HR Operations & Workforce Ecosystem
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-[4.25rem] leading-[1.15]">
            Power Your People Operations. <br />
            <span className="text-gradient">From Hiring to 100% Compliance.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted md:text-xl leading-relaxed">
            Stop juggling fragmented agencies, complicated payroll spreadsheets, and penalty risks.
            HireNest combines <strong>verified talent acquisition</strong>, <strong>modern cloud HRMS</strong>, 
            <strong> zero-error payroll</strong>, and <strong>full statutory compliance (EPF, ESI, PT, POSH)</strong> into one unified operating system.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button to="/hire" size="lg" arrow>Hire Verified Talent</Button>
            <Button to="/contact?service=complete" variant="outline" size="lg">Book Free HR Consultation</Button>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-line/60 pt-8 sm:grid-cols-4">
            <div className="p-2 text-center">
              <p className="font-heading text-2xl font-extrabold text-primary md:text-3xl">48 Hrs</p>
              <p className="mt-1 text-xs text-muted font-medium">Candidate Delivery SLA</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-heading text-2xl font-extrabold text-secondary md:text-3xl">100%</p>
              <p className="mt-1 text-xs text-muted font-medium">EPF, ESI & PT Compliant</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-heading text-2xl font-extrabold text-accent md:text-3xl">Zero</p>
              <p className="mt-1 text-xs text-muted font-medium">Statutory Penalties</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-heading text-2xl font-extrabold text-success md:text-3xl">70%</p>
              <p className="mt-1 text-xs text-muted font-medium">HR Cost Savings</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 2. STATUTORY ECOSYSTEM MARQUEE */}
      <section className="mt-16 border-y border-line bg-surface/50 py-6" aria-label="Statutory frameworks">
        <div className="container">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted">
            100% Audit-Ready Compliance Under Indian Regulatory Authorities
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {complianceBadges.map((b) => (
              <div key={b.name} className="glass flex items-center gap-2.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition hover:border-primary/40">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-fg">{b.name}</span>
                  <span className="ml-1 text-muted hidden sm:inline">• {b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 6 PILLARS DEEP-DIVE */}
      <section className="container mt-20 md:mt-28">
        <SectionHeading
          eyebrow="Our Solutions Architecture"
          title="Everything Your HR Department Needs to Scale"
          text="Whether you are an ambitious early-stage startup or a multi-location enterprise with hundreds of employees, choose individual modules or our complete full-service HR outsourcing."
        />

        {/* Tab Buttons */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {pillars.map((p) => {
            const Icon = p.icon
            const isSelected = activeTab === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-gradient-ui text-white shadow-glow scale-[1.02]'
                    : 'card text-fg/80 hover:border-primary/40 hover:text-fg'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                <span>{p.badge}</span>
              </button>
            )
          })}
        </div>

        {/* Active Tab Content Card */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="card relative overflow-hidden p-8 md:p-12 shadow-soft"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

              <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <span className="eyebrow">{activePillar.badge}</span>
                  <h3 className="text-2xl font-extrabold md:text-4xl text-fg">{activePillar.title}</h3>
                  <p className="mt-2 text-base font-semibold text-primary">{activePillar.tagline}</p>
                  <p className="mt-4 leading-relaxed text-muted">{activePillar.description}</p>

                  <h4 className="mt-8 text-sm font-bold uppercase tracking-wider text-fg">Core Capabilities & Scope</h4>
                  <ul className="mt-4 space-y-3">
                    {activePillar.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-normal">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span className="text-fg/90">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Button to={activePillar.link} arrow>{activePillar.cta}</Button>
                    <Link to="/contact" className="text-sm font-semibold text-muted hover:text-primary transition">
                      Schedule a Specialist Consultation →
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface/50 p-6 md:p-8">
                  <div>
                    <div className="flex items-baseline justify-between border-b border-line pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{activePillar.statLabel}</p>
                        <p className="text-gradient font-heading text-4xl font-extrabold">{activePillar.stat}</p>
                      </div>
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <activePillar.icon className="h-6 w-6" />
                      </span>
                    </div>

                    <h5 className="mt-6 text-sm font-bold text-fg">Tangible Business Deliverables:</h5>
                    <div className="mt-3 space-y-2.5">
                      {activePillar.deliverables.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-xs font-medium border border-line/60">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl bg-primary/5 p-4 border border-primary/15">
                    <p className="text-xs font-semibold text-primary">💡 Pro Tip for Indian Employers</p>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      Non-compliance with EPF, ESIC or PT can result in penal damages up to 25% per annum plus legal notices. Our managed framework provides 100% statutory indemnity.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 4. INTERACTIVE SOLUTION CALCULATOR & ESTIMATOR */}
      <section className="container mt-24 md:mt-32">
        <div className="card overflow-hidden bg-gradient-to-br from-surface via-surface to-primary/5 p-8 md:p-14 border border-line shadow-soft">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow"><Calculator className="inline h-3.5 w-3.5 mr-1" /> Solution Configurator</span>
            <h2 className="text-3xl font-extrabold md:text-5xl">Configure Your Custom HR Infrastructure</h2>
            <p className="mt-4 text-base text-muted">Select your employee strength and desired operational modules to calculate your recommended setup and turnaround timeline.</p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {/* Left: Interactive Controls */}
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-fg mb-3">1. Select Your Team Size</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['1–10', '11–25', '26–50', '51–200'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setCompanySize(size)}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold transition border ${
                        companySize === size
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                          : 'border-line bg-surface text-muted hover:border-primary/40'
                      }`}
                    >
                      {size} People
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-fg mb-3">2. Select Modules Needed</label>
                <div className="space-y-2.5">
                  {[
                    { id: 'hrms', label: 'Cloud HRMS & Mobile Attendance App', desc: 'Central employee records, biometric sync, leave automation' },
                    { id: 'payroll', label: 'Managed Monthly Payroll & Form 16', desc: 'Accurate salary calculations, payslip dispatch, bank disbursement' },
                    { id: 'compliance', label: '100% EPF, ESIC & PT Statutory Compliance', desc: 'Monthly ECR filing, UAN, ESIC challans, zero penalty SLA' },
                    { id: 'recruitment', label: 'Talent Acquisition & Hiring Pipeline', desc: '48-hour verified candidate delivery across key job roles' },
                    { id: 'policy', label: 'HR Policy Handbook & SOP Engineering', desc: 'Employee contracts, appraisal cycles, code of conduct' },
                  ].map((m) => {
                    const checked = selectedModules.includes(m.id)
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleModule(m.id)}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                          checked ? 'border-primary/50 bg-primary/[0.04]' : 'border-line bg-surface hover:border-line'
                        }`}
                      >
                        <div className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition ${
                          checked ? 'border-primary bg-primary text-white' : 'border-muted/40'
                        }`}>
                          {checked && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-fg">{m.label}</p>
                          <p className="text-xs text-muted">{m.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right: Recommendation Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-8 shadow-sm">
              <div>
                <span className="inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                  Recommended Configuration
                </span>
                <h3 className="mt-3 text-2xl font-extrabold text-fg">
                  {selectedModules.length >= 4 ? 'Enterprise Unified Suite' : selectedModules.length >= 2 ? 'MSME Operational Core' : 'Specialized Modular Service'}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Optimized for a team of <strong>{companySize} members</strong> with <strong>{selectedModules.length} operational modules</strong> selected.
                </p>

                <div className="mt-6 space-y-3 border-y border-line py-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Estimated Deployment:</span>
                    <span className="font-bold text-fg flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {getEstimatedTimeline()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Statutory Liability:</span>
                    <span className="font-bold text-success flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> 100% Indemnified</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Account Support:</span>
                    <span className="font-bold text-fg">Dedicated HR Operations Desk</span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Included In This Plan:</p>
                  <ul className="space-y-1.5 text-xs text-fg/80">
                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Complete monthly execution & filing</li>
                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Single point of contact (No vendor chaos)</li>
                    <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Priority recruiter access whenever you hire</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-line">
                <Button
                  to={`/contact?service=custom&size=${encodeURIComponent(companySize)}&modules=${encodeURIComponent(selectedModules.join(','))}`}
                  className="w-full"
                  size="lg"
                  arrow
                >
                  Request Detailed Proposal & Quote
                </Button>
                <p className="mt-2.5 text-center text-xs text-muted">Zero commitments. Our senior HR consultant will respond within 4 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY OUTSOURCE HR TO HIRENEXT (COMPARISON MATRIX) */}
      <section className="container mt-24 md:mt-32">
        <SectionHeading
          eyebrow="The HireNest Difference"
          title="Why Companies Upgrade to Our Unified HR Model"
          text="Compare how HireNest measures against building an internal HR overhead or managing three different fragmented agencies."
        />

        <div className="mt-12 card overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface/80">
                <th className="p-4 font-heading font-bold text-fg">Operational Dimension</th>
                <th className="p-4 font-heading font-bold text-muted">In-House HR Team</th>
                <th className="p-4 font-heading font-bold text-muted">Fragmented Agencies (CA + Staffing + Legal)</th>
                <th className="p-4 font-heading font-bold text-primary bg-primary/5">HireNest Unified OS</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={row.feature} className={`border-b border-line last:border-0 ${idx % 2 === 1 ? 'bg-surface/30' : ''}`}>
                  <td className="p-4 font-semibold text-fg">{row.feature}</td>
                  <td className="p-4 text-xs text-muted leading-relaxed">{row.inHouse}</td>
                  <td className="p-4 text-xs text-muted leading-relaxed">{row.fragmented}</td>
                  <td className="p-4 text-xs font-medium text-fg leading-relaxed bg-primary/5 border-l border-primary/20">
                    <span className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {row.hirenest}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. WHO BENEFITS: AUDIENCE PILLARS */}
      <section className="container mt-24 md:mt-32">
        <div className="grid gap-6 md:grid-cols-3">
          <TiltCard className="card p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Zap className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-extrabold text-fg">For Startups & MSMEs</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Scale fast without getting bogged down by PF/ESI notices or hiring overheads. Get enterprise-grade HR, payroll, and recruitment from day one on a flexible monthly subscription.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-fg/80">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Instant compliance peace of mind</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /> Free up founders to focus on product & revenue</li>
            </ul>
          </TiltCard>

          <TiltCard className="card p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/10 text-secondary">
              <Building2 className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-extrabold text-fg">For Mid-Market & Enterprises</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Standardize operations across multiple branch offices, automate attendance with geo-fenced mobile tracking, and eliminate payroll errors with dedicated enterprise SLAs.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-fg/80">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-secondary" /> Multi-state Professional Tax management</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-secondary" /> Bulk candidate pipelines for fast-expanding teams</li>
            </ul>
          </TiltCard>

          <TiltCard className="card p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent-700">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-extrabold text-fg">For Job Seekers & Employees</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Work with verified employers who pay salaries on time, provide transparent payslips, maintain accurate PF/ESI credits, and offer genuine career growth opportunities.
            </p>
            <ul className="mt-5 space-y-2 text-xs text-fg/80">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent-700" /> Apply to verified roles for free</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-accent-700" /> Guaranteed legitimate employment terms</li>
            </ul>
          </TiltCard>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="container mt-24 md:mt-32 max-w-4xl">
        <SectionHeading
          eyebrow="Clarity First"
          title="Frequently Asked Questions on HR, Payroll & Compliance"
          text="Clear, direct answers regarding statutory thresholds, service delivery SLAs, and onboarding procedures."
        />

        <div className="mt-12 space-y-4">
          {serviceFaqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div key={index} className="card overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-heading text-base font-bold text-fg pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-muted transition-transform shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-line/60 bg-surface/40 px-6 py-5 text-sm text-muted leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. FINAL CONSULTATION CTA */}
      <section className="container mt-24 md:mt-32">
        <div className="relative overflow-hidden rounded-xl3 bg-[#0B0F1E] p-10 md:p-16 text-white text-center shadow-lift">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-[100px]" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-secondary/30 blur-[100px]" />

          <div className="relative mx-auto max-w-2xl">
            <span className="eyebrow !bg-white/10 !text-white">Ready to Transform Your HR?</span>
            <h2 className="text-3xl font-extrabold sm:text-5xl text-white mt-4">
              Stop Worrying About HR Headaches. Focus on Growing Your Business.
            </h2>
            <p className="mt-4 text-white/70 text-base md:text-lg">
              Book a free 30-minute operational audit with our senior HR consultants. We will review your payroll structure, compliance health, and hiring bottlenecks with zero obligation.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button to="/contact?service=audit" size="lg" className="w-full sm:w-auto" arrow>
                Book Free 30-Min HR Audit
              </Button>
              <Button to="/hire" variant="outline" size="lg" className="w-full sm:w-auto !border-white/20 !text-white hover:!bg-white/10">
                Raise Hiring Requirement
              </Button>
            </div>

            <p className="mt-6 text-xs text-white/50">
              Questions? Call our HR Advisory Desk directly at <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="underline text-white/80">{site.phone}</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
