import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BudgetFlow',
    short_name: 'BudgetFlow',
    description: 'Quan ly ngan sach ca nhan bang hu tai chinh, toi uu cho trai nghiem mobile.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#0f172a',
    lang: 'vi',
    categories: ['finance', 'productivity', 'business'],
    icons: [
      {
        src: '/pwa-icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Mo Dashboard',
        short_name: 'Dashboard',
        url: '/dashboard',
      },
      {
        name: 'Ghi giao dich',
        short_name: 'Giao dich',
        url: '/transactions',
      },
    ],
  }
}
