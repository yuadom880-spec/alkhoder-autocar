import { formatDate } from './utils'

export type PickupPeriod = 'am' | 'pm'

export const PICKUP_PERIOD_LABELS: Record<PickupPeriod, string> = {
  am: 'صباحاً',
  pm: 'مساءً',
}

export const PICKUP_HOURS: Record<PickupPeriod, string[]> = {
  am: ['8', '9', '10', '11'],
  pm: ['12', '1', '2', '3', '4', '5', '6', '7', '8'],
}

export function getPickupDateOptions(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate || endDate < startDate) return []
  const dates: string[] = []
  const cursor = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  while (cursor <= end) {
    dates.push(cursor.toISOString().split('T')[0])
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function to24HourTime(hour: string, period: PickupPeriod): string {
  let h = Number.parseInt(hour, 10)
  if (Number.isNaN(h)) return '08:00'
  if (period === 'pm' && h !== 12) h += 12
  if (period === 'am' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:00`
}

export function formatPickupTimeLabel(
  pickupDate: string,
  hour: string,
  period: PickupPeriod,
): string {
  const periodLabel = PICKUP_PERIOD_LABELS[period]
  return `${formatDate(pickupDate)} · ${hour}:00 ${periodLabel}`
}

export function buildPickupTimeValue(
  pickupDate: string,
  hour: string,
  period: PickupPeriod,
): string {
  return `${formatPickupTimeLabel(pickupDate, hour, period)} (${to24HourTime(hour, period)})`
}