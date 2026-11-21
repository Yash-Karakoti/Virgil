# A Better Neighbourhood (Virgil)

Community civic reporting platform for **Smart India Hackathon** — citizens report neighbourhood issues, authorities triage and resolve them, with optional ML-assisted categorisation.

## Repository layout

| Directory | Description |
|-----------|-------------|
| [`website-main`](website-main/) | Public Next.js app (reports, auth, landing) — port **3000** |
| [`server-main`](server-main/) | Express API + Prisma/PostgreSQL — port **3080** (`/api`) |
| [`admin-panel-main`](admin-panel-main/) | Authority dashboard — port **3001** |
| [`model-model`](model-model/) | YOLOv8 pothole detection API (Python/Docker) |

## Quick start

### 1. API server

```bash
cd server-main
cp .env.example .env   # edit DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma migrate deploy
npm run db:generate
npm run dev
```

Health: `http://localhost:3080/health`

### 2. Website

```bash
cd website-main
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. For UI-only development, set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local`.

### 3. Admin panel (optional)

```bash
cd admin-panel-main
cp .env.example .env.local
npm install
npm run dev -- -p 3001
```

## Testing

See [`TESTING.md`](TESTING.md).

```bash
cd server-main && npm test
cd ../website-main && npm test
```

CI runs both via [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Push to GitHub

From the repo root (`Virgil`):

```bash
git init
git add .
git commit -m "Initial monorepo: A Better Neighbourhood platform"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USER` / `YOUR_REPO` with your GitHub remote. Do not commit `.env` files — use the `.env.example` templates only.

## Documentation

- Server API: [`server-main/API_DOCUMENTATION.md`](server-main/API_DOCUMENTATION.md)
- Reports API v2: [`server-main/REPORTS_API_V2_DOCUMENTATION.md`](server-main/REPORTS_API_V2_DOCUMENTATION.md)