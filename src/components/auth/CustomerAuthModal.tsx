import { useEffect } from 'react'
import { X } from 'lucide-react'
import { CustomerAuthPanel } from './CustomerAuthPanel'

interface CustomerAuthModalProps {
  open: boolean
  onClose: () => void
}

export function CustomerAuthModal({ open, onClose }: CustomerAuthModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>
        <CustomerAuthPanel variant="header" onSuccess={onClose} />
      </div>
    </div>
  )
}