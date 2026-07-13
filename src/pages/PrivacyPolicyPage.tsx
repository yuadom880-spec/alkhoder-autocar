import { Link } from 'react-router'
import { Mail } from 'lucide-react'
import { PageSeo } from '../components/seo/PageSeo'
import { EMAIL_OSAMA, SITE_COMPANY_NAME } from '../lib/constants'
import { copy } from '../lib/copy'
import { useLocale } from '../context/LocaleContext'
import { getPrivacyLastUpdated, getPrivacySections } from '../lib/i18n/privacy'
import { PRIVACY_POLICY_URL } from '../lib/privacyPolicy'

export function PrivacyPolicyPage() {
  const { locale } = useLocale()
  const sections = getPrivacySections(locale)
  const lastUpdated = getPrivacyLastUpdated(locale)

  return (
    <div className="page-shell">
      <PageSeo />
      <div className="container-main max-w-3xl">
        <p className="mb-2 text-sm text-brand-green font-semibold">{copy.privacy.title}</p>
        <h1 className="section-title mb-3">{copy.privacy.title}</h1>
        <p className="text-sm text-slate-500 mb-2">{SITE_COMPANY_NAME}</p>
        <p className="text-sm text-slate-500 mb-8">
          {copy.privacy.lastUpdated}: {lastUpdated}
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-brand-dark mb-3">{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc pr-5 space-y-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-slate-50 border border-slate-200 p-5 text-center">
          <p className="text-sm text-slate-600 mb-3">{copy.privacy.contactHint}</p>
          <a
            href={`mailto:${EMAIL_OSAMA}`}
            className="inline-flex items-center gap-2 text-brand-green font-semibold hover:underline"
          >
            <Mail className="h-4 w-4" />
            <span dir="ltr">{EMAIL_OSAMA}</span>
          </a>
          <p className="mt-4 text-xs text-slate-400 break-all" dir="ltr">
            {PRIVACY_POLICY_URL}
          </p>
        </div>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sm font-semibold text-brand-green hover:underline">
            {copy.privacy.backHome}
          </Link>
        </p>
      </div>
    </div>
  )
}