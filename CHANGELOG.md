# Changelog

All notable changes to Blood Banking Via Cloud Computing are documented in this file.

## [0.3.0] - 2026-07-06

### Added
- **Production single-server mode** — Express serves the built React app; one URL for frontend + API.
- **Docker + docker-compose** — `docker compose up --build` runs the full site on port 4000.
- **Render.com blueprint** (`render.yaml`) — one-click free cloud deploy with persistent disk.
- **DEPLOY.md** — step-by-step deploy guide (Docker, Render, Cloudflare Tunnel, AWS).
- **Global search** — `GET /api/search?q=` across donors and requests; search bar in sidebar.
- **CSV export** — download donors, inventory, donations, and requests as CSV.
- **Live dashboard** — auto-refreshes every 30 seconds with "Live" indicator.
- **Emergency banner** — highlights critical blood requests on the dashboard.
- **Unread alert badge** — notification count in sidebar navigation.
- **Urgency analytics** — pending request breakdown by urgency level.
- **City analytics** — donor counts grouped by city.

### Changed
- Root `package.json` with unified `build`, `start`, and `deploy:local` scripts.
- Health endpoint reports v0.3.0.
- Dockerfile with smart entrypoint (seeds DB only on first run).

## [0.2.0] - 2026-07-06

### Added
- Activity log, alert history, donor eligibility, blood compatibility API.
- Dark mode, 8-page dashboard, GitHub Actions CI.

## [1.0.0] - 2025-05-02

### Added
- Initial release with Express API, SQLite database, React dashboard.