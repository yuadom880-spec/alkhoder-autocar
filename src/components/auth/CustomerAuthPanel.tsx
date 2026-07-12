import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, LogIn, Mail, UserPlus } from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { formatAuthErrorMessage } from '../../lib/authErrors'
import { copy } from '../../lib/copy'
import { Button } from '../ui/Button'

type AuthMode = 'login' | 'register'
type AuthVariant = 'booking' | 'header'

interface CustomerAuthPanelProps {
  variant?: AuthVariant
  onSuccess?: () => void
}

export function CustomerAuthPanel({ variant = 'booking', onSuccess }: CustomerAuthPanelProps) {
  const { signIn, signUp, verifyEmailOtp, resendEmailOtp } = useCustomerAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [verifyStep, setVerifyStep] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(0)

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = window.setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendSeconds])

  const title =
    variant === 'header' ? copy.customerAuth.headerTitle : copy.booking.authRequired
  const subtitle = verifyStep
    ? copy.customerAuth.emailVerifySub
    : variant === 'header'
      ? copy.customerAuth.headerSub
      : copy.booking.authRequiredSub

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError(copy.customerAuth.errors.emailPassword)
      return
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError(copy.customerAuth.errors.nameRequired)
        return
      }
      if (password.length < 6) {
        setError(copy.customerAuth.errors.passwordShort)
        return
      }
      if (password !== confirmPassword) {
        setError(copy.customerAuth.errors.passwordMismatch)
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(trimmedEmail, password)
        onSuccess?.()
      } else {
        const needsVerify = await signUp(trimmedEmail, password, fullName.trim())
        if (needsVerify) {
          setVerifyStep(true)
          setOtp('')
          setResendSeconds(60)
        } else {
          onSuccess?.()
        }
      }
    } catch (err) {
      setError(
        formatAuthErrorMessage(err) ||
          (mode === 'login'
            ? copy.customerAuth.errors.loginFailed
            : copy.customerAuth.errors.registerFailed),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) {
      setError(copy.customerAuth.errors.otpRequired)
      return
    }

    setLoading(true)
    try {
      await verifyEmailOtp(email.trim(), otp.trim())
      onSuccess?.()
    } catch (err) {
      setError(formatAuthErrorMessage(err) || copy.customerAuth.errors.otpInvalid)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendSeconds > 0 || loading) return
    setError('')
    setLoading(true)
    try {
      await resendEmailOtp(email.trim())
      setResendSeconds(60)
    } catch (err) {
      setError(formatAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="mb-5 text-center">
        <h2 className="text-lg font-bold text-brand-dark">
          {verifyStep ? copy.customerAuth.emailVerifyTitle : title}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        {verifyStep && (
          <p className="mt-2 text-sm font-semibold text-brand-green" dir="ltr">
            {email.trim()}
          </p>
        )}
      </div>

      {!verifyStep && (
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError('')
            }}
            className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
              mode === 'login'
                ? 'bg-brand-green text-white'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            {copy.customerAuth.loginTitle}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError('')
            }}
            className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
              mode === 'register'
                ? 'bg-brand-green text-white'
                : 'text-slate-500 hover:text-brand-dark'
            }`}
          >
            {copy.customerAuth.registerTitle}
          </button>
        </div>
      )}

      {verifyStep ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="label-field" htmlFor="auth-otp">
              {copy.customerAuth.otpCode}
            </label>
            <input
              id="auth-otp"
              type="text"
              inputMode="numeric"
              dir="ltr"
              className="input-field text-center text-lg tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              autoComplete="one-time-code"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <Button type="submit" className="w-full min-h-[48px]" disabled={loading}>
            {loading ? '...' : copy.customerAuth.verifyEmailBtn}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="font-semibold text-slate-600 hover:text-brand-dark"
              onClick={() => {
                setVerifyStep(false)
                setOtp('')
                setError('')
              }}
            >
              {copy.customerAuth.backToRegister}
            </button>
            <button
              type="button"
              className="font-semibold text-brand-green disabled:text-slate-400"
              disabled={resendSeconds > 0 || loading}
              onClick={() => void handleResend()}
            >
              {resendSeconds > 0
                ? `${copy.customerAuth.resendIn} ${resendSeconds}`
                : copy.customerAuth.resendOtp}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="label-field" htmlFor="auth-full-name">
                {copy.customerAuth.fullName} *
              </label>
              <input
                id="auth-full-name"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div>
            <label className="label-field" htmlFor="auth-email">
              {copy.customerAuth.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-email"
                type="email"
                dir="ltr"
                className="input-field pl-10 text-left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="auth-password">
              {copy.customerAuth.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-password"
                type="password"
                dir="ltr"
                className="input-field pl-10 text-left"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="label-field" htmlFor="auth-confirm-password">
                {copy.customerAuth.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-confirm-password"
                  type="password"
                  dir="ltr"
                  className="input-field pl-10 text-left"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <Button type="submit" className="w-full min-h-[48px]" disabled={loading}>
            {mode === 'login' ? (
              <>
                <LogIn className="h-4 w-4" />
                {loading ? '...' : copy.customerAuth.loginBtn}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {loading ? '...' : copy.customerAuth.registerBtn}
              </>
            )}
          </Button>
        </form>
      )}

      {!verifyStep && (
        <p className="mt-4 text-center text-xs text-slate-500">
          {mode === 'login' ? copy.customerAuth.noAccount : copy.customerAuth.hasAccount}
        </p>
      )}
    </div>
  )
}