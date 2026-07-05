/** رابط صورة قابل للعرض على كل الأجهزة (ليس base64 محلي) */
export function isPersistedImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export function isDataImageUrl(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith('data:'))
}