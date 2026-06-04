import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: any) { request.cookies.set({ name, value, ...options }); response = NextResponse.next({ request }); response.cookies.set({ name, value, ...options }) },
        remove(name: string, options: any) { request.cookies.set({ name, value: '', ...options }); response = NextResponse.next({ request }); response.cookies.set({ name, value: '', ...options }) }
      }
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const protectedPath = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/month-details') || request.nextUrl.pathname.startsWith('/buckets') || request.nextUrl.pathname.startsWith('/transactions') || request.nextUrl.pathname.startsWith('/reports') || request.nextUrl.pathname.startsWith('/settings')
  if (protectedPath && !user) return NextResponse.redirect(new URL('/login', request.url))
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && user) return NextResponse.redirect(new URL('/dashboard', request.url))
  return response
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
