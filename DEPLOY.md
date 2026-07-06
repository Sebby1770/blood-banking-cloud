# Deploy Blood Banking Cloud

Three ways to get a live website — pick what fits you.

---

## Option 1: Docker (fastest — run in your terminal)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
cd Documents/blood-banking-cloud
docker compose up --build -d
```

Open **http://localhost:4000** — frontend + API on one port.

Stop it:

```bash
docker compose down
```

---

## Option 2: Render.com (free public website)

Best for a permanent URL without managing servers. Render keeps your SQLite database on a persistent disk.

### Steps

1. Push this repo to GitHub (already done if you see this on `Sebby1770/blood-banking-cloud`).
2. Go to [render.com](https://render.com) → **New** → **Blueprint**.
3. Connect your GitHub account and select `blood-banking-cloud`.
4. Render reads `render.yaml` automatically — click **Apply**.
5. Wait ~5 minutes for the Docker build. Your site will be at:
   `https://blood-banking-cloud.onrender.com` (or similar).

> **Note:** Free tier sleeps after 15 min idle. First load may take ~30s to wake up.

### Or via Render CLI

```bash
npm install -g @renderinc/cli   # if available
render blueprint launch
```

---

## Option 3: Local production + Cloudflare Tunnel (instant public URL)

Great for demos without signing up for hosting.

```bash
cd Documents/blood-banking-cloud
npm run install:all
npm run build
cd backend && npm run seed && cd ..
npm start
```

In a **second terminal**, expose it publicly:

```bash
# Install once: brew install cloudflare/cloudflare/cloudflared
cloudflared tunnel --url http://localhost:4000
```

Copy the `https://*.trycloudflare.com` URL — that's your live site.

---

## Option 4: AWS (production-grade)

See [`infra/deploy.md`](infra/deploy.md) for EC2 + RDS + CloudFront setup.

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `NODE_ENV` | `development` | Set `production` to serve the React app |
| `DATABASE_URL` | `sqlite:./blood_bank.sqlite` | SQLite or Postgres URL |
| `LOW_STOCK_THRESHOLD` | `5` | Units before low-stock alert |
| `DONATION_COOLDOWN_DAYS` | `56` | Days between donations |

---

## Verify deployment

```bash
curl https://YOUR-URL/api/health
# {"status":"ok","service":"blood-banking-api","version":"0.3.0",...}
```

Open `https://YOUR-URL` in a browser — you should see the dashboard with live data.