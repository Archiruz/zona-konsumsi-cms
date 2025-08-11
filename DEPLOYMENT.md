# 🚀 Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Create these environment variables in your Vercel project settings:

```bash
# Database (Important: Change for production!)
DATABASE_URL="your-production-database-url"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Production Settings
NODE_ENV="production"
```

### 2. Database Considerations

**⚠️ IMPORTANT**: SQLite won't work on Vercel! You need to:

- **Option A**: Use PostgreSQL with Vercel Postgres
- **Option B**: Use PlanetScale (MySQL)
- **Option C**: Use Supabase (PostgreSQL)

#### Recommended: Vercel Postgres

1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Update your `DATABASE_URL` in environment variables
4. Update Prisma schema to use PostgreSQL

### 3. Prisma Schema Updates

If switching to PostgreSQL, update your `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Build Scripts

Ensure your `package.json` has the correct build scripts:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### 5. Vercel Configuration

Create a `vercel.json` file in your project root:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 🔧 Deployment Steps

### Step 1: Prepare Database
1. Set up production database (PostgreSQL recommended)
2. Update environment variables
3. Run database migrations

### Step 2: Deploy to Vercel
1. Push your code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### Step 3: Post-Deployment
1. Run database migrations: `npx prisma migrate deploy`
2. Seed initial data if needed
3. Test all functionality

## 🚨 Common Issues & Solutions

### Issue 1: Database Connection
- **Problem**: SQLite not supported on Vercel
- **Solution**: Use PostgreSQL or MySQL

### Issue 2: Prisma Client Generation
- **Problem**: Build fails during Prisma generate
- **Solution**: Add `postinstall` script in package.json

### Issue 3: Environment Variables
- **Problem**: Missing or incorrect env vars
- **Solution**: Double-check Vercel environment variables

### Issue 4: Build Failures
- **Problem**: TypeScript or build errors
- **Solution**: Test build locally with `npm run build`

## 📱 Production Optimizations

### 1. Performance
- Enable Vercel Analytics
- Use Vercel Edge Functions if needed
- Optimize images with Next.js Image component

### 2. Security
- Use strong NEXTAUTH_SECRET
- Enable HTTPS (automatic on Vercel)
- Set proper CORS headers if needed

### 3. Monitoring
- Set up Vercel Analytics
- Monitor database performance
- Set up error tracking (Sentry, etc.)

## 🔐 Security Checklist

- [ ] Strong NEXTAUTH_SECRET
- [ ] Production database with proper access controls
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] No sensitive data in code

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connectivity
4. Check Prisma migration status

---

**Happy Deploying! 🎉**
