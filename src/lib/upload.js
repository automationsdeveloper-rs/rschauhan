import { supabase, supabaseConfig } from './supabase'

export const CV_MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_EXT = ['pdf', 'doc', 'docx']

/** Returns an error string or null. Also enforced server-side by the bucket config. */
export function validateCv(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (!ALLOWED_EXT.includes(ext)) return 'Only PDF, DOC or DOCX files are allowed.'
  if (file.size > CV_MAX_BYTES) return 'File is larger than 5 MB.'
  if (file.size === 0) return 'This file is empty.'
  return null
}

const safeName = (n) => n.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)

/**
 * Uploads to the private `cvs` bucket with real progress events (XHR).
 * `folder` is one of applications | requests | jd (allowed by the storage policy).
 * Resolves to the storage path. In demo mode (no Supabase) it simulates progress.
 */
export function uploadFile(file, onProgress, folder = 'applications') {
  const path = `${folder}/${crypto.randomUUID()}/${safeName(file.name)}`

  if (!supabase) {
    return new Promise((resolve) => {
      let p = 0
      const t = setInterval(() => { p = Math.min(100, p + 12 + Math.random() * 15); onProgress(p); if (p >= 100) { clearInterval(t); resolve(path) } }, 120)
    })
  }

  return new Promise(async (resolve, reject) => {
    const { data } = await supabase.auth.getSession()
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${supabaseConfig.url}/storage/v1/object/cvs/${path}`)
    xhr.setRequestHeader('apikey', supabaseConfig.key)
    xhr.setRequestHeader('Authorization', `Bearer ${data.session?.access_token ?? supabaseConfig.key}`)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress((e.loaded / e.total) * 100)
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(path) : reject(new Error('Upload failed. Please try again.')))
    xhr.onerror = () => reject(new Error('Network error while uploading your CV.'))
    const body = new FormData()
    body.append('', file)
    xhr.send(body)
  })
}

export const uploadCv = (file, onProgress) => uploadFile(file, onProgress, 'applications')
