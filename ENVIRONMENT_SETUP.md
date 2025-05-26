# Environment Variables Setup

This document explains how to set up environment variables for the TaskMaster project.

## Required Environment Variables

### NextAuth Configuration
- `NEXTAUTH_SECRET`: A secret key for NextAuth.js (generate a random string)
- `NEXTAUTH_URL`: The base URL of your application

### Firebase Configuration
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID (optional)

### Next.js Configuration
- `NEXT_TELEMETRY_DISABLED`: Set to 1 to disable Next.js telemetry
- `NODE_ENV`: Environment mode (development/production)

## Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` with your actual configuration.

## Vercel Deployment Setup

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each environment variable with the appropriate values for production

### Production Values

For production deployment, use these values:

```
NEXTAUTH_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAkGE-lbEzcRVJZbKjE_SHJd38jENqut8k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-management-f45cc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-management-f45cc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-management-f45cc.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1002222709659
NEXT_PUBLIC_FIREBASE_APP_ID=1:1002222709659:web:6b1ab479efcc4102824f3e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-JYYNYZV8LP
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

## Security Notes

- Never commit `.env.local` or any file containing actual secrets to version control
- Use strong, unique values for `NEXTAUTH_SECRET` in production
- The Firebase configuration values are already public-safe as they're client-side
- Always use HTTPS URLs for `NEXTAUTH_URL` in production
