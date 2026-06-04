import { Shell } from '@/components/Shell'
import { createClientServer } from '@/lib/supabase'
import { redirect } from 'next/navigation'
export default async function DashboardLayout({children}:{children:React.ReactNode}){const s=createClientServer(); const {data:{user}}=await s.auth.getUser(); if(!user) redirect('/login'); return <Shell email={user.email}>{children}</Shell>}
