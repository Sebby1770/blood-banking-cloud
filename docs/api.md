# API Reference

Base URL: `http://localhost:4000` in development.
All requests/responses are JSON.

All routes except `GET /api/health` require an API token when
`API_AUTH_TOKEN` is configured. Send it as either:

```http
X-API-Key: <API_AUTH_TOKEN>
Authorization: Bearer <API_AUTH_TOKEN>
```

If this API is reached from a public browser bundle, treat the token as a
deployment guard only. Browser environment variables are visible to users, so
public dashboards need real user authentication or private access control.

## Health

```http
GET /api/health
→ 200 { "status": "ok", "service": "blood-banking-api" }
```

## Donors

```http
GET    /api/donors?bloodGroup=O+&city=Mumbai&available=true
GET    /api/donors/:id
POST   /api/donors      { name, email, phone, bloodGroup, city }
PATCH  /api/donors/:id  { ...partial }
DELETE /api/donors/:id
```

`bloodGroup` ∈ `A+ A- B+ B- AB+ AB- O+ O-`.

## Hospitals

```http
GET    /api/hospitals
GET    /api/hospitals/:id
POST   /api/hospitals  { name, city, contactEmail, contactPhone }
```

## Inventory

```http
GET   /api/inventory                                  # current units per group
POST  /api/inventory/adjust  { bloodGroup, delta }    # delta can be negative
GET   /api/inventory/check-thresholds                 # fires SNS alerts for low groups
```

The `delta` endpoint also automatically publishes a low-stock alert if the new
balance falls below `LOW_STOCK_THRESHOLD`.

## Requests

```http
GET   /api/requests?status=open
POST  /api/requests           { patientName, bloodGroup, unitsNeeded, urgency, hospitalId }
POST  /api/requests/:id/fulfill
```

`POST /api/requests` returns:

```json
{
  "request": { ... },
  "matchedDonors": [ { "id": 7, "name": "Asha Patel", "bloodGroup": "O+", ... } ]
}
```

Matching uses standard whole-blood compatibility (e.g. an `A+` recipient
matches `O-`, `O+`, `A-`, `A+` donors), filtered to the hospital's city when
known and ordered by least-recent prior donation.

## Donations

```http
GET   /api/donations
POST  /api/donations  { donorId, units }
```

Recording a donation increments the corresponding inventory row and stamps
`lastDonatedAt` on the donor.

## Analytics

```http
GET /api/analytics/summary
→ {
    "totalUnits": 55,
    "totalDonations": 12,
    "openRequests": 2,
    "lowStock": [{ "bloodGroup": "AB-", "units": 1 }],
    "threshold": 5
  }

GET /api/analytics/trends
→ [
    { "month": "2026-03", "bloodGroup": "O+", "donations": 2, "units": 2 },
    ...
  ]
```
