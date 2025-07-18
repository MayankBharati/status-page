# Optional Stretch Goals Implementation

This document describes the implementation of the optional stretch goals for the status page application.

## 1. Email Notifications for Status Changes

### Features Implemented:
- **Email Service**: Integrated with Nodemailer for sending email notifications
- **Status Change Notifications**: Automatic emails when service status changes
- **Incident Notifications**: Email alerts for new incidents
- **Maintenance Notifications**: Email updates for scheduled maintenance
- **HTML Email Templates**: Beautiful, responsive email templates with color-coded status indicators

### Configuration:
Add the following environment variables to `.env.local`:
```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourcompany.com
```

### Usage:
- Email notifications are automatically sent when:
  - Service status changes (services API)
  - New incidents are created (incidents API)
  - New maintenance is scheduled (maintenance API)

### Email Templates:
- **Service Status**: Shows old vs new status with color coding
- **Incident Alerts**: Includes severity, status, and description
- **Maintenance Updates**: Shows scheduled times and current status

## 2. Metric Graphs for Service Uptime Percentage

### Features Implemented:
- **Uptime Calculation**: Calculates uptime percentages based on incidents and maintenance
- **Interactive Charts**: Multiple chart types using Recharts library
- **Time Range Selection**: 7, 30, or 90-day uptime analysis
- **Service Comparison**: Compare uptime across all services
- **Individual Service Trends**: Detailed uptime trends for specific services

### Chart Types:
- **Pie Chart**: Overall uptime overview
- **Area Chart**: Uptime trends over time
- **Bar Chart**: Service comparison
- **Progress Bars**: Visual uptime indicators

### API Endpoint:
```
GET /api/uptime?days=30
GET /api/uptime?serviceId=SERVICE_ID&days=30
```

### Metrics Dashboard:
- Access via `/dashboard/metrics`
- Real-time uptime statistics
- Service performance details
- Historical trend analysis

## 3. External API for Status Checks

### Features Implemented:
- **RESTful API**: Simple HTTP endpoints for external monitoring
- **Multiple Formats**: JSON, XML, and Text response formats
- **Organization Scoped**: Filter by organization slug
- **Service Filtering**: Optional service-specific queries
- **No Authentication**: Public API for monitoring tools

### API Endpoint:
```
GET /api/external/status?org=ORGANIZATION_SLUG&format=json
```

### Query Parameters:
- `org` (required): Organization slug
- `service` (optional): Specific service ID
- `format` (optional): json, xml, or txt (default: json)

### Response Formats:

#### JSON Format:
```json
{
  "organization": {
    "name": "Demo Organization",
    "slug": "demo"
  },
  "status": {
    "overall": "operational",
    "uptime": 99.5,
    "services": {
      "total": 5,
      "operational": 4,
      "degraded": 1
    }
  },
  "services": [...],
  "incidents": [...],
  "maintenance": [...],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### XML Format:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<status>
  <organization>
    <name>Demo Organization</name>
    <slug>demo</slug>
  </organization>
  <status>
    <overall>operational</overall>
    <uptime>99.5</uptime>
  </status>
  <!-- ... -->
</status>
```

#### Text Format:
```
Demo Organization Status Page
==============================

Overall Status: OPERATIONAL
Uptime: 99.5%

Services (5 total):
- Operational: 4
- Degraded: 1
- Partial Outage: 0
- Major Outage: 0
- Under Maintenance: 0

Service Status:
- API Gateway: operational
- Web Application: operational
- Database: operational
- Email Service: degraded performance

Last updated: 1/1/2024, 12:00:00 PM
```

### API Documentation:
- Access via `/api/docs`
- Interactive documentation with examples
- Test endpoints directly from the browser
- Copy-paste ready code snippets

## Usage Examples

### Email Notifications:
1. Configure email settings in `.env.local`
2. Create/update services, incidents, or maintenance
3. Check email for automatic notifications

### Metrics Dashboard:
1. Navigate to `/dashboard/metrics`
2. Select time range (7, 30, or 90 days)
3. View charts and statistics
4. Select individual services for detailed trends

### External API:
1. Use the API endpoint: `GET /api/external/status?org=demo`
2. Choose format: `?format=json`, `?format=xml`, or `?format=txt`
3. Filter by service: `&service=SERVICE_ID`
4. Integrate with monitoring tools like Nagios, Zabbix, or custom scripts

## Integration Examples

### Monitoring Script (Bash):
```bash
#!/bin/bash
STATUS=$(curl -s "http://localhost:3000/api/external/status?org=demo&format=json")
OVERALL=$(echo $STATUS | jq -r '.status.overall')

if [ "$OVERALL" != "operational" ]; then
    echo "ALERT: Service status is $OVERALL"
    exit 1
fi
```

### Python Monitoring:
```python
import requests
import json

response = requests.get('http://localhost:3000/api/external/status?org=demo')
data = response.json()

if data['status']['overall'] != 'operational':
    print(f"ALERT: Status is {data['status']['overall']}")
```

### Health Check Endpoint:
```bash
curl "http://localhost:3000/api/external/status?org=demo&format=txt"
```

## Benefits

1. **Email Notifications**: Immediate awareness of status changes
2. **Uptime Metrics**: Data-driven insights into service reliability
3. **External API**: Easy integration with existing monitoring infrastructure
4. **Multiple Formats**: Flexibility for different use cases
5. **Real-time Data**: Live status information for external systems

These stretch goals enhance the status page application with professional-grade monitoring capabilities, making it suitable for production use in enterprise environments. 
 
 