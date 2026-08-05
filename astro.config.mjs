import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// 公開先は darari-nu.com 直下（2026-08-05裁定）。public/CNAME とセット。
export default defineConfig({
  site: 'https://darari-nu.com',
  base: '/',
  trailingSlash: 'always',
  output: 'static',
  integrations: [tailwind(), sitemap()],
});
