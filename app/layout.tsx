import type { Metadata, Viewport } from 'next'
import { PwaRegistrar } from '@/components/PwaRegistrar'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'BudgetFlow',
  description: 'Quan ly ngan sach ca nhan bang hu tai chinh ngay tren dien thoai.',
  applicationName: 'BudgetFlow',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BudgetFlow',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/pwa-icon?size=192', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-icon?size=512', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <PwaRegistrar />
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  )
}
