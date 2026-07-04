const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const isValid =
  url.length > 0 &&
  anonKey.length > 0 &&
  !url.includes('your-project') &&
  !anonKey.includes('your-anon')

export function getSupabaseEnv() {
  return { url, anonKey, isValid }
}