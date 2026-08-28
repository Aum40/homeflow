# HomeFlow

ระบบติดตามงานก่อสร้างบ้าน ประกอบด้วยสองส่วนใน repo เดียว

| โฟลเดอร์ | เทคโนโลยี | Deploy ที่ |
| --- | --- | --- |
| [`homeflow-api`](homeflow-api) | NestJS 11 · Prisma 7 · PostgreSQL | Railway |
| [`homeflow-web`](homeflow-web) | Next.js 16 · NextAuth v5 · Tailwind | Vercel |

แต่ละโฟลเดอร์เป็นโปรเจกต์ pnpm อิสระ ไม่ได้ผูกเป็น workspace เดียวกัน จึงต้อง
`pnpm install` แยกกัน

## รันบนเครื่อง

ต้องมี Node 22+ , pnpm 11+ และ PostgreSQL

```bash
# backend
cd homeflow-api
cp .env.example .env        # แล้วเติมค่าให้ครบทุกตัว
pnpm install
pnpm prisma migrate deploy
pnpm db:seed                # สร้างบัญชีแอดมินจาก ADMIN_EMAIL / ADMIN_PASSWORD
pnpm start:dev

# frontend (อีก terminal)
cd homeflow-web
cp .env.example .env        # ตั้ง API_URL และสร้าง AUTH_SECRET ใหม่
pnpm install
pnpm dev
```

สร้าง `AUTH_SECRET` ด้วย `openssl rand -hex 32` — อย่าใช้ค่าซ้ำกับที่อื่น

เอกสาร API เปิดที่ `/api` เฉพาะตอนที่ `NODE_ENV` ไม่ใช่ `production`

## Deploy

### ลำดับสำคัญ

`FRONTEND_URL` ของ backend ต้องเป็นโดเมน Vercel และ `API_URL` ของ frontend ต้องเป็น
โดเมน Railway ทั้งคู่อ้างถึงกันไขว้ จึงต้องทำเป็นสามรอบ

1. Deploy Railway โดยใส่ `FRONTEND_URL` เป็นค่าชั่วคราวที่เป็น URL ถูก format
2. Deploy Vercel โดยตั้ง `API_URL` เป็นโดเมน Railway ที่เพิ่งได้
3. กลับไปแก้ `FRONTEND_URL` บน Railway เป็นโดเมน Vercel จริง แล้ว redeploy

ข้ามข้อ 3 ไม่ได้ เพราะลิงก์รีเซ็ตรหัสผ่านที่ส่งเข้าอีเมลผู้ใช้สร้างจากค่านี้

### Railway (`homeflow-api`)

| ตั้งค่า | ค่า |
| --- | --- |
| Root Directory | `homeflow-api` |

build command, pre-deploy command, start command และ healthcheck path อยู่ใน
[homeflow-api/railway.json](homeflow-api/railway.json) แล้ว ไม่ต้องกรอกใน dashboard
ซ้ำ เหลือแค่ Root Directory ที่เป็น service setting จึงตั้งในไฟล์ไม่ได้

ไฟล์เดียวกันตั้ง `watchPatterns` ไว้ที่ `homeflow-api/**` เพื่อไม่ให้ push ที่แก้แค่
`homeflow-web` ไป trigger การ build API ใหม่

env ที่ต้องมี — **ขาดตัวใดตัวหนึ่งแอปจะไม่ start เลย** เพราะตรวจด้วย Zod ตอน boot

`DATABASE_URL` (ผูกกับ Postgres service ด้วย `${{Postgres.DATABASE_URL}}`) ·
`ACCESS_TOKEN_SECRET` (อย่างน้อย 32 ตัวอักษร) · `ACCESS_TOKEN_EXPIRES_IN` (วินาที) ·
`CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` ·
`FRONTEND_URL` · `SMTP_HOST` · `SMTP_PORT` · `SMTP_USER` · `SMTP_PASSWORD` ·
`MAIL_FROM`

`PORT` Railway ใส่ให้เอง และควรตั้ง `NODE_ENV=production` เพื่อปิด Swagger

จะ seed แอดมินคนแรกต้องเพิ่ม `ADMIN_EMAIL` กับ `ADMIN_PASSWORD` แล้วรัน
`pnpm db:seed` ผ่าน Railway CLI ครั้งเดียว

### Vercel (`homeflow-web`)

| ตั้งค่า | ค่า |
| --- | --- |
| Root Directory | `homeflow-web` |

[homeflow-web/vercel.json](homeflow-web/vercel.json) ตั้ง `ignoreCommand` ไว้ให้ Vercel
ข้าม build เมื่อ commit นั้นไม่ได้แตะไฟล์ในโฟลเดอร์นี้เลย

env ที่ต้องมี: `API_URL` (โดเมน Railway) และ `AUTH_SECRET` (ค่าใหม่)

## การอัปโหลดรูป

เบราว์เซอร์ขอ signature จาก `POST /uploads/signature` แล้วอัปไฟล์เข้า Cloudinary
โดยตรง จากนั้นส่งเฉพาะ URL กลับมาให้ backend บันทึก

ทำแบบนี้เพราะ Vercel จำกัด request body ของ serverless function ไว้ที่ 4.5MB ซึ่ง
config ของ Next override ไม่ได้ ถ้าให้ไฟล์วิ่งผ่าน Server Action รูปจากมือถือที่มัก
ใหญ่ 2-8MB จะอัปไม่ผ่านบน production

backend ตรวจทุก URL ที่รับเข้ามาว่าขึ้นต้นด้วย
`https://res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/` เท่านั้น เพื่อกันไม่ให้ผู้ใช้
ที่ล็อกอินแล้วยัด URL ภายนอกเข้าฐานข้อมูล
