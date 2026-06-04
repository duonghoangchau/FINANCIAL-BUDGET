import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
export const metadata: Metadata = { title: 'Financial Budget Management', description: 'Quản lý ngân sách cá nhân bằng hũ tài chính' }
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="vi"><body><Toaster richColors position="top-right" />{children}</body></html> }
