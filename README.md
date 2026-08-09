# Portfolio cá nhân

Portfolio với khung nghe nhạc Spotify, khu vực project (video demo + mô tả), và các trang cá nhân
có mật khẩu: học từ vựng tiếng Anh, todo list, thời khóa biểu, quản lý chi tiêu.

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind v4 — design system nằm trong
  `frontend/src/app/globals.css` (tokens màu, typography, card/button/input, animation)

- **Backend:** Python / FastAPI
- **Database:** Supabase (Postgres)
- **Deploy:** Vercel (cả frontend và backend) — tất cả đều dùng gói miễn phí

```
my_portfolio/
├── frontend/          # Next.js
├── backend/           # FastAPI
├── supabase/          # schema.sql
└── DESIGN.md          # design system
```

---

## 1. Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com) (gói Free).
2. Mở **SQL Editor**, dán toàn bộ nội dung `supabase/schema.sql` rồi **Run**.
3. Vào **Project Settings → API**, copy `Project URL` và `service_role` key.

> `service_role` key có toàn quyền — chỉ để ở backend, tuyệt đối không đưa vào frontend.

## 2. Chạy backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env          # macOS/Linux: cp .env.example .env
```

Điền `.env`:

```bash
# Mật khẩu vào khu vực riêng tư (lưu dạng sha256, không lưu plaintext)
python -c "import hashlib;print(hashlib.sha256('MAT_KHAU_CUA_BAN'.encode()).hexdigest())"

# Khóa ký token
python -c "import secrets;print(secrets.token_hex(32))"
```

Chạy:

```bash
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

## 3. Chạy frontend

```bash
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Mở http://localhost:3000

---

## 4. Đưa lên GitHub

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

`.gitignore` đã loại trừ `.env`, `node_modules/`, `.next/`.

## 5. Deploy lên Vercel

Tạo **hai** project Vercel từ cùng một repo.

**Backend** — Root Directory: `backend`

| Env | Giá trị |
|---|---|
| `SUPABASE_URL` | URL Supabase |
| `SUPABASE_SERVICE_KEY` | service_role key |
| `PRIVATE_PASSWORD_HASH` | sha256 của mật khẩu |
| `JWT_SECRET` | chuỗi ngẫu nhiên |
| `CORS_ORIGINS` | URL frontend, vd `https://ten-cua-ban.vercel.app` |

**Frontend** — Root Directory: `frontend`

| Env | Giá trị |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | URL backend, vd `https://backend-lac-mu-44.vercel.app` |

> Deploy backend trước để lấy URL, sau đó điền vào frontend. Nhớ cập nhật `CORS_ORIGINS`
> của backend bằng URL frontend thật rồi redeploy.
>
> **Lưu ý:** Nếu gặp lỗi "Failed to fetch" khi thêm từ vựng / todo, kiểm tra:
> 1. `NEXT_PUBLIC_API_BASE_URL` trong Vercel frontend phải trỏ đúng URL backend đã deploy.
> 2. `CORS_ORIGINS` trong Vercel backend phải chứa URL frontend thật.
> 3. Redeploy cả hai sau khi sửa env.

---

## 6. Thêm / sửa nội dung

Trang chủ lấy nội dung từ **hai nguồn**. Cần sửa gì thì tìm đúng nguồn của nó:

| Phần trên trang | Nguồn | Sửa ở đâu |
|---|---|---|
| Tên, chức danh, bio, Spotify, email/GitHub/LinkedIn | Supabase | bảng `profile` |
| Section **Projects & experience** (timeline) | file tĩnh | `frontend/src/lib/cv.ts` |
| Section **Featured projects** (card có video demo) | Supabase | bảng `projects` |
| Education, Skills, Certifications, Languages, số điện thoại | file tĩnh | `frontend/src/lib/cv.ts` |

### Cách 1 — sửa CV (không cần Supabase)

Mở `frontend/src/lib/cv.ts` và sửa trực tiếp. Thêm một dự án vào timeline = thêm một object
vào mảng `experience`:

```ts
{
  title: "Tên dự án",
  context: "Personal Project · FPT University",
  period: "01/2026 – 03/2026",
  highlights: [
    "Câu mô tả 1 — nên có số liệu cụ thể.",
    "Câu mô tả 2.",
  ],
  tags: ["Python", "PyTorch"],

  // Cả hai đều tùy chọn — bỏ đi thì phần đó không hiện.
  repo: "https://github.com/PhatTT2808/ten-repo",
  demo: "/demos/ten-file.mp4",
},
```

**`repo`** — dán link GitHub, trang sẽ hiện nút "View repository on GitHub",
bấm vào mở tab mới sang đúng repo.

**`demo`** — video demo hiện ngay dưới dự án. Nhận 2 dạng:

| Dạng | Ví dụ | Khi nào dùng |
|---|---|---|
| YouTube | `https://youtu.be/abc123` | video dài, không tốn dung lượng repo |
| File video | `/demos/ten-file.mp4` | video ngắn, muốn tự host |

Với file video: copy file `.mp4` / `.webm` vào `frontend/public/demos/`, rồi ghi
`demo: "/demos/ten-file.mp4"`. Nên giữ file dưới ~10 MB; nếu lớn hơn thì upload lên
Supabase Storage (bucket public) hoặc YouTube rồi dán URL vào.

Các mảng `skills`, `certifications`, `languages` sửa y hệt. Sau đó:


```bash
cd frontend
npm run build     # kiểm tra không lỗi
git add . && git commit -m "Update CV" && git push
```

Vercel tự deploy lại. Cách này đơn giản nhất, hợp với thông tin ít thay đổi.

### Cách 2 — thêm project vào Supabase (có video demo)

Vào **Table Editor → `projects` → Insert row**. Không cần build hay deploy lại,
trang tự cập nhật sau tối đa 60 giây (ISR `revalidate: 60`).

| Cột | Ghi chú |
|---|---|
| `title`, `description` | tiêu đề và mô tả |
| `video_url` | link YouTube (tự chuyển sang embed) **hoặc** link file `.mp4`/`.webm` từ Supabase Storage |
| `tags` | mảng Postgres, vd `{Python,FastAPI}` |
| `repo_url`, `live_url` | tùy chọn |
| `sort_order` | số nhỏ hiện trước |
| `published` | `false` để ẩn khỏi trang |


Section "Featured projects" chỉ hiện khi bảng `projects` có ít nhất một dòng `published = true`,
nên nếu chưa dùng tới thì trang vẫn gọn gàng.

> **Lưu ý:** ba dự án AI hiện tại nằm trong `cv.ts`. Nếu sau này bạn thêm chúng vào bảng
> `projects` (để có video demo), nhớ xóa khỏi `cv.ts` để tránh hiện trùng hai lần.

**Từ vựng / todo / thời khóa biểu / chi tiêu:** thêm trực tiếp trên web tại `/vocabulary`
và `/planner` sau khi nhập mật khẩu.

---


## Bảo mật

- Mật khẩu chỉ lưu dạng sha256 trong biến môi trường, không nằm trong code.
- Trang chủ là public; `/vocabulary` và `/planner` yêu cầu token JWT cho **mọi** request API —
  chặn ở backend chứ không chỉ ẩn giao diện.
- RLS bật trên tất cả bảng và không có policy cho anon key, nên chỉ backend truy cập được dữ liệu.
