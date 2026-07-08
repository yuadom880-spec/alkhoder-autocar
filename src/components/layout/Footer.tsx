import { Link } from 'react-router'
import { Mail, MapPin, Phone } from 'lucide-react'
import {
  EMAIL_OSAMA,
  EMAIL_QA,
  MAIN_BRANCH,
  NAV_LINKS,
  PHONE,
  PHONE_LINK,
  LOGO_URL,
  SITE_COMPANY_NAME,
  SITE_NAME,
  SITE_NAME_SHORT,
  SITE_SEO_PRIMARY,
  TOLL_FREE,
  TOLL_FREE_LINK,
  WHATSAPP_LINK,
} from '../../lib/constants'
import { copy } from '../../lib/copy'
import { SEO_CITIES, SEO_KEYWORDS_FOOTER_TEXT } from '../../lib/seo'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  return (
    <footer className="bg-brand-dark text-slate-300">
      <div className="container-main py-10 sm:py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={LOGO_URL} alt={copy.footer.brandAlt} className="h-12 w-auto rounded-lg object-contain" />
              <div>
                <span className="block text-lg font-bold text-white">{SITE_SEO_PRIMARY}</span>
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
              {NAV_LINKS.map((link) => (
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
                  احجز سيارتك الآن
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
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                  <span dir="ltr">{PHONE}</span>
                </a>
              </li>
              <li>
                <a
                  href={TOLL_FREE_LINK}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                  <span>
                    الخط الموحد: <span dir="ltr">{TOLL_FREE}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL_QA}`}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand-gold" />
                  <span dir="ltr" className="text-xs sm:text-sm">{EMAIL_QA}</span>
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
                  <span className="text-brand-gold">واتساب</span>
                  <span dir="ltr">{PHONE}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-gold" />
                <span>
                  {MAIN_BRANCH.address} — {MAIN_BRANCH.city}
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
            <p className="text-sm text-slate-400 leading-relaxed">{MAIN_BRANCH.hours}</p>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-white">ايجار سيارات</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/locations" className="text-sm text-slate-400 hover:text-brand-gold transition-colors">
                  كل المدن
                </Link>
              </li>
              {SEO_CITIES.slice(0, 5).map((city) => (
                <li key={city.slug}>
                  <Link
                    to={`/locations/${city.slug}`}
                    className="text-sm text-slate-400 hover:text-brand-gold transition-colors"
                  >
                    ايجار سيارات {city.nameAr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700/50 pt-6 text-center text-xs text-slate-500 space-y-2">
          <p>© {new Date().getFullYear()} {SITE_COMPANY_NAME} — {SITE_NAME}. {copy.footer.rights}.</p>
          <p className="text-[10px] sm:text-xs text-slate-600 pt-1">{copy.footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}