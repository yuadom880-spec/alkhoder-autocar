import { isSupabaseConfigured, requireSupabaseAdminAuth, uploadCarImage } from './supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'الصيغ المدعومة: JPG, PNG, WebP, GIF'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'حجم الصورة لازم ما يتجاوز 5 ميجا'
  }
  return null
}

/** ضغط الصورة وتحويلها لـ base64 (للوضع التجريبي) */
function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('ما قدرنا نعالج الصورة'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        resolve(canvas.toDataURL(mime, quality))
      }
      img.onerror = () => reject(new Error('صورة غير صالحة'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('فشل قراءة الملف'))
    reader.readAsDataURL(file)
  })
}

/** رفع صورة سيارة — Supabase Storage أو base64 (وضع تجريبي فقط) */
export async function uploadCarImageFile(file: File): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  if (isSupabaseConfigured) {
    return uploadCarImage(file, 'cars')
  }

  return compressImage(file)
}

/** رفع صورة فرع — يجب أن تُخزَّن على Supabase لتظهر على كل الأجهزة */
export async function uploadBranchImageFile(file: File): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  if (!isSupabaseConfigured) {
    throw new Error(
      'قاعدة البيانات غير مُعدّة على الموقع المنشور — أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في Vercel ثم أعد النشر',
    )
  }

  await requireSupabaseAdminAuth()
  return uploadCarImage(file, 'branches')
}

export async function uploadMultipleCarImages(files: File[]): Promise<string[]> {
  const results: string[] = []
  for (const file of files) {
    const url = await uploadCarImageFile(file)
    results.push(url)
  }
  return results
}