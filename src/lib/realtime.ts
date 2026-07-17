import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

import { isAdminSession } from './admin'
import { isSupabaseConfigured, supabase, supabaseAdmin } from './supabase'

export type RealtimeTable = 'bookings' | 'cars' | 'featured_offers'

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(fn, ms)
  }
}

function resolveRealtimeClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  // لوحة الإدارة: استخدم جلسة الأدمن المنفصلة
  if (isAdminSession() && supabaseAdmin) return supabaseAdmin
  return supabase
}

/**
 * يشترك في تغييرات جدول Supabase Realtime ويعيد تحميل البيانات تلقائياً.
 * يُستخدم: حجوزات (أدمن) + سيارات/عروض (عميل).
 */
export function subscribeToTable(
  table: RealtimeTable,
  onChange: () => void,
  debounceMs = 400,
): () => void {
  const client = resolveRealtimeClient()
  if (!client) return () => {}

  const debounced = debounce(onChange, debounceMs)
  const channelName = `rt:${table}:${Math.random().toString(36).slice(2, 9)}`

  const channel: RealtimeChannel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => debounced(),
    )
    .subscribe()

  return () => {
    void client.removeChannel(channel)
  }
}
