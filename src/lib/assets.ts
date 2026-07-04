/** مسار ملف من مجلد public مع ترميز آمن للأسماء العربية */
export function asset(filename: string): string {
  return encodeURI(`/${filename}`)
}