import { AlertTriangle } from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/supabase'

export function AdminSupabaseBanner() {
  if (isSupabaseConfigured) return null

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6">
      <div className="flex items-start gap-3 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="space-y-1">
          <p className="font-semibold">قاعدة البيانات غير متصلة على هذا الموقع</p>
          <p>
            الفروع والصور تُحفظ محلياً في متصفحك فقط ولن تظهر للزوار. أضف{' '}
            <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_URL</code> و{' '}
            <code className="rounded bg-amber-100 px-1">VITE_SUPABASE_ANON_KEY</code> في إعدادات
            Vercel ثم أعد نشر الموقع.
          </p>
        </div>
      </div>
    </div>
  )
}