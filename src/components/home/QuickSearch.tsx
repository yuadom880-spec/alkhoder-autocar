import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Search } from 'lucide-react'
import { copy } from '../../lib/copy'
import { fetchBranches } from '../../lib/supabase'
import type { BranchRecord } from '../../lib/types'
import { Button } from '../ui/Button'

const today = () => new Date().toISOString().split('T')[0]

export function QuickSearch() {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [branchId, setBranchId] = useState('')
  const [branches, setBranches] = useState<BranchRecord[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBranches({ activeOnly: true })
      .then(setBranches)
      .catch(console.error)
  }, [])

  const handleSearch = () => {
    if (!startDate || !endDate) {
      setError('حدد التواريخ عشان نعرض لك السيارات')
      return
    }
    if (endDate < startDate) {
      setError('تاريخ النهاية لازم يكون بعد البداية')
      return
    }
    const params = new URLSearchParams({ start: startDate, end: endDate })
    if (branchId) params.set('branch', branchId)
    navigate(`/cars?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="relative z-10 mt-[4.5rem] px-0 pb-2 sm:mt-12 md:absolute md:bottom-0 md:left-0 md:right-0 md:mt-0 md:translate-y-[71%] md:px-4 md:pb-0"
    >
      <div className="container-main">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl shadow-brand-dark/10 sm:p-6 sm:shadow-2xl">
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <Calendar className="h-5 w-5 shrink-0 text-brand-green" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-brand-dark sm:text-base">{copy.home.quickSearch}</p>
              <p className="text-[11px] text-slate-500 sm:text-xs">{copy.home.quickSearchSub}</p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            <div>
              <label className="label-field text-xs text-black">{copy.home.fromDate}</label>
              <input
                type="date"
                min={today()}
                className="input-field text-black"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setError('')
                }}
              />
            </div>
            <div>
              <label className="label-field text-xs text-black">{copy.home.toDate}</label>
              <input
                type="date"
                min={startDate || today()}
                className="input-field text-black"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setError('')
                }}
              />
            </div>
            <div>
              <label className="label-field text-xs text-black flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-brand-green" />
                {copy.cars.chooseBranch}
              </label>
              <select
                className="input-field text-black"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                <option value="">{copy.cars.allBranches}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full min-h-[48px]" size="lg" onClick={handleSearch}>
                <Search className="h-4 w-4" />
                {copy.home.searchCars}
              </Button>
            </div>
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </motion.div>
  )
}