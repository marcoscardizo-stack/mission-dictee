import { defineConfig } from '@playwright/test';

/**
 * Tests de bout en bout sur la version de production (vite preview).
 * Profil principal : iPhone 16 Plus en portrait (430 × 932 CSS px, zone visible Safari ≈ 430 × 839).
 */
const IPHONE_16_PLUS = {
  viewport: { width: 430, height: 839 },
  screen: { width: 430, height: 932 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'fr-FR',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'iphone-16-plus', use: { browserName: 'chromium', ...IPHONE_16_PLUS } },
    { name: 'iphone-se', use: { browserName: 'chromium', ...IPHONE_16_PLUS, viewport: { width: 375, height: 667 }, screen: { width: 375, height: 667 } } },
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
