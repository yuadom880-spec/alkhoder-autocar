import { getCityBySlug } from '../seo'
import type { Locale } from './index'

const CITY_CONTENT_EN: Record<string, { intro: string; highlights: string[] }> = {
  madinah: {
    intro:
      'Car rental in Madinah with multiple branches near the airport and main landmarks. Daily and monthly rental with transparent pricing.',
    highlights: ['Airport Road branch', 'Flexible pickup', 'Ideal for visitors to the Prophet\'s Mosque'],
  },
  jeddah: {
    intro:
      'Car rental in Jeddah from Alkhoder branches — daily and monthly options for business travelers, families, and visitors.',
    highlights: ['Online booking', 'Diverse fleet', '24/7 support'],
  },
  riyadh: {
    intro:
      'Car rental in Riyadh with Alkhoder — flexible mobility for employees, companies, and visitors with a modern, well-maintained fleet.',
    highlights: ['Daily & monthly rental', 'Business solutions', 'Competitive rates'],
  },
  makkah: {
    intro:
      'Car rental in Makkah with reliable service and clear pricing — ideal for Umrah and family visits.',
    highlights: ['Ideal for Umrah', 'Daily rental', 'Fast booking'],
  },
  taif: {
    intro: 'Car rental in Taif with daily and monthly options and a fleet suited for trips and families.',
    highlights: ['Family cars', 'Transparent pricing', 'Regular maintenance'],
  },
  yanbu: {
    intro: 'Our Yanbu branch offers daily and monthly car rental with fast service and an updated fleet.',
    highlights: ['Yanbu branch', 'Flexible rental', 'Direct contact'],
  },
  tabuk: {
    intro: 'Car rental in Tabuk with daily and monthly options and round-the-clock support.',
    highlights: ['Tabuk branch', 'Online booking', 'Modern fleet'],
  },
  dammam: {
    intro: 'Car rental for the Eastern Province — Dammam, Khobar, and nearby cities.',
    highlights: ['Eastern Province coverage', 'Corporate rental', 'Transparent pricing'],
  },
}

export function getCityIntro(slug: string, locale: Locale): string {
  const city = getCityBySlug(slug)
  if (!city) return ''
  if (locale === 'en') return CITY_CONTENT_EN[slug]?.intro ?? city.intro
  return city.intro
}

export function getCityHighlights(slug: string, locale: Locale): string[] {
  const city = getCityBySlug(slug)
  if (!city) return []
  if (locale === 'en') return CITY_CONTENT_EN[slug]?.highlights ?? city.highlights
  return city.highlights
}