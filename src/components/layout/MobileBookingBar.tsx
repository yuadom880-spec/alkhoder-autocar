import { Link } from 'react-router'
import { MessageCircle, Car } from 'lucide-react'
import { WHATSAPP_LINK } from '../../lib/constants'
import { copy } from '../../lib/copy'
import { Button } from '../ui/Button'

/** شريط حجز سريع ثابت أسفل الشاشة — للجوال فقط */
export function MobileBookingBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md safe-bottom lg:hidden">
      <div className="container-main grid grid-cols-2 gap-2 py-2.5">
        <Link to="/cars" className="min-w-0">
          <Button size="lg" className="w-full min-h-[50px] text-sm">
            <Car className="h-5 w-5 shrink-0" />
            {copy.nav.bookNow}
          </Button>
        </Link>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="min-w-0">
          <Button
            size="lg"
            variant="outline"
            className="w-full min-h-[50px] border-[#25D366] text-[#128C7E] text-sm"
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            {copy.site.whatsapp}
          </Button>
        </a>
      </div>
    </div>
  )
}