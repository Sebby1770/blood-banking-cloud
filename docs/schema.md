# Data Schema

Models live in `backend/src/models/`. Sequelize creates the underlying tables
automatically — this doc describes the logical schema.

## Donors

| Column          | Type        | Notes                          |
| --------------- | ----------- | ------------------------------ |
| id              | INTEGER PK  | auto-increment                 |
| name            | STRING      | required                       |
| email           | STRING      | unique, required, validated    |
| phone           | STRING      | required                       |
| bloodGroup      | ENUM(8)     | A+/A-/B+/B-/AB+/AB-/O+/O-      |
| city            | STRING      | required                       |
| lastDonatedAt   | DATETIME    | nullable                       |
| available       | BOOLEAN     | default true                   |
| createdAt       | DATETIME    | auto                           |
| updatedAt       | DATETIME    | auto                           |

## Hospitals

| Column        | Type       | Notes                  |
| ------------- | ---------- | ---------------------- |
| id            | INTEGER PK |                        |
| name          | STRING     | required               |
| city          | STRING     | required               |
| contactEmail  | STRING     | required, validated    |
| contactPhone  | STRING     | required               |

## BloodInventories

One row per blood group.

| Column      | Type       | Notes                |
| ----------- | ---------- | -------------------- |
| id          | INTEGER PK |                      |
| bloodGroup  | ENUM(8)    | unique               |
| units       | INTEGER    | default 0, ≥ 0       |

## BloodRequests

| Column        | Type        | Notes                                     |
| ------------- | ----------- | ----------------------------------------- |
| id            | INTEGER PK  |                                           |
| patientName   | STRING      | required                                  |
| bloodGroup    | ENUM(8)     |                                           |
| unitsNeeded   | INTEGER     | default 1                                 |
| urgency       | ENUM        | low / medium / high / critical            |
| status        | ENUM        | open / matched / fulfilled / cancelled    |
| hospitalId    | INTEGER FK  | → Hospitals.id                            |

## Donations

| Column       | Type        | Notes                       |
| ------------ | ----------- | --------------------------- |
| id           | INTEGER PK  |                             |
| donorId      | INTEGER FK  | → Donors.id                 |
| bloodGroup   | ENUM(8)     | denormalised from donor     |
| units        | INTEGER     | default 1                   |
| donatedAt    | DATETIME    | default NOW                 |

## Relationships

- `Hospital` 1—N `BloodRequest` (`hospital`/`requests` aliases)
- `Donor` 1—N `Donation` (`donor`/`donations` aliases)
