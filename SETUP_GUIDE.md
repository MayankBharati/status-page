# StatusPage Setup Guide

## 🚀 Quick Setup Instructions

### 1. Clone and Install
```bash
cd status-page
npm install
```

### 2. Set up Clerk Authentication

1. **Create a Clerk account**:
   - Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
   - Sign up for a free account

2. **Create a new application**:
   - Click "Create application"
   - Give it a name (e.g., "StatusPage")
   - Select authentication methods (Email, Google, etc.)
   - Click "Create application"

3. **Get your API keys**:
   - In your Clerk dashboard, go to "API Keys"
   - Copy the **Publishable key** and **Secret key**

4. **Update `.env.local`**:
   ```env
   # Replace these with your actual Clerk keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
   CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
   ```

### 3. Set up Database (Option A: Local PostgreSQL)

1. **Install PostgreSQL** if not already installed
2. **Create a database**:
   ```sql
   CREATE DATABASE statuspage;
   ```
3. **Update `.env.local`** with your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/statuspage?schema=public"
   ```

### 3. Set up Database (Option B: Use Supabase - Free)

1. **Create a Supabase account**:
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   
2. **Get your database URL**:
   - Go to Settings → Database
   - Copy the "Connection string" (URI)
   
3. **Update `.env.local`**:
   ```env
   DATABASE_URL="your-supabase-connection-string"
   ```

### 4. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Troubleshooting

### "Invalid publishableKey" Error
- Make sure you've replaced the placeholder keys in `.env.local` with your actual Clerk keys
- Restart the development server after updating `.env.local`

### Database Connection Error
- Ensure PostgreSQL is running
- Verify your database credentials in the `DATABASE_URL`
- Try connecting with `psql` to verify credentials

### Prisma Errors
- Run `npx prisma generate` after any schema changes
- Delete `node_modules` and reinstall if needed

## 🎯 Next Steps

1. **Test the application**:
   - Sign up for an account
   - Create an organization
   - Add some services
   - Create test incidents
   - View the public status page at `/status/demo`

2. **Customize**:
   - Update the organization name and branding
   - Modify the color scheme in `tailwind.config.js`
   - Add your logo

3. **Deploy** (see deployment section in README.md)

## 📝 Default Routes

- `/` - Landing page
- `/sign-up` - Create account
- `/sign-in` - Login
- `/dashboard` - Admin dashboard (requires auth)
- `/status/[organization-slug]` - Public status page

## 🛠️ Development Tips

- Use `npm run dev` for development with hot reload
- Use `npm run build` to test production build locally
- Check `npm run lint` for code quality
- Use Prisma Studio (`npx prisma studio`) to manage data

## 📧 Support

If you encounter any issues:
1. Check the console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed (`npm install`)
4. Try clearing `.next` folder and rebuilding 
 
 