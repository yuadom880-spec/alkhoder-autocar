import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router'
import { Lock, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { setAdminSession, validateGeneralAdminCredentials } from '../../lib/admin'
import {
  resolveBranchIdForAccount,
  validateBranchAdminCredentials,
} from '../../lib/branchAdmin'
import { ensureSupabaseAdminAuth, isSupabaseConfigured } from '../../lib/supabase'
import { CopyrightNotice } from '../../components/layout/CopyrightNotice'
import { PageSeo } from '../../components/seo/PageSeo'
import { LOGO_URL, SITE_NAME } from '../../lib/constants'

export function AdminLoginPage() {
  const { isAdmin, isLoading, refresh } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAdmin) return <Navigate to="/admin" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (validateGeneralAdminCredentials(username, password)) {
        setAdminSession(username, 'general')
      } else {
        const account = validateBranchAdminCredentials(username, password)
        if (!account) {
          setError('رقم الجوال أو كلمة المرور غير صحيحة')
          return
        }

        if (isSupabaseConfigured) {
          await ensureSupabaseAdminAuth()
        }

        const branchId = await resolveBranchIdForAccount(account)
        if (!branchId) {
          setError('تعذّر ربط الحساب بفرعك — تواصل مع الإدارة العامة')
          return
        }

        setAdminSession(username, 'branch', branchId)
      }

      if (isSupabaseConfigured) {
        await ensureSupabaseAdminAuth()
      }

      await refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الدخول'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-bl from-brand-dark to-brand-navy">
      <PageSeo />
      <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <img
            src={LOGO_URL}
            alt={SITE_NAME}
            className="mx-auto mb-4 h-20 w-auto rounded-xl object-contain"
          />
          <h1 className="text-xl font-bold text-brand-dark">{SITE_NAME}</h1>
          <p className="text-sm text-slate-500 mt-1">لوحة الإدارة — الإدارة العامة أو موظف فرع</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field" htmlFor="username">
              رقم الجوال
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                type="tel"
                dir="ltr"
                className="input-field pl-10 text-left"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="05xxxxxxxx"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="password">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={submitting}>
            <Lock className="h-4 w-4" />
            دخول لوحة الإدارة
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          <a href="/" className="hover:text-brand-green transition-colors">
            العودة للموقع
          </a>
        </p>
      </div>
      </div>
      <CopyrightNotice variant="admin" />
    </div>
  )
}