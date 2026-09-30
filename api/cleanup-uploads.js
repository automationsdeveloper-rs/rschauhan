// Vercel Cron (see vercel.json): deletes CVs / JD files uploaded more than 7 days ago that no
// application, request, candidate or position references (abandoned multi-step forms).
// Vercel sends `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET env var is set.
import { db } from './_lib.js'

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'Unauthorized' })

  const client = db()
  const { data: stale, error } = await client.rpc('stale_uploads', { p_days: 7 }) // defined in migration 004
  if (error) { console.error('stale_uploads', error); return res.status(500).json({ error: error.message }) }
  if (!stale?.length) return res.status(200).json({ ok: true, removed: 0 })

  const { data: removed, error: rmErr } = await client.storage.from('cvs').remove(stale)
  if (rmErr) { console.error('remove', rmErr); return res.status(500).json({ error: rmErr.message }) }
  res.status(200).json({ ok: true, removed: removed?.length ?? 0 })
}
