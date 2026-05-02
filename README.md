# Blood Banking Via Cloud Computing

An online platform to manage **blood donations, storage, and distribution** by connecting donors, hospitals, and recipients with real-time visibility into supply.

This repo is a **working starter app** built with **Node.js + Express + SQLite** on the backend and **React + Vite** on the frontend, with optional **AWS** deployment templates.

---

## Features

- Track blood availability in real-time (by blood group and component)
- Match donors with recipient requests quickly
- Send alerts when inventory drops below a configurable threshold
- REST API accessible from anywhere (web, mobile, third-party integrations)
- Donation-trend analytics endpoint (donations per month per blood group)
- React dashboard for hospitals/admins
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

Full details in [`docs/api.md`](docs/api.md).

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
