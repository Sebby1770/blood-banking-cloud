# Deployment Guide (AWS)

End-to-end recipe for deploying the Blood Banking platform on AWS.

## 1. Provision base infrastructure

```bash
aws cloudformation deploy \
  --stack-name blood-bank-base \
  --template-file infra/cloudformation.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    DBPassword=ChangeMeStrong! \
    ReportsBucketName=your-org-blood-bank-reports
```

Note the outputs:

- `RDSEndpoint` → use as `DATABASE_URL` host
- `AlertsTopicArn` → set as `SNS_TOPIC_ARN`
- `ReportsBucket` → set as `S3_BUCKET`

## 2. Launch an EC2 instance for the API

```bash
# Amazon Linux 2023, t3.small, in the same VPC as RDS
sudo dnf install -y nodejs git
git clone https://github.com/<you>/blood-banking-cloud.git
cd blood-banking-cloud/backend
npm ci --omit=dev
npm install -g pm2

cat > .env <<EOF
NODE_ENV=production
PORT=4000
DATABASE_URL=postgres://bloodbank:ChangeMeStrong!@<RDSEndpoint>:5432/bloodbank
AWS_REGION=us-east-1
SNS_TOPIC_ARN=<AlertsTopicArn>
S3_BUCKET=<ReportsBucket>
LOW_STOCK_THRESHOLD=5
EOF

# One-time install of the AWS SDK that notificationService.js loads in prod:
npm install @aws-sdk/client-sns

pm2 start server.js --name blood-bank-api
pm2 startup
pm2 save
```

Attach an instance role with this minimum policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "sns:Publish", "Resource": "<AlertsTopicArn>" },
    { "Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject"], "Resource": "arn:aws:s3:::<ReportsBucket>/*" }
  ]
}
```

## 3. Build & deploy the frontend

```bash
cd frontend
npm ci
npm run build

aws s3 sync dist/ s3://your-org-blood-bank-reports/web/ --delete
```

Front it with CloudFront and point `/api/*` requests at your EC2/ALB origin (or set `VITE_API_BASE` and use a separate origin).

## 4. Schedule the low-stock cron

Create a Lambda that hits the API and a CloudWatch Events rule (e.g. every 15 min):

```python
# lambda_function.py
import os, urllib.request

def lambda_handler(event, context):
    url = os.environ['API_URL'] + '/api/inventory/check-thresholds'
    with urllib.request.urlopen(url, timeout=10) as resp:
        return {'status': resp.status, 'body': resp.read().decode()}
```

Set `API_URL` to your ALB DNS. Subscribe phone/email endpoints to the SNS topic from step 1 and they'll receive alerts.

## 5. Connect QuickSight

1. In QuickSight, create a new RDS data source pointing at the same VPC as the database.
2. Import the `Donations` and `BloodInventories` tables.
3. Build dashboards over donation trends and inventory snapshots.

Tableau works the same way using the standard PostgreSQL connector.
