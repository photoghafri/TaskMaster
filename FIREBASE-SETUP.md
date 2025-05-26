# Firebase Setup Guide for Project Management App

This guide will help you set up Firebase for your project management application.

## 1. Create Firestore Database

First, you need to create a Firestore database in your Firebase project:

1. Go to the Firebase console: https://console.firebase.google.com/
2. Select your project: "project-management-f45cc"
3. In the left sidebar, click on "Firestore Database"
4. Click "Create database"
5. Choose "Start in test mode" for development (you can change this later)
6. Select a location closest to your users (e.g., "us-central")
7. Click "Enable"

## 2. Configure Security Rules

For development, you can use permissive rules:

1. In the Firebase console, go to Firestore Database
2. Click on the "Rules" tab
3. Copy and paste the contents of `scripts/firebase-dev-rules.txt` into the editor
4. Click "Publish"

For production, use the more restrictive rules in `scripts/firebase-rules.txt`.

## 3. Seed the Database

After creating the database, you need to populate it with initial data:

```bash
# Seed departments
node scripts/seed-firebase.js

# Seed users
node scripts/seed-users-firebase.js
```

## 4. Start the Application

Now you can start your application:

```bash
npm run dev
```

## 5. Troubleshooting

If you encounter connection issues:

1. Check your internet connection
2. Verify your Firebase configuration in `src/lib/firebase-simple.ts`
3. Make sure your Firebase project is properly set up
4. Check if your Firebase security rules are too restrictive
5. Run the connection test script:

```bash
node scripts/check-firebase-connection.js
```

## 6. Firebase Authentication (Optional)

If you want to enable authentication:

1. In the Firebase console, go to "Authentication"
2. Click "Get started"
3. Enable the sign-in methods you want (Email/Password, Google, etc.)
4. Update your application code to use Firebase Authentication

## 7. Firebase Storage (Optional)

For file uploads:

1. In the Firebase console, go to "Storage"
2. Click "Get started"
3. Follow the setup wizard
4. Update your application code to use Firebase Storage

## 8. Firebase Hosting (Optional)

To deploy your application:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize hosting: `firebase init hosting`
4. Build your application: `npm run build`
5. Deploy: `firebase deploy` 