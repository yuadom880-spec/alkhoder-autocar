import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { ImagePlus, Loader2, Star, Trash2, Upload } from 'lucide-react'
import { uploadMultipleCarImages } from '../../lib/imageUpload'
import { cn } from '../../lib/utils'

interface CarImageUploaderProps {
  imageUrl: string
  images: string[]
  onChange: (imageUrl: string, images: string[]) => void
  onError: (msg: string) => void
}

export function CarImageUploader({ imageUrl, images, onChange, onError }: CarImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const allImages = imageUrl
    ? [imageUrl, ...images.filter((i) => i !== imageUrl)]
    : images

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (list.length === 0) {
        onError('اختر ملف صورة صالح')
        return
      }

      setUploading(true)
      onError('')
      try {
        const urls = await uploadMultipleCarImages(list)
        const merged = [...allImages, ...urls.filter((u) => !allImages.includes(u))]
        const primary = imageUrl || merged[0]
        const gallery = merged.filter((u) => u !== primary)
        onChange(primary, gallery)
      } catch (err) {
        onError(err instanceof Error ? err.message : 'فشل رفع الصورة')
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [allImages, imageUrl, onChange, onError],
  )

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files)
  }

  const setPrimary = (url: string) => {
    const rest = allImages.filter((i) => i !== url)
    onChange(url, rest)
  }

  const removeImage = (url: string) => {
    const rest = allImages.filter((i) => i !== url)
    onChange(rest[0] ?? '', rest.slice(1))
  }

  return (
    <div className="space-y-4">
      <label className="label-field">صور السيارة *</label>

      {/* منطقة الرفع */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors cursor-pointer',
          dragOver
            ? 'border-brand-green bg-brand-green/5'
            : 'border-slate-200 bg-slate-50 hover:border-brand-green/50 hover:bg-brand-green/5',
          uploading && 'pointer-events-none opacity-70',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleInput}
        />

        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-brand-green animate-spin" />
            <p className="text-sm text-slate-500">جاري رفع الصور...</p>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <Upload className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="font-medium text-brand-dark">اضغط أو اسحب الصور هنا</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — حتى 5 ميجا لكل صورة</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-4 py-2 text-sm font-medium text-white">
              <ImagePlus className="h-4 w-4" />
              اختر صور من جهازك
            </span>
          </>
        )}
      </div>

      {/* معرض الصور */}
      {allImages.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">
            {allImages.length} صورة — اضغط <Star className="inline h-3 w-3" /> لتعيين الصورة الرئيسية
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allImages.map((url) => {
              const isPrimary = url === imageUrl
              return (
                <div
                  key={url}
                  className={cn(
                    'group relative aspect-[4/3] overflow-hidden rounded-xl border-2',
                    isPrimary ? 'border-brand-green ring-2 ring-brand-green/30' : 'border-slate-200',
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-contain bg-slate-100" />

                  {isPrimary && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-bold text-white">
                      <Star className="h-3 w-3 fill-current" />
                      رئيسية
                    </span>
                  )}

                  <div className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPrimary(url) }}
                        className="rounded-lg bg-white/90 p-1.5 text-brand-dark hover:bg-white"
                        title="تعيين كصورة رئيسية"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(url) }}
                      className="rounded-lg bg-red-500/90 p-1.5 text-white hover:bg-red-600"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {allImages.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          لازم ترفع صورة واحدة على الأقل للسيارة
        </p>
      )}
    </div>
  )
}