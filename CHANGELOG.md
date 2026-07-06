# Changelog

All notable changes to Blood Banking Via Cloud Computing are documented in this file.

## [0.2.0] - 2026-07-06

### Added
- **Activity log** — persistent audit trail for donations, requests, inventory changes, and donor registrations.
- **Alert history** — low-stock and new-request notifications saved to the database with read/unread state.
- **Donor eligibility** — 56-day donation cooldown enforced server-side with per-donor eligibility status.
- **Blood compatibility API** — `GET /api/compatibility` matrix and per-group lookup.
- **Expanded analytics** — activity feed, fulfillment rate, inventory breakdown by blood group.
- **Request lifecycle** — cancel endpoint, match preview endpoint, improved fulfill validation.
- **Frontend pages** — Donations, Hospitals, Alerts, Compatibility.
- **Dark mode** — theme toggle with system preference detection and localStorage persistence.
- **Dashboard charts** — inventory bar chart, activity feed, fulfillment KPI.
- **CI workflow** — GitHub Actions smoke test on push.
- **Makefile** — `make dev`, `make seed`, `make smoke` shortcuts.

### Changed
- Inventory API returns status (`low` / `moderate` / `healthy`) and threshold per row.
- Donors list includes eligibility info; donation button disabled when in cooldown.
- Requests page supports status filtering and cancel action.
- Health endpoint returns version and timestamp.
- Notification service persists all alerts to the database.
- README updated with new API routes and features.

### Fixed
- Donor eligibility route ordering (specific routes before `/:id`).
- Analytics pending-request count now includes both `open` and `matched` statuses.

## [1.0.0] - 2025-05-02

### Added
- Initial release with Express API, SQLite database, React dashboard.
- Donor, hospital, inventory, request, and donation management.
- Auto donor matching by blood compatibility and city.
- Low-stock SNS notifications (console stub locally).
- Donation trend analytics.
- AWS CloudFormation deployment templates.