import { NavLink } from 'react-router-dom'
import { Reveal } from '../components/ui/Motion'
import { site } from '../config/site'
import { useSeo } from '../lib/hooks'

// Template policies for an Indian recruitment marketplace. Have them reviewed by a lawyer before launch.
const UPDATED = '30 September 2026'
const pages = [['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms'], ['Refund Policy', '/refund-policy']]
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function LegalPage({ title, description, intro, sections }) {
  useSeo({ title: `${title} — ${site.name}`, description })
  return (
    <div className="container grid gap-10 pb-20 pt-28 md:pt-32 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Legal</p>
        <nav className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1" aria-label="Legal pages">
          {pages.map(([l, to]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:text-fg'}`}>{l}</NavLink>
          ))}
        </nav>
        <nav className="mt-8 hidden lg:block" aria-label="On this page">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">On this page</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {sections.map((s, i) => <li key={s.h}><a href={`#${slug(s.h)}`} className="text-muted hover:text-primary">{i + 1}. {s.h}</a></li>)}
          </ol>
        </nav>
      </aside>

      <Reveal as="article" className="prose-site max-w-3xl">
        <span className="eyebrow">{title}</span>
        <h1 className="text-3xl font-extrabold md:text-5xl">{title}</h1>
        <p className="!mt-2 text-sm">Last updated: {UPDATED}</p>
        <p className="text-base md:text-lg">{intro}</p>
        {sections.map((s, i) => (
          <section key={s.h} id={slug(s.h)} className="scroll-mt-28">
            <h2>{i + 1}. {s.h}</h2>
            {s.p?.map((t) => <p key={t}>{t}</p>)}
            {s.list && <ul>{s.list.map((t) => <li key={t}>{t}</li>)}</ul>}
          </section>
        ))}
        <p className="mt-10 border-t border-line pt-6 text-sm">Questions about this policy? Write to <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
      </Reveal>
    </div>
  )
}

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy" description={`How ${site.name} collects, uses and protects the personal data of candidates, employers and visitors.`}
      intro={`${site.name} ("we", "us") operates the website and services at ${site.url}. This policy explains what personal data we collect from candidates, employers and visitors, how we use it and the choices you have. It is written to comply with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.`}
      sections={[
        { h: 'Information we collect', list: [
          'Account data: name, email, phone and a hashed password when you sign up, or your Google profile if you use Google login.',
          'Candidate profile data: city, experience, skills, qualifications, salary expectations, LinkedIn URL, cover notes and your CV.',
          'Employer data: company name, website, contact person, positions, budgets and job descriptions.',
          'Payment data: processed by Razorpay. We store only the order and payment IDs and the amount, never your card or bank details.',
          'Messages you send us through the contact form, email or WhatsApp.',
          'Usage data: pages visited, device and browser type and approximate location, collected through cookies and analytics only if you accept them.',
        ] },
        { h: 'How we use it', list: [
          'To match candidates with openings and share profiles with employers.',
          'To deliver the services you paid for and send status updates by email or WhatsApp.',
          'To process payments, issue GST invoices and prevent fraud.',
          'To respond to enquiries and provide support.',
          'To send job alerts and newsletters you opted into (unsubscribe at any time).',
          'To improve the website and, with your consent, measure traffic with analytics.',
        ] },
        { h: 'Sharing your data', p: ['We never sell personal data. We share it only in these cases:'], list: [
          'With employers: a candidate’s profile and CV are shared only when they apply to that employer’s job, raise a job request (consent is given on the form) or are matched to a hiring request.',
          'With service providers who process data on our behalf: Supabase (database, authentication, file storage), Razorpay (payments), Resend (transactional email), Vercel (hosting) and Google Analytics (only if you accept cookies).',
          'When required by law, a court order or to protect our legal rights.',
        ] },
        { h: 'Storage and security', p: [
          'CVs and job descriptions are stored in a private, access-controlled bucket. Links to them expire within minutes and are issued only to the file owner, matched employers and our recruiters.',
          'Data is encrypted in transit (HTTPS) and at rest by our providers. Access inside the company is limited to staff who need it to deliver the service.',
          'No system is perfectly secure. If we learn of a breach affecting you, we will notify you and the authorities as required by law.',
        ] },
        { h: 'How long we keep it', list: [
          'Applications and job requests: 24 months after the last activity, so we can match you with future openings.',
          'Employer requests and positions: 24 months after closure.',
          'Payment records and invoices: 8 years, as required by Indian tax law.',
          'Contact messages: 12 months.',
          'You may ask us to delete your profile earlier (see Your rights).',
        ] },
        { h: 'Your rights', p: [
          `You can access, correct or delete your personal data, withdraw consent for profile sharing and opt out of marketing at any time. Most changes can be made from your dashboard; for anything else write to ${site.email}. We respond within 30 days.`,
          'If you are not satisfied with our response, you may escalate to the Data Protection Board of India.',
        ] },
        { h: 'Cookies', p: [
          'We use strictly necessary cookies and local storage for login, theme, language and saved jobs. Analytics cookies (Google Analytics) load only after you click "Accept" on the cookie banner; clear your site data to change that choice. Razorpay may set cookies during checkout under its own policy.',
        ] },
        { h: 'Children', p: ['Our services are for people aged 18 and above. We do not knowingly collect data from minors; if you believe a minor has provided data, contact us and we will delete it.'] },
        { h: 'Changes to this policy', p: ['We may update this policy from time to time. The "last updated" date changes when we do, and material changes are announced by email or on the website.'] },
        { h: 'Contact and grievance officer', p: [`Grievance Officer, ${site.name}, ${site.address}. Email: ${site.email}. Phone: ${site.phone}.`] },
      ]} />
  )
}

export function Terms() {
  return (
    <LegalPage title="Terms & Conditions" description={`The terms that govern the use of ${site.name} by visitors, candidates and employers.`}
      intro={`These Terms govern your use of ${site.name} ("the Platform") as a visitor, candidate or employer. By creating an account, submitting a form or making a payment you agree to them, and to our Privacy Policy and Refund Policy.`}
      sections={[
        { h: 'What we do', p: [
          `${site.name} is a recruitment-services marketplace. Candidates can apply to listed jobs free of charge, or purchase a Job Request service in which our recruiters search for suitable openings. Employers can purchase Hiring Request services in which we source, screen and share candidate profiles.`,
          'We facilitate introductions. The hiring decision and the employment relationship are strictly between the candidate and the employer.',
        ] },
        { h: 'No guarantee of outcome', p: ['We work diligently but cannot guarantee that a candidate will receive an offer or that an employer will find a suitable hire. Timelines such as "48 hours" and "24 hours" are service targets measured on business days from payment confirmation.'] },
        { h: 'Accounts', list: [
          'You must be 18 or older and provide accurate information.',
          'Keep your password confidential; you are responsible for activity on your account.',
          'One person may not operate multiple candidate accounts. Employer accounts must be operated by an authorised representative of the company.',
          'We may suspend or close accounts that breach these Terms.',
        ] },
        { h: 'Candidate obligations', list: [
          'Provide truthful information and a genuine CV. Misrepresentation may lead to removal without refund.',
          'By applying or raising a job request you consent to us sharing your profile and CV with relevant employers.',
          'Respond to interview invitations in good time and tell us if you accept another offer.',
        ] },
        { h: 'Employer obligations', list: [
          'Post only genuine, lawful vacancies with accurate salary ranges.',
          'Use candidate profiles and CVs solely to evaluate them for the stated position. Do not copy, resell or share them with third parties.',
          'Do not discriminate on grounds prohibited by Indian law.',
          'Do not bypass the Platform to hire a candidate we introduced, during the engagement and for 6 months after it.',
          'Tell us within 7 days when a candidate we shared is hired.',
        ] },
        { h: 'Fees and payment', list: [
          'Fees are shown on the Pricing page in INR, exclusive of 18% GST, which is added at checkout.',
          'Payments are processed by Razorpay. A GST invoice is emailed after every successful payment.',
          'Plans are non-transferable. Employer plans cover the number of positions stated; Enterprise pricing is agreed in writing.',
          'Fees are due before work begins. Refunds are governed by the Refund Policy.',
        ] },
        { h: 'Acceptable use', p: ['You must not upload malware, scrape the Platform, attempt to access other users’ data, post misleading content or use the services for any unlawful purpose.'] },
        { h: 'Intellectual property', p: ['The Platform, its design, code and content belong to us or our licensors. You keep the rights in the content you upload (CVs, job descriptions) and grant us a licence to use it to provide the services.'] },
        { h: 'Disclaimer and limitation of liability', p: ['The Platform is provided "as is". To the extent permitted by law we are not liable for indirect or consequential losses, loss of profits, or decisions made by employers or candidates. Our total liability for any claim is limited to the fees you paid us in the 6 months before the claim.'] },
        { h: 'Termination', p: ['You may close your account at any time from your dashboard or by emailing us. We may terminate or suspend access for breach of these Terms. The sections on fees, intellectual property, liability and governing law survive termination.'] },
        { h: 'Governing law', p: ['These Terms are governed by the laws of India. The courts of Bengaluru, Karnataka have exclusive jurisdiction, subject to any mandatory consumer-protection rights you have.'] },
        { h: 'Changes to these terms', p: ['We may update these Terms. Continued use of the Platform after changes are posted means you accept them.'] },
        { h: 'Contact', p: [`${site.name}, ${site.address}. Email: ${site.email}.`] },
      ]} />
  )
}

export function Refund() {
  return (
    <LegalPage title="Refund Policy" description={`When fees for ${site.name} Job Requests and Hiring Requests are refundable, and how to claim a refund.`}
      intro="We want you to pay only for value received. This policy explains when fees for Job Requests (candidates) and Hiring Requests (employers) are refundable. It forms part of our Terms & Conditions. Applying to listed jobs is free, so no refund questions arise there."
      sections={[
        { h: 'Candidate Job Request plans', list: [
          'Full refund if we do not share at least one relevant opportunity within 30 days of payment confirmation. "Relevant" means it matches the role, location and salary range you specified within a reasonable tolerance.',
          'Full refund if you cancel within 24 hours of payment and before a recruiter has contacted you.',
          'No refund once an interview has been scheduled through us, or if you decline opportunities that match your stated preferences.',
          'Premium Career Support: the resume rewrite and mock interview are delivered services. After delivery, only the unused portion of the plan (if any) is refundable, at our discretion.',
        ] },
        { h: 'Employer Hiring Request plans', list: [
          'Full refund if no candidate profile is shared within 7 business days of payment confirmation.',
          'Full refund if you cancel within 24 hours of payment and before sourcing has started.',
          'Once profiles have been shared, the fee is earned and non-refundable, even if you choose not to hire.',
          'Growth plan replacement guarantee: if a candidate hired through us leaves or is terminated within 60 days of joining, we source a replacement for that position at no extra cost.',
          'Enterprise agreements follow the refund terms in their written contract.',
        ] },
        { h: 'What is not refundable', list: [
          'Change of mind after work has started.',
          'Incorrect or incomplete information provided in the request.',
          'Not responding to our recruiters for more than 14 days.',
          'Payment-gateway charges that the gateway does not return (typically about 2%).',
        ] },
        { h: 'How to request a refund', p: [`Email ${site.email} from the address on your account with your request ID (for example HN-JR-XXXXXX) and the reason, within 15 days of becoming eligible. We acknowledge within 2 business days and decide within 7 business days.`] },
        { h: 'Processing time', p: ['Approved refunds are issued to the original payment method through Razorpay within 5–7 business days. Banks and card issuers may take a further 5–10 business days to show the credit.'] },
        { h: 'Chargebacks', p: ['Please contact us before raising a dispute with your bank; we resolve most issues faster directly. Chargebacks raised without contacting us first may result in account suspension.'] },
        { h: 'Contact', p: [`${site.email} · ${site.phone} (${site.hours}).`] },
      ]} />
  )
}
