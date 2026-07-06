import { MessageCircle } from 'lucide-react'
import { WHATSAPP_LINK } from '../../lib/constants'

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-20 left-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform active:scale-95 sm:bottom-6 sm:left-6 sm:hover:scale-110 safe-bottom"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}