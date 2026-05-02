# AWS Architecture

This document describes the recommended production deployment on AWS.

## Components

| AWS Service        | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| **EC2** (t3.small) | Hosts the Node.js Express API behind a load balancer.        |
| **RDS** (PostgreSQL or MySQL) | Persistent database for donors, hospitals, inventory, requests, donations. |
| **S3**             | Hosts the built React frontend (`dist/`); also stores periodic CSV/JSON reports for analytics. |
| **CloudFront**     | CDN in front of the S3-hosted frontend.                      |
| **SNS**            | Publishes low-stock and high-urgency request alerts to subscribed phones/emails. |
| **Lambda**         | Cron job (CloudWatch Events) hitting `/api/inventory/check-thresholds` to publish proactive alerts. |
| **QuickSight**     | Reads RDS directly for analyst-friendly trend dashboards.    |
| **IAM**            | EC2 instance role with `sns:Publish` on the topic and `s3:PutObject` on the report bucket. |

## Data flow

```
[Browser]
   |
   v
[CloudFront] --> [S3 (React build)]
   |
   v
[ALB] --> [EC2 (Node API)] --> [RDS]
                       \
                        --> [SNS] --> SMS/email subscribers
                        --> [S3]  --> nightly report exports
[CloudWatch Events]
   |
   v
[Lambda (cron)] --> calls /api/inventory/check-thresholds on the API
```

## Why this layout

- **EC2 over Lambda for the API**: Express + Sequelize is a long-lived process and benefits from connection pooling to RDS — Lambda would need RDS Proxy and would cold-start on low-traffic endpoints.
- **RDS over DynamoDB**: relational schema (donors, donations, inventory, requests, hospitals) is naturally normalized; QuickSight has first-class RDS connectors.
- **SNS over SES**: SNS fans out to SMS, email, and HTTP webhooks with one publish — useful for getting nurses on call.
- **S3 + CloudFront for frontend**: cheaper and faster than serving the SPA from EC2.
