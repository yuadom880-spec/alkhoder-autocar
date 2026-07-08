/** رابط صورة قابل للعرض على كل الأجهزة (ليس base64 محلي) */
export function isPersistedImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export function isDataImageUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith('data:'))
}

const SUPABASE_OBJECT = '/storage/v1/object/public/'
const SUPABASE_RENDER = '/storage/v1/render/image/public/'

/** تصغير صور Supabase Storage للموبايل */
export function optimizeImageUrl(
  url: string | null | undefined,
  width: number,
  quality = 80,
): string {
  if (!url?.trim()) return ''
  if (url.includes(SUPABASE_OBJECT)) {
    const base = url.replace(SUPABASE_OBJECT, SUPABASE_RENDER)
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}width=${width}&quality=${quality}&resize=contain`
  }
  return url
}