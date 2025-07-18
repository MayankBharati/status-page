# Testing Guide for Optional Stretch Goals

This guide shows you how to test each stretch goal manually without enabling 2FA.

## 🚀 **Prerequisites**

1. **Server Running**: Make sure your development server is running
   ```bash
   npm run dev
   ```

2. **Database Access**: Ensure you can access Prisma Studio
   ```bash
   npx prisma studio
   ```

## 📧 **1. Email Notifications Testing**

### **Setup Email Configuration**

1. **Update `.env.local`** with your real email:
   ```env
   EMAIL_USER=your-real-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_EMAIL=your-test-email@gmail.com
   ```

2. **Get Gmail App Password**:
   - Go to Google Account Settings
   - Enable 2FA (temporarily)
   - Generate App Password
   - Use this password in `EMAIL_PASS`

### **Test Email Notifications**

#### **A. Service Status Change Emails**
1. Go to `http://localhost:3000/dashboard/services`
2. Click on an existing service
3. Change the status (e.g., from "Operational" to "Degraded Performance")
4. Save the changes
5. **Check your email** for a status change notification

#### **B. Incident Creation Emails**
1. Go to `http://localhost:3000/dashboard/incidents/new`
2. Fill in the incident details:
   - Title: "Test Incident"
   - Description: "Testing email notifications"
   - Severity: "Major"
   - Status: "Investigating"
   - Select affected services
3. Click "Create Incident"
4. **Check your email** for an incident alert

#### **C. Maintenance Scheduling Emails**
1. Go to `http://localhost:3000/dashboard/maintenance/new`
2. Fill in maintenance details:
   - Title: "Test Maintenance"
   - Description: "Testing email notifications"
   - Scheduled Start: Tomorrow
   - Scheduled End: Tomorrow + 2 hours
3. Click "Schedule Maintenance"
4. **Check your email** for a maintenance notification

## 📊 **2. Metrics Dashboard Testing**

### **Generate Test Data**

#### **A. Create Multiple Services**
1. Go to `http://localhost:3000/dashboard/services/new`
2. Create these services:
   - **API Gateway** (Operational)
   - **Web Application** (Operational)
   - **Database** (Degraded Performance)
   - **Email Service** (Partial Outage)

#### **B. Create Incidents**
1. Go to `http://localhost:3000/dashboard/incidents/new`
2. Create incidents:
   - **Database Issue** (affecting Database service)
   - **Email Outage** (affecting Email Service)
3. Resolve some incidents after a few minutes

#### **C. Schedule Maintenance**
1. Go to `http://localhost:3000/dashboard/maintenance/new`
2. Create maintenance windows for different services

### **Test Metrics Dashboard**

1. **Access Dashboard**: Go to `http://localhost:3000/dashboard/metrics`

2. **Test Time Ranges**:
   - Switch between 7, 30, and 90 days
   - Observe how charts change

3. **Test Service Selection**:
   - Select different services from the dropdown
   - View individual service uptime trends

4. **Verify Charts**:
   - **Pie Chart**: Shows overall uptime distribution
   - **Bar Chart**: Compares services
   - **Area Chart**: Shows uptime trends over time
   - **Statistics Cards**: Show average, best, and worst performing services

## 🌐 **3. External API Testing**

### **Method 1: Using the Test Script**

1. **Run the test script**:
   ```bash
   node test-api.js
   ```

2. **Review the output** for all three formats (JSON, XML, Text)

### **Method 2: Manual Testing**

#### **A. JSON Format**
```bash
curl "http://localhost:3000/api/external/status?org=demo&format=json"
```

#### **B. XML Format**
```bash
curl "http://localhost:3000/api/external/status?org=demo&format=xml"
```

#### **C. Text Format**
```bash
curl "http://localhost:3000/api/external/status?org=demo&format=txt"
```

#### **D. Service-Specific Query**
```bash
# First, get a service ID from the database or dashboard
curl "http://localhost:3000/api/external/status?org=demo&service=SERVICE_ID"
```

### **Method 3: Using the API Documentation**

1. Go to `http://localhost:3000/api/docs`
2. Click on different tabs:
   - **Overview**: Read about the API
   - **Endpoints**: See parameter details
   - **Examples**: Test different formats
   - **Response Formats**: See example responses

3. **Test API buttons**:
   - Click "Test API" buttons for each format
   - Copy endpoints and test manually

### **Method 4: Browser Testing**

1. **JSON**: `http://localhost:3000/api/external/status?org=demo&format=json`
2. **XML**: `http://localhost:3000/api/external/status?org=demo&format=xml`
3. **Text**: `http://localhost:3000/api/external/status?org=demo&format=txt`

## 🔍 **Expected Results**

### **Email Notifications**
- ✅ Professional HTML emails with color-coded status
- ✅ Service status change notifications
- ✅ Incident alert emails
- ✅ Maintenance scheduling emails

### **Metrics Dashboard**
- ✅ Interactive charts and graphs
- ✅ Real-time uptime calculations
- ✅ Service comparison views
- ✅ Historical trend analysis
- ✅ Individual service tracking

### **External API**
- ✅ JSON responses with structured data
- ✅ XML responses for enterprise systems
- ✅ Text responses for monitoring tools
- ✅ Organization-scoped data
- ✅ Service filtering capabilities

## 🐛 **Troubleshooting**

### **Email Issues**
- Check Gmail app password is correct
- Verify email addresses in `.env.local`
- Check server logs for email errors

### **Metrics Issues**
- Ensure you have services and incidents in the database
- Check browser console for chart errors
- Verify API endpoints are accessible

### **API Issues**
- Confirm server is running on port 3000
- Check organization slug exists in database
- Verify API routes are properly configured

## 📝 **Test Checklist**

- [ ] Email notifications working
- [ ] Metrics dashboard accessible
- [ ] Charts displaying correctly
- [ ] External API responding
- [ ] All three API formats working
- [ ] API documentation accessible
- [ ] Real-time updates working
- [ ] Data persistence verified

## 🎯 **Success Criteria**

✅ **Email Notifications**: Receive emails for all status changes  
✅ **Metrics Dashboard**: View uptime charts and statistics  
✅ **External API**: Get status data in JSON, XML, and Text formats  
✅ **Real-time Updates**: See live updates via WebSocket  
✅ **Documentation**: Access comprehensive API documentation  

All features should work without requiring 2FA setup! 
 
 