import { Link } from 'react-router'
import { Car } from 'lucide-react'
import { copy } from '../../lib/copy'
import { Button } from '../ui/Button'

/** شريط حجز سريع ثابت أسفل الشاشة — للجوال فقط */
export function MobileBookingBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md safe-bottom lg:hidden">
      <div className="container-main py-2.5">
        <Link to="/cars">
          <Button size="lg" className="w-full min-h-[50px] text-sm">
            <Car className="h-5 w-5 shrink-0" />
            {copy.nav.bookNow}
          </Button>
        </Link>
      </div>
    </div>
  )
}