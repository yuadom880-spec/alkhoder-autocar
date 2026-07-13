import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { copy } from '../../lib/copy'
import { Button } from '../ui/Button'

interface DeleteAccountDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteAccountDialog({ open, onClose, onConfirm }: DeleteAccountDialogProps) {
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !working) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, working])

  if (!open) return null

  const handleConfirm = async () => {
    setWorking(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setWorking(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      onClick={() => {
        if (!working) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-account-title" className="text-lg font-extrabold text-brand-dark">
          {copy.customerAuth.deleteAccountTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {copy.customerAuth.deleteAccountConfirm}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="min-h-[44px]"
            disabled={working}
            onClick={onClose}
          >
            {copy.customerAuth.deleteAccountCancel}
          </Button>
          <Button
            className="min-h-[44px] bg-red-600 hover:bg-red-700"
            disabled={working}
            onClick={() => void handleConfirm()}
          >
            {working ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {copy.customerAuth.deleteAccountWorking}
              </>
            ) : (
              copy.customerAuth.deleteAccountConfirmBtn
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}