import { useEffect, useState } from 'react'
import {
  buildInternationalPhone,
  PHONE_COUNTRIES,
  parseStoredPhone,
  type PhoneCountryCode,
} from '../../lib/phone'
import { copy } from '../../lib/copy'
import { cn } from '../../lib/utils'

interface CustomerPhoneFieldProps {
  id: string
  value: string
  onChange: (internationalPhone: string) => void
  className?: string
}

export function CustomerPhoneField({
  id,
  value,
  onChange,
  className,
}: CustomerPhoneFieldProps) {
  const [countryCode, setCountryCode] = useState<PhoneCountryCode>('966')
  const [local, setLocal] = useState('')

  useEffect(() => {
    if (!value) return
    const parsed = parseStoredPhone(value)
    setCountryCode(parsed.countryCode)
    setLocal(parsed.local)
  }, [value])

  const country =
    PHONE_COUNTRIES.find((c) => c.code === countryCode) ?? PHONE_COUNTRIES[0]

  const emitChange = (code: PhoneCountryCode, localDigits: string) => {
    onChange(buildInternationalPhone(code, localDigits))
  }

  const handleCountryChange = (code: PhoneCountryCode) => {
    setCountryCode(code)
    emitChange(code, local)
  }

  const handleLocalChange = (next: string) => {
    const digits = next.replace(/\D/g, '')
    setLocal(digits)
    emitChange(countryCode, digits)
  }

  const preview = buildInternationalPhone(countryCode, local)

  return (
    <div className={cn('space-y-2 sm:col-span-2', className)}>
      <label className="label-field text-black" htmlFor={id}>
        {copy.booking.phone} *
      </label>

      <div className="grid gap-2 sm:grid-cols-[150px_1fr]" dir="ltr">
        <select
          aria-label={copy.booking.phoneCountry}
          className="input-field !w-full text-black px-3 py-3 text-sm"
          value={countryCode}
          onChange={(e) => handleCountryChange(e.target.value as PhoneCountryCode)}
        >
          {PHONE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.dial} {c.label}
            </option>
          ))}
        </select>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          className="input-field !w-full text-black text-left min-w-0"
          value={local}
          onChange={(e) => handleLocalChange(e.target.value)}
          placeholder={country.placeholder}
        />
      </div>

      <p className="text-xs text-slate-500" dir="ltr">
        {preview ? (
          <>
            {copy.booking.phoneFormatted}:{' '}
            <span className="font-medium text-black">{preview}</span>
          </>
        ) : (
          <span className="text-slate-400">{country.placeholder}</span>
        )}
      </p>
    </div>
  )
}