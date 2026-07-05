import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const SITE_URL = (process.env.VITE_SITE_URL || 'https://alkhodercar.com').replace(/\/$/, '')
const today = new Date().toISOString().split('T')[0]

const CITY_SLUGS = [
  'madinah',
  'jeddah',
  'riyadh',
  'makkah',
  'taif',
  'yanbu',
  'tabuk',
  'dammam',
]

const ROUTES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/cars', priority: '0.9', changefreq: 'daily' },
  { loc: '/offers', priority: '0.9', changefreq: 'weekly' },
  { loc: '/locations', priority: '0.9', changefreq: 'weekly' },
  ...CITY_SLUGS.map((slug) => ({
    loc: `/locations/${slug}`,
    priority: '0.85',
    changefreq: 'weekly',
  })),
  { loc: '/branches', priority: '0.8', changefreq: 'monthly' },
  { loc: '/about', priority: '0.7', changefreq: 'monthly' },
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.loc === '/' ? '/' : r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`

for (const dir of ['public', 'dist']) {
  const target = path.join(root, dir)
  if (!fs.existsSync(target)) continue
  fs.writeFileSync(path.join(target, 'sitemap.xml'), sitemap, 'utf8')
  fs.writeFileSync(path.join(target, 'robots.txt'), robots, 'utf8')
}

console.log(`SEO files generated for ${SITE_URL}`)