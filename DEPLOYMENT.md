# TaskMaster - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

### 3. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

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

### 4. Generate NEXTAUTH_SECRET

Generate a secure secret for production:
```bash
openssl rand -base64 32
```

### 5. Update NEXTAUTH_URL

Replace `your-vercel-app-url` with your actual Vercel app URL.

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `.env.production` - Production environment variables template
- `next.config.js` - Next.js configuration optimized for Vercel

## 🧪 Test Login Credentials

After deployment, use these credentials to test:

**AOPS Admin:**
- Email: AOPS@omanairports.com
- Password: password

**Mohammed Al Ghafri:**
- Email: mohammed.alghafri@omanairports.com
- Password: password123

**Other Staff:**
- Email: [firstname.lastname]@omanairports.com
- Password: password123

## 🔍 Troubleshooting

### Common Issues:

1. **NextAuth Error**: Ensure NEXTAUTH_SECRET and NEXTAUTH_URL are set correctly
2. **Firebase Connection**: Verify all Firebase environment variables
3. **Build Errors**: Check the Vercel build logs for specific errors

### Build Optimization:

The project is configured with:
- TypeScript error ignoring during build
- ESLint error ignoring during build
- Webpack optimizations for client-side bundles
- Reduced bundle size configurations

## 📱 Features Available After Deployment

- ✅ User authentication with NextAuth
- ✅ Firebase Firestore database
- ✅ Project management system
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Dark/light theme toggle
- ✅ Advanced analytics
- ✅ Team management
- ✅ Department organization

## 🎯 Post-Deployment Steps

1. Test all login credentials
2. Verify project creation and management
3. Check analytics and reporting features
4. Test team and department management
5. Ensure all API endpoints are working

Your TaskMaster application is now ready for production use! 🎉
