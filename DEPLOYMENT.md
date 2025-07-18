# Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code is committed to GitHub
- [ ] No sensitive data in code (API keys, passwords)
- [ ] Environment variables are properly configured
- [ ] Database schema is ready
- [ ] All dependencies are in package.json

### ✅ Database Setup (Supabase)
- [ ] Create Supabase project
- [ ] Get database connection string
- [ ] Run `npx prisma db push` locally to test
- [ ] Verify database is accessible

### ✅ Clerk Setup
- [ ] Create Clerk application
- [ ] Get Publishable Key and Secret Key
- [ ] Configure authentication methods
- [ ] Test authentication locally

## Deployment Steps

### Step 1: GitHub Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Vercel Setup
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

### Step 3: Environment Variables
Add these in Vercel dashboard:

#### Required Variables
```env
DATABASE_URL=postgresql://your-supabase-connection-string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_WS_URL=https://your-app.vercel.app
```

#### Optional Variables
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@example.com
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL

### Step 5: Post-Deployment Configuration

#### Update Clerk URLs
1. Go to Clerk Dashboard
2. Add these redirect URLs:
   - `https://your-app.vercel.app/sign-in`
   - `https://your-app.vercel.app/sign-up`
   - `https://your-app.vercel.app/dashboard`

#### Test the Application
1. Visit your deployed URL
2. Test sign-up/sign-in
3. Create an organization
4. Add services
5. Test email notifications

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Verify all dependencies are installed
- Ensure TypeScript compilation passes

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase connection settings
- Ensure database is accessible from Vercel

### Authentication Issues
- Verify Clerk keys are correct
- Check Clerk redirect URLs
- Ensure Clerk application is properly configured

### Email Issues
- Verify Gmail credentials
- Check App Password is used (not regular password)
- Test email configuration in settings

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `https://app.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | Your app URL | `https://app.vercel.app` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `https://app.vercel.app` |

## Security Checklist

- [ ] No sensitive data in code
- [ ] Environment variables are set in Vercel
- [ ] Database connection is secure
- [ ] Clerk keys are properly configured
- [ ] Email credentials are secure

## Performance Optimization

- [ ] Database indexes are created
- [ ] Images are optimized
- [ ] Code splitting is implemented
- [ ] Caching is configured

## Monitoring

- [ ] Set up Vercel analytics
- [ ] Monitor database performance
- [ ] Check error logs
- [ ] Monitor email delivery

## Backup Strategy

- [ ] Database backups are configured
- [ ] Environment variables are documented
- [ ] Code is version controlled
- [ ] Deployment process is documented 