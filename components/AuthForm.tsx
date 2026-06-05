import Link from 'next/link'

export function AuthForm({
  mode,
  action,
  error,
}: {
  mode: 'login' | 'register'
  action: any
  error?: string
}) {
  const isLogin = mode === 'login'

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4 sm:p-6">
      <form action={action} className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-3xl font-black">{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
        {/* <p className="mt-2 text-slate-500">Dùng Supabase Auth thật, session lưu bằng cookie.</p> */}

        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!isLogin && (
          <label className="mt-6 block text-sm font-bold">
            Họ tên
            <input name="full_name" required className="input mt-2" placeholder="NGUYEN VAN A" />
          </label>
        )}

        <label className="mt-5 block text-sm font-bold">
          Email
          <input name="email" type="email" required className="input mt-2" placeholder="you@email.com" />
        </label>

        <label className="mt-5 block text-sm font-bold">
          Mật khẩu
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="input mt-2"
            placeholder="Tối thiểu 6 ký tự"
          />
        </label>

        <button className="btn btn-primary mt-6 w-full">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>

        <p className="mt-5 text-center text-sm text-slate-500">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <Link className="font-bold text-slate-900" href={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </Link>
        </p>
      </form>
    </main>
  )
}
