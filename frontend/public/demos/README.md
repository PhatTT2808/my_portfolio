# Demo videos

Drop `.mp4` / `.webm` files here and reference them from `src/lib/cv.ts` as
`demo: "/demos/ten-file.mp4"` (path is relative to this folder, no `public/` prefix).

Keep files under ~10 MB — they are committed to git and served by Vercel. For anything
larger, upload to Supabase Storage (public bucket) or YouTube and use that URL instead.
