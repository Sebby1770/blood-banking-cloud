# Blood Banking Via Cloud Computing

An online platform to manage **blood donations, storage, and distribution** by connecting donors, hospitals, and recipients with real-time visibility into supply.

This repo is a **working starter app** built with **Node.js + Express + SQLite** on the backend and **React + Vite** on the frontend, with optional **AWS** deployment templates.

---

## Features

- Track blood availability in real-time (by blood group and component)
- Match donors with recipient requests quickly (blood compatibility + city)
- **Donor eligibility** — enforces configurable donation cooldown (default 56 days)
- **Activity log** — audit trail for donations, requests, inventory, and registrations
- **Alert history** — persisted low-stock and new-request notifications with read/unread state
- **Blood compatibility matrix** — API and UI for recipient → donor matching rules
- Send alerts when inventory drops below a configurable threshold
- REST API accessible from anywhere (web, mobile, third-party integrations)
- Analytics: donation trends, fulfillment rate, inventory breakdown, activity feed
- React dashboard with dark mode, 8 pages, and inventory bar charts
- Optional AWS deployment (EC2 + RDS + S3 + SNS + Lambda)

---

## Architecture

```
                    +------------------+
                    |   React (Vite)   |
                    |    Frontend      |
                    +--------+---------+
                             | HTTPS / REST
                             v
                    +------------------+
                    |  Express API     |
                    |  Node.js         |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
              v              v              v
        +----------+   +-----------+   +-----------+
        |  RDS /   |   |   S3      |   |   SNS     |
        | SQLite   |   | (reports) |   | (alerts)  |
        +----------+   +-----------+   +-----------+
                             ^
                             |
                       +-----+------+
                       |  Lambda    |
                       | (low-stock |
                       |   cron)    |
                       +------------+
```

See [`infra/aws-architecture.md`](infra/aws-architecture.md) for the AWS deployment design.

---

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Cloud        | AWS (EC2, S3, Lambda, RDS, SNS)               |
| Backend      | Node.js, Express                              |
| ORM          | Sequelize                                     |
| Database     | SQLite (local), PostgreSQL/MySQL on RDS (prod)|
| Frontend     | React 18, Vite                                |
| Notifications| AWS SNS (stubbed locally to console)          |
| Analytics    | REST endpoints (compatible with QuickSight/Tableau via direct RDS access) |

---

## Project Structure

```
blood-banking-cloud/
├── backend/                # Express API
│   ├── server.js
│   ├── src/
│   │   ├── app.js
│   │   ├── db.js
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # REST routes
│   │   ├── services/       # Notifications, matching
│   │   ├── middleware/
│   │   └── seed.js
│   └── package.json
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── components/
│   ├── index.html
│   └── package.json
├── infra/                  # AWS templates & docs
│   ├── aws-architecture.md
│   ├── cloudformation.yaml
│   └── deploy.md
└── docs/
    ├── api.md
    └── schema.md
```

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed       # creates blood_bank.sqlite with sample data
npm run dev        # starts API on http://localhost:4000
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev        # starts UI on http://localhost:5173
```

Open <http://localhost:5173> — the dashboard will hit the local API.

### 3. Deploy as a live website

See **[DEPLOY.md](DEPLOY.md)** for full instructions. Quickest options:

```bash
# Docker — one command, opens on http://localhost:4000
docker compose up --build -d

# Or production mode locally
npm run install:all && npm run build && npm start
# → http://localhost:4000

# Free public URL via Render.com — connect GitHub repo, apply render.yaml blueprint
```

---

## API Overview

| Method | Path                          | Description                                   |
| ------ | ----------------------------- | --------------------------------------------- |
| GET    | `/api/health`                 | Health check                                  |
| GET    | `/api/donors`                 | List donors                                   |
| POST   | `/api/donors`                 | Register a donor                              |
| GET    | `/api/hospitals`              | List hospitals                                |
| POST   | `/api/hospitals`              | Register a hospital                           |
| GET    | `/api/inventory`              | Current blood inventory by group              |
| POST   | `/api/inventory/adjust`       | Add/remove units (also fires low-stock alert) |
| GET    | `/api/requests`               | List blood requests                           |
| POST   | `/api/requests`               | Create a request + auto-match donors          |
| GET    | `/api/donations`              | List donations                                |
| POST   | `/api/donations`              | Record a donation (increments inventory)      |
| GET    | `/api/analytics/trends`       | Monthly donation trends by blood group        |
| GET    | `/api/analytics/summary`      | Dashboard KPIs and inventory breakdown          |
| GET    | `/api/analytics/activity`     | Recent activity log entries                     |
| GET    | `/api/analytics/fulfillment`  | Request fulfillment statistics                  |
| GET    | `/api/alerts`                 | Alert history (filter `?unread=true`)           |
| POST   | `/api/alerts/:id/read`        | Mark alert as read                              |
| POST   | `/api/alerts/read-all`        | Mark all alerts as read                         |
| GET    | `/api/compatibility`          | Full blood compatibility matrix                 |
| GET    | `/api/compatibility/:group`   | Compatible donors for a recipient group         |
| GET    | `/api/donors/:id/eligibility` | Donor donation eligibility status               |
| GET    | `/api/requests/:id/matches`   | Preview matched donors for a request            |
| POST   | `/api/requests/:id/cancel`    | Cancel a pending request                        |

Full details in [`docs/api.md`](docs/api.md). See [`CHANGELOG.md`](CHANGELOG.md) for version history.

---

## Deploying to AWS

See [`infra/deploy.md`](infra/deploy.md) for the step-by-step guide. In summary:

1. Provision RDS (PostgreSQL) + an SNS topic + an S3 bucket via the CloudFormation template in `infra/cloudformation.yaml`.
2. Set `DATABASE_URL`, `AWS_REGION`, `SNS_TOPIC_ARN`, and `S3_BUCKET` in the EC2 environment.
3. `pm2 start backend/server.js` on EC2 (or wrap in a systemd unit).
4. Build the frontend (`npm run build`) and host the `dist/` folder on S3 + CloudFront.
5. Schedule a Lambda to hit `/api/inventory/check-thresholds` on a CloudWatch Events cron for proactive low-stock alerts.

---

## License

MIT — see [LICENSE](LICENSE).
