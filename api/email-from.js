/** مرسل الإيميل — وضع الاختبار vs الإنتاج */
export const TEST_FROM = 'onboarding@resend.dev'
export const PRODUCTION_FROM = 'Alkhedr Cars <Alkhedr.qa@alkhedrcars.com>'

function useProductionMode() {
  const flag = process.env.RESEND_USE_PRODUCTION
  return flag === 'true' || flag === '1'
}

export function resolveFromEmail(raw) {
  if (!raw) return useProductionMode() ? PRODUCTION_FROM : TEST_FROM

  let value = String(raw).trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim()
  }

  if (/^[^\s<>"]+@[^\s<>"]+\.[^\s<>"]+$/.test(value)) {
    return value
  }

  const named = value.match(/^(.+?)\s*<([^<>]+@[^<>]+\.[^<>]+)>\s*$/)
  if (named) {
    return `${named[1].trim()} <${named[2].trim()}>`
  }

  return useProductionMode() ? PRODUCTION_FROM : TEST_FROM
}

export function emailPart(from) {
  return from.includes('<')
    ? from.match(/<([^>]+)>/)?.[1]?.trim() ?? from.trim()
    : from.trim()
}

export function safeFromEmail(raw) {
  const resolved = resolveFromEmail(raw)
  const addr = emailPart(resolved)

  if (addr && /@alkhedrcars\.com$/i.test(addr)) {
    return resolved
  }

  if (useProductionMode()) {
    return PRODUCTION_FROM
  }

  // gmail كمرسل غير مدعوم — نستخدم مرسل الاختبار
  if (addr && /@gmail\.com$/i.test(addr)) {
    return TEST_FROM
  }

  return resolved
}