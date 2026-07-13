import { Link } from 'react-router'
import { Mail, MapPin, Phone } from 'lucide-react'
import {
  EMAIL_OSAMA,
  PHONE,
  PHONE_LINK,
  LOGO_URL,
  SITE_NAME_SHORT,
  WHATSAPP_LINK,
} from '../../lib/constants'
import { copy } from '../../lib/copy'
import { useLocale } from '../../context/LocaleContext'
import { getMainBranchDisplay } from '../../lib/i18n/labels'
import { getCityDisplayName, getSiteSeoPrimary } from '../../lib/i18n/seoPages'

import { SEO_CITIES, SEO_KEYWORDS_FOOTER_TEXT } from '../../lib/seo'
import { CopyrightNotice } from './CopyrightNotice'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  const { navLinks, locale } = useLocale()
  const siteName = getSiteSeoPrimary(locale)
  const mainBranch = getMainBranchDisplay(locale)

  return (
    <footer className="bg-brand-dark text-slate-300">
      <div className="container-main py-10 sm:py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={LOGO_URL} alt={copy.footer.brandAlt} className="h-12 w-auto rounded-lg object-contain" />
              <div>
                <span className="block text-lg font-bold text-white">{siteName}</span>
                <span className="block text-xs text-slate-400">{SITE_NAME_SHORT}</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">{copy.footer.desc}</p>
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-white">{copy.footer.social}</p>
              <SocialLinks />
            </div>
            <p className="mt-3 hidden text-[10px] leading-relaxed text-slate-600 md:block">{SEO_KEYWORDS_FOOTER_TEXT}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-white">{copy.footer.quickLinks}</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 hover:text-brand-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/cars"
                  className="text-sm text-slate-400 hover:text-brand-gold transition-colors"
                >
                  {copy.footer.bookNowLink}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-slate-400 hover:text-brand-gold transition-colors"
                >
                  {copy.privacy.link}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-white">{copy.footer.contact}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={PHONE_LINK}
                  className="flex items-start gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-brand-gold" />
                  <span>
                    {mainBranch.phoneLabel}
                    <span className="mt-0.5 block" dir="ltr">
                      {PHONE}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL_OSAMA}`}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-gold" />
                  <span dir="ltr" className="text-xs sm:text-sm">{EMAIL_OSAMA}</span>
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="text-brand-gold">{copy.footer.whatsapp}</span>
                  <span dir="ltr">{PHONE}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-gold" />
                <span>
                  {mainBranch.address} — {mainBranch.city}
                </span>
              </li>
              <li>
                <Link
                  to="/branches"
                  className="text-sm text-slate-400 hover:text-brand-gold transition-colors"
                >
                  {copy.home.allBranches} (35+)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold text-white">{copy.footer.hours}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{mainBranch.hours}</p>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-white">{copy.footer.rentalCities}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/locations" className="text-sm text-slate-400 hover:text-brand-gold transition-colors">
                  {copy.footer.allCities}
                </Link>
              </li>
              {SEO_CITIES.slice(0, 5).map((city) => (
                <li key={city.slug}>
                  <Link
                    to={`/locations/${city.slug}`}
                    className="text-sm text-slate-400 hover:text-brand-gold transition-colors"
                  >
                    {copy.footer.rentalInCity(getCityDisplayName(city.slug, locale))}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700/50 pt-6">
          <CopyrightNotice />
          <p className="mt-3 text-center text-[10px] text-slate-600 sm:text-xs">{copy.footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}