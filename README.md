# Financial Budget Management Web App

Web quản lý ngân sách cá nhân đa người dùng theo mô hình **hũ tài chính**. Bản này dùng **đăng nhập thật bằng Supabase Auth** và lưu dữ liệu thật vào Supabase PostgreSQL.

## Công nghệ

- Next.js 14.2.15 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Server Actions / Route Handler style

## Chạy local

### 1. Cài package

```bash
npm install
```

### 2. Tạo Supabase project

Vào Supabase Dashboard, tạo project mới.

Sau đó vào **SQL Editor** và chạy toàn bộ file:

```bash
supabase/schema.sql
```

### 3. Tạo file môi trường

Copy `.env.example` thành `.env.local`:

```bash
cp .env.example .env.local
```

Điền 3 biến này từ Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Lưu ý: `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở server. Không đưa key này lên client hoặc public repo.

### 4. Bật đăng nhập Email/Password

Trong Supabase Dashboard:

Authentication → Providers → Email → Enable Email provider.

Khi test local, có thể tắt Confirm email để đăng ký xong vào app ngay:

Authentication → Providers → Email → Confirm email = OFF.

### 5. Chạy app

```bash
npm run dev
```

Mở:

```text
http://localhost:3000
```

## Chức năng đã có

- Trang landing hiện đại
- Đăng ký tài khoản thật qua Supabase Auth
- Đăng nhập / đăng xuất thật bằng Supabase session cookie
- Middleware bảo vệ dashboard
- Hồ sơ người dùng
- Tạo ngân sách tháng hiện tại
- Tạo hũ tài chính không giới hạn
- Cấu hình mục tiêu, màu, chế độ tính toán, rollover
- Thêm giao dịch chi tiêu
- Trừ tiền khỏi hũ sau khi chi
- Chuyển tiền giữa các hũ
- Dashboard tổng quan
- Hạn mức chi tiêu an toàn hôm nay
- Lịch sử giao dịch
- Báo cáo cơ bản theo hũ
- Audit log cho thao tác chính

## Ghi chú kiến trúc

Theo tài liệu nghiệp vụ, logic phân quyền và lọc dữ liệu được xử lý tại Next.js trước khi truy vấn Supabase. App dùng Supabase làm tầng lưu trữ dữ liệu, còn các thao tác ghi/đọc dữ liệu nghiệp vụ được thực hiện qua server với `SUPABASE_SERVICE_ROLE_KEY`.

## Deploy Vercel

Thêm đầy đủ biến môi trường trên Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Sau đó deploy như Next.js bình thường.
