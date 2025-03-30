// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  redirects: { '/admin/': '/admin/index.html' },
  vite: { optimizeDeps: { include: ['gsap', 'split-type'] } },
  integrations: [tailwind(), icon()],
});
