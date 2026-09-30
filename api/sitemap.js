// GET /sitemap.xml (rewritten to /api/sitemap in vercel.json). Static routes + every open job.
import { createClient } from '@supabase/supabase-js'

const statics = [
  ['/', '1.0', 'daily'], ['/jobs', '0.9', 'hourly'], ['/request-job', '0.8', 'weekly'], ['/hire', '0.8', 'weekly'], ['/pricing', '0.7', 'monthly'],
  ['/about', '0.5', 'monthly'], ['/contact', '0.5', 'monthly'], ['/privacy', '0.2', 'yearly'], ['/terms', '0.2', 'yearly'], ['/refund-policy', '0.2', 'yearly'],
]
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

export default async function handler(req, res) {
  const base = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '')
  let jobs = []
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (url && key) {
    try {
      const { data } = await createClient(url, key, { auth: { persistSession: false } })
        .from('jobs').select('id, created_at').eq('status', 'open').order('created_at', { ascending: false }).limit(5000)
      jobs = data ?? []
    } catch (e) { console.error('sitemap jobs', e) }
  }

  const rows = [
    ...statics.map(([p, pr, cf]) => `<url><loc>${esc(base + p)}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`),
    ...jobs.map((j) => `<url><loc>${esc(`${base}/jobs/${j.id}`)}</loc><lastmod>${new Date(j.created_at).toISOString().slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>`
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(xml)
}
