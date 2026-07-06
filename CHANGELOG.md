# Changelog

All notable changes to Blood Banking Via Cloud Computing are documented in this file.

## [0.5.0] - 2026-07-06

### Added
- **Blood drive campaigns** — schedule, activate, complete, and cancel community donation drives.
- **Donor portal** — public self-registration page for new donors.
- **Donor profiles** — click any donor to view full history and lifetime stats in a modal.
- **Bulk CSV import** — upload a CSV to register multiple donors at once.
- **API docs page** — browsable in-app reference for all REST endpoints.
- **Grouped navigation** — sidebar organized into Operations, Registry, Insights, System.
- **Mobile sidebar** — hamburger menu with slide-out nav on small screens.

### Changed
- Donors page links to profile modal; import/export actions in header.
- Seed data includes sample blood drive campaigns.

## [0.4.0] - 2026-07-06

### Added
- **Settings page** — configure org name, alert email, low-stock threshold, and donation cooldown from the UI.
- **Priority queue** — pending requests sorted by urgency with fulfill-ready indicators.
- **Donor outreach** — find eligible donors for each low-stock blood group, filterable by city.
- **Reports page** — city and blood-group charts, supply/demand forecast, fulfillment stats.
- **Toast notifications** — non-blocking success/error feedback across actions.
- **Dashboard quick actions** — one-click navigation to queue, outreach, requests, reports.
- **Keyboard shortcut** — ⌘K / Ctrl+K focuses global search.
- **Analytics** — donors-by-group, supply forecast, request queue API.
- **Richer seed data** — sample requests, alerts, and default settings on first run.

### Changed
- Sidebar shows organization name from settings.
- Emergency banner links directly to priority queue.
- Favicon and meta tags for production deployment.

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