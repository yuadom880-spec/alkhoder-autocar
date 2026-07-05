import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { uploadBranchImageFile } from '../../lib/imageUpload'
import { isDataImageUrl } from '../../lib/imageUrl'
import { isSupabaseConfigured } from '../../lib/supabase'
import { cn } from '../../lib/utils'

interface BranchImageUploaderProps {
  imageUrl: string
  onChange: (url: string) => void
  onError: (msg: string) => void
}

export function BranchImageUploader({ imageUrl, onChange, onError }: BranchImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isSupabaseConfigured) {
      onError(
        'قاعدة البيانات غير مُعدّة — أضف متغيرات Supabase في Vercel (VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY) ثم أعد النشر',
      )
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    onError('')
    try {
      const url = await uploadBranchImageFile(file)
      onChange(url)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="label-field">صورة الفرع</label>
      {isSupabaseConfigured && isDataImageUrl(imageUrl) && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          الصورة الحالية محفوظة محلياً ولا تظهر على الجوال — اضغط «تغيير الصورة» وارفعها من جديد.
        </p>
      )}

      {imageUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200">
          <img src={imageUrl} alt="صورة الفرع" className="h-48 w-full object-contain bg-slate-50" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 left-2 rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200',
            'text-slate-500 transition-colors hover:border-brand-green hover:text-brand-green',
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">اضغط لرفع صورة الفرع</span>
            </>
          )}
        </button>
      )}

      {imageUrl && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm text-brand-green hover:underline"
        >
          تغيير الصورة
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}