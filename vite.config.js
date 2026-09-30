import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Build-time site URL: fills __SITE_URL__ in index.html (Open Graph tags must be absolute and
 * crawlers do not run JS) and emits robots.txt pointing at the sitemap. Set SITE_URL in Vercel.
 */
const siteUrl = () => (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '')
const siteMeta = () => ({
  name: 'site-meta',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl()),
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard/\n\nSitemap: ${siteUrl() || 'https://example.com'}/sitemap.xml\n` })
  },
})

export default defineConfig({
  plugins: [react(), siteMeta()],
  build: {
    rollupOptions: {
      output: {
        // stable vendor chunks → better long-term caching between deploys (rolldown's native API;
        // its `manualChunks` compat layer mis-assigned React core to another chunk)
        advancedChunks: {
          groups: [
            { name: 'react', test: /[\/]node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/ },
            { name: 'motion', test: /framer-motion|motion-dom|motion-utils/ },
            { name: 'supabase', test: /@supabase/ },
            { name: 'forms', test: /react-hook-form|[\/]zod[\/]|@hookform/ },
            { name: 'charts', test: /recharts|[\/]d3-|victory-vendor|internmap|delaunator|robust-predicates/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    css: false,
    include: ['tests/**/*.test.{js,jsx}'],
  },
})
