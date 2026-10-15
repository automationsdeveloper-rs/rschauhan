import { Link } from 'react-router-dom'
import {
  Users, Laptop, Scale, Receipt, BookOpen, Building2,
  CheckCircle2, ArrowRight, ShieldCheck, Sparkles, ChevronRight
} from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { Stagger, StaggerItem, TiltCard } from '../ui/Motion'
import Button from '../ui/Button'

const solutions = [
  {
    icon: Users,
    badge: '48-Hr Delivery',
    title: 'Recruitment & Executive Search',
    desc: 'Pre-screened, verified profiles across IT, BFSI, Sales & Ops. Single specialist to bulk hiring drives with 90-day replacement guarantee.',
    features: ['Permanent & Contract Staffing', 'Leadership & CXO Executive Search', 'Verified within 48 Hours'],
    to: '/hire',
    ctaText: 'Hire Talent',
    accent: 'from-blue-500/10 to-indigo-500/10 text-primary',
  },
  {
    icon: Laptop,
    badge: 'Cloud & Mobile',
    title: 'HRMS & Digital Operations',
    desc: 'Centralized employee database, geo-fenced mobile attendance, biometric device sync, automated leave policies, and self-service mobile app.',
    features: ['Geo-fenced Mobile Attendance', 'Employee Self-Service (ESS)', 'Biometric Machine Integration'],
    to: '/services#hrms',
    ctaText: 'Explore HRMS',
    accent: 'from-cyan-500/10 to-blue-500/10 text-cyan-500',
  },
  {
    icon: Scale,
    badge: '100% Audit-Ready',
    title: 'EPF, ESI & Statutory Compliance',
    desc: 'Complete labor law compliance. Monthly EPFO ECR generation, ESIC challans, multi-state Professional Tax (PT), LWF & POSH frameworks with zero penalties.',
    features: ['EPF & ESIC Monthly Filings', 'Multi-State PT & LWF Returns', 'Zero Penalty Legal Guarantee'],
    to: '/services#compliance',
    ctaText: 'View Compliance',
    accent: 'from-emerald-500/10 to-teal-500/10 text-emerald-500',
  },
  {
    icon: Receipt,
    badge: 'Zero-Error SLA',
    title: 'Managed Cloud Payroll & TDS',
    desc: 'Tax-optimized CTC structuring, automated gross-to-net computation, direct bank disbursement files, password-protected payslips & Form 16.',
    features: ['Direct Bank Disbursement', 'TDS & Quarterly Form 24Q', 'Full & Final (F&F) Settlements'],
    to: '/services#payroll',
    ctaText: 'Explore Payroll',
    accent: 'from-violet-500/10 to-purple-500/10 text-violet-500',
  },
  {
    icon: BookOpen,
    badge: 'Culture & Systems',
    title: 'HR Policy Engineering & SOPs',
    desc: 'Tailored Employee Handbooks, Code of Conduct, designation ladders, appraisal systems, and standard operating procedures (SOPs) for Indian businesses.',
    features: ['Custom Employee Handbooks', 'Performance Appraisal Systems', 'Clear Designation Ladders'],
    to: '/services#policy',
    ctaText: 'Design Policies',
    accent: 'from-amber-500/10 to-orange-500/10 text-amber-500',
  },
  {
    icon: Building2,
    badge: 'Save Up to 70%',
    title: 'Virtual HR Dept / Outsourcing',
    desc: 'Your dedicated external People Operations team. A Senior HR Business Partner managing hiring, tech, payroll, compliance, and employee support.',
    features: ['Dedicated Senior HRBP', 'Full Operational Ownership', 'Zero In-House HR Overhead'],
    to: '/services#outsourcing',
    ctaText: 'Outsource HR',
    accent: 'from-rose-500/10 to-pink-500/10 text-rose-500',
  },
]

export default function HRSolutionsOverview() {
  return (
    <section className="section bg-primary/[0.02] border-t border-line/60">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading
            center={false}
            eyebrow="Beyond Just Job Postings"
            title="Complete 360° HR Solutions for Indian Businesses"
            text="From acquiring top-tier talent in 48 hours to rolling out cloud HRMS, zero-error payroll, and 100% compliant EPF & ESI management."
          />
          <Button to="/services" variant="outline" className="shrink-0" arrow>
            View All HR Solutions
          </Button>
        </div>

        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => {
            const Icon = s.icon
            return (
              <StaggerItem key={s.title}>
                <TiltCard max={3} className="card group relative flex h-full flex-col justify-between overflow-hidden p-7 transition hover:border-primary/40 hover:shadow-lift">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${s.accent}`}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-bold text-muted">
                        {s.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-extrabold text-fg group-hover:text-primary transition-colors">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {s.desc}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-line/60 pt-4">
                      {s.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-fg/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-7 pt-4 border-t border-line/60">
                    <Link
                      to={s.to}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition group-hover:gap-2.5"
                    >
                      <span>{s.ctaText}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </TiltCard>
              </StaggerItem>
            )
          })}
        </Stagger>

        {/* Regulatory assurance bottom bar */}
        <div className="mt-12 rounded-2xl border border-line bg-surface/70 p-5 md:p-6 shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3 text-center md:text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-fg">100% Indian Statutory Legal Compliance Guarantee</p>
                <p className="text-xs text-muted">EPFO (UAN/ECR), ESIC, Multi-State PT, Labour Welfare Fund (LWF) & POSH Act 2013 audit assurance.</p>
              </div>
            </div>
            <Button to="/contact?service=compliance" size="sm" variant="ghost" className="text-xs font-bold text-primary shrink-0">
              Request Free Compliance Check →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
