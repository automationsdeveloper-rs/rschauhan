import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

const ToastContext = createContext({ toast: () => {} })
let id = 0

const styles = {
  success: { icon: CheckCircle2, cls: 'text-success' },
  error: { icon: XCircle, cls: 'text-danger' },
  info: { icon: Info, cls: 'text-primary' },
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const dismiss = useCallback((tid) => setItems((l) => l.filter((t) => t.id !== tid)), [])
  const toast = useCallback((message, type = 'info') => {
    const tid = ++id
    setItems((l) => [...l, { id: tid, message, type }])
    setTimeout(() => dismiss(tid), 4500)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" role="status" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => {
            const { icon: Icon, cls } = styles[t.type]
            return (
              <motion.div key={t.id} layout initial={{ opacity: 0, x: 60, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60 }}
                className="card pointer-events-auto flex items-start gap-3 p-4 shadow-lift">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cls}`} />
                <p className="flex-1 text-sm font-medium">{t.message}</p>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted hover:text-fg"><X className="h-4 w-4" /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
