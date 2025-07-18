# Status Page App

A comprehensive status page application built with Next.js 14, TypeScript, Clerk authentication, Prisma with PostgreSQL, and real-time updates via WebSocket.

## Features

- 🔐 **Multi-tenant Organizations** with Clerk authentication
- 👥 **Team Management** with role-based access control
- 📊 **Service Status Tracking** with real-time updates
- 🚨 **Incident Management** with severity levels
- 🔧 **Maintenance Scheduling** with notifications
- 📈 **Uptime Metrics** with charts and analytics
- 📧 **Email Notifications** for status changes
- 🌐 **Public Status Page** for end users
- 🔌 **External API** for integrations
- ⚡ **Real-time Updates** via WebSocket

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, ShadcnUI, Radix UI
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **Charts**: Recharts
- **Email**: Nodemailer
- **Deployment**: Vercel

## Prerequisites

Before deploying, you'll need:

1. **Vercel Account** - [Sign up here](https://vercel.com)
2. **Clerk Account** - [Sign up here](https://clerk.com)
3. **Supabase Account** (for PostgreSQL) - [Sign up here](https://supabase.com)
4. **GitHub Account** - [Sign up here](https://github.com)

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Step 2: Set Up Database (Supabase)

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your database URL

2. **Run database migrations**:
   ```bash
   npx prisma db push
   ```

### Step 3: Configure Clerk

1. **Create a new Clerk application**:
   - Go to [clerk.com](https://clerk.com)
   - Create a new application
   - Configure authentication methods (Email, Google, etc.)

2. **Get your Clerk keys**:
   - Copy your Publishable Key and Secret Key
   - You'll need these for environment variables

### Step 4: Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   Add these environment variables in Vercel:

   ```env
   # Database
   DATABASE_URL="postgresql://your-supabase-connection-string"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # App URLs (update with your Vercel domain)
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

   # WebSocket (for real-time updates)
   NEXT_PUBLIC_WS_URL=https://your-app.vercel.app
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Step 5: Post-Deployment Setup

1. **Update Clerk URLs**:
   - Go to your Clerk dashboard
   - Update the redirect URLs to include your Vercel domain:
     - `https://your-app.vercel.app/sign-in`
     - `https://your-app.vercel.app/sign-up`
     - `https://your-app.vercel.app/dashboard`

2. **Configure Email Settings**:
   - Visit your deployed app
   - Go to `/dashboard/settings`
   - Configure your Gmail credentials for email notifications

3. **Create Your First Organization**:
   - Sign up with your email
   - Create your first organization
   - Add services and team members

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your app's URL | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | Yes |
| `EMAIL_USER` | Gmail address (optional) | No |
| `EMAIL_PASS` | Gmail app password (optional) | No |
| `EMAIL_FROM` | From email address (optional) | No |
| `ADMIN_EMAIL` | Admin email (optional) | No |

## Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd status-page
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Run database migrations**:
   ```bash
   npx prisma db push
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
status-page/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── status/           # Public status pages
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   └── types/               # TypeScript types
├── prisma/                  # Database schema
├── public/                  # Static assets
└── package.json            # Dependencies
```

## API Endpoints

### Public API
- `GET /api/public/status?org={slug}` - Get public status
- `GET /api/public/status/{slug}` - Public status page

### Dashboard API
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `PUT /api/services/{id}` - Update service
- `DELETE /api/services/{id}` - Delete service

- `GET /api/incidents` - List incidents
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/{id}` - Update incident

- `GET /api/maintenance` - List maintenance
- `POST /api/maintenance` - Create maintenance
- `PUT /api/maintenance/{id}` - Update maintenance

- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `PUT /api/teams/{id}` - Update team

- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/test-email` - Test email

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues during deployment, please:

1. Check the Vercel build logs
2. Verify all environment variables are set correctly
3. Ensure your database is accessible
4. Check that Clerk is properly configured

For additional help, please open an issue on GitHub.
