import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, FileText, UploadCloud, X } from 'lucide-react'
import { FieldError } from './Fields'
import { validateCv } from '../../lib/upload'

/**
 * Drag-and-drop CV zone. The parent owns upload state:
 *   file, progress (0-100), done (bool). onSelect(file) / onClear().
 */
export default function FileDropzone({ file, progress = 0, done = false, onSelect, onClear, error }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [localErr, setLocalErr] = useState(null)

  const pick = (f) => {
    if (!f) return
    const err = validateCv(f)
    setLocalErr(err)
    if (!err) onSelect(f)
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
            onClick={() => inputRef.current?.click()} role="button" tabIndex={0} aria-label="Upload CV"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${drag ? 'scale-[1.01] border-primary bg-primary/10' : 'border-line hover:border-primary/60 hover:bg-primary/5'} ${error || localErr ? '!border-danger' : ''}`}>
            <motion.div animate={{ y: drag ? -6 : 0 }}><UploadCloud className="mx-auto h-10 w-10 text-primary" /></motion.div>
            <p className="mt-3 font-semibold">Drag & drop your CV here, or <span className="text-primary underline">browse</span></p>
            <p className="mt-1 text-xs text-muted">PDF, DOC or DOCX · max 5 MB</p>
          </motion.div>
        ) : (
          <motion.div key="file" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-muted">{file.size ? `${(file.size / 1024).toFixed(0)} KB ` : ''}{done ? '· Uploaded' : progress > 0 ? `· ${Math.round(progress)}%` : '· Ready to upload'}</p>
              </div>
              {done ? (
                <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} viewBox="0 0 24 24" className="h-7 w-7 text-success" aria-label="Uploaded">
                  <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" />
                  <motion.path d="M7 12.5l3.5 3.5L17 9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
                </motion.svg>
              ) : (
                <button type="button" onClick={onClear} aria-label="Remove file" className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"><X className="h-4 w-4" /></button>
              )}
            </div>
            {(progress > 0 && !done) && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                <motion.div className="h-full rounded-full bg-brand-gradient" animate={{ width: `${progress}%` }} transition={{ ease: 'easeOut' }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <input ref={inputRef} type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => { pick(e.target.files[0]); e.target.value = '' }} />
      <FieldError error={localErr || error} />
    </div>
  )
}
