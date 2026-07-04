export type PhoneCountryCode = '966' | '20'

export const PHONE_COUNTRIES: {
  code: PhoneCountryCode
  dial: string
  label: string
  placeholder: string
}[] = [
  { code: '966', dial: '+966', label: 'السعودية', placeholder: '5xxxxxxxx' },
  { code: '20', dial: '+20', label: 'مصر', placeholder: '10xxxxxxxx' },
]

export function normalizeLocalPhoneDigits(local: string): string {
  return local.replace(/\D/g, '')
}

export function buildInternationalPhone(countryCode: PhoneCountryCode, local: string): string {
  let digits = normalizeLocalPhoneDigits(local)
  if (!digits) return ''

  if (countryCode === '966') {
    if (digits.startsWith('966')) digits = digits.slice(3)
    if (digits.startsWith('0')) digits = digits.slice(1)
    return `+966${digits}`
  }

  if (digits.startsWith('20')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return `+20${digits}`
}

export function parseStoredPhone(phone: string): {
  countryCode: PhoneCountryCode
  local: string
} {
  const digits = phone.replace(/\D/g, '')
  if (!digits) {
    return { countryCode: '966', local: '' }
  }
  if (digits.startsWith('966')) {
    return { countryCode: '966', local: digits.slice(3) }
  }
  if (digits.startsWith('20')) {
    return { countryCode: '20', local: digits.slice(2) }
  }
  if (digits.startsWith('0')) {
    return { countryCode: '966', local: digits.slice(1) }
  }
  return { countryCode: '966', local: digits }
}

/** أرقام دولية بدون + لروابط واتساب */
export function toWhatsAppDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('966') || digits.startsWith('20')) return digits
  if (digits.startsWith('0')) return `966${digits.slice(1)}`
  return `966${digits}`
}

export function formatDisplayPhone(phone: string): string {
  if (phone.startsWith('+')) return phone
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('966') || digits.startsWith('20')) return `+${digits}`
  if (digits.startsWith('0')) return `+966${digits.slice(1)}`
  return phone ? `+966${digits}` : ''
}

export function isValidInternationalPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('966')) return digits.length === 12
  if (digits.startsWith('20')) return digits.length === 12
  if (digits.startsWith('0')) return digits.length === 10
  return false
}