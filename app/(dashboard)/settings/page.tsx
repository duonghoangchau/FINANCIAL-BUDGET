import { getUserData } from '@/lib/data'

export default async function Settings() {
  const { profile, user } = await getUserData()

  return (
    <div>
      <h1 className="text-2xl font-black sm:text-3xl">Cài đặt</h1>

      <div className="card mt-6 max-w-2xl p-6">
        <h2 className="font-black">Hồ sơ</h2>

        <div className="mt-4 grid gap-3 text-sm sm:text-base">
          <p className="break-all">
            <b>Email:</b> {user.email}
          </p>
          <p>
            <b>Họ tên:</b> {profile?.full_name || 'Chưa cập nhật'}
          </p>
          <p>
            <b>Tiền tệ:</b> {profile?.currency || 'VND'}
          </p>
          <p className="break-all">
            <b>Múi giờ:</b> {profile?.timezone || 'Asia/Ho_Chi_Minh'}
          </p>
        </div>

        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          Đổi mật khẩu / avatar có thể mở rộng tiếp bằng Supabase Auth API. Bản này ưu tiên chạy
          được ngay và đủ luồng ngân sách chính.
        </p>
      </div>
    </div>
  )
}
