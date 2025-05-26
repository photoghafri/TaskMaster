# TaskMaster - Troubleshooting Guide

This document provides solutions for common issues you might encounter with the TaskMaster project management application.

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Rendering Issues](#rendering-issues)
3. [API Issues](#api-issues)
4. [Firebase Connection Problems](#firebase-connection-problems)
5. [Development Environment Problems](#development-environment-problems)

## Authentication Issues

### Stuck on Authentication Loading Screen

**Symptoms:**
- Application gets stuck on "Loading..." screen.
- Authentication status never resolves.

**Solutions:**
- Use the "Clear Cache & Refresh" button when it appears.
- In development mode, use the "Bypass Auth Check" button.
- Try going directly to `/auth/signin` and use the "Quick Development Login" button.
- Restart the application with `npm run dev:clean`.

### Cannot Sign In

**Symptoms:**
- Credentials are rejected even when correct.
- Application shows "Error signing in" message.

**Solutions:**
- For development, use `admin@example.com` / `password`.
- Check that Firebase is properly configured.
- Verify that NextAuth.js providers are correctly set up in `src/lib/auth.ts`.
- Run `npm run seed:firebase` to set up sample users.

## Rendering Issues

### "throwOnInvalidObjectType" Error

**Symptoms:**
- Error in console related to `throwOnInvalidObjectType`.
- React component fails to render.
- White screen with stack trace.

**Solutions:**
- Add proper error boundaries to components.
- Make sure collections are handled safely with optional chaining (`?.`).
- Check for JSX elements that might be undefined or null.
- Restart with `npm run clean && npm run dev:fix`.

### Missing UI Elements

**Symptoms:**
- Parts of the UI are missing.
- Components don't display as expected.

**Solutions:**
- Check browser console for errors.
- Verify that Tailwind CSS is correctly set up.
- Inspect the DOM to see if elements are present but not visible.
- Try adding `key` props to items in lists.

## API Issues

### API Routes Not Working

**Symptoms:**
- API calls return 404 or 500 errors.
- Data isn't saved or retrieved.

**Solutions:**
- Check that route files follow Next.js App Router conventions.
- Verify that API handlers are implemented correctly.
- Check for issues with dynamic route parameters using `params`.
- Look for missing imports or undefined variables.

### Warning about "params.id" Not Being Awaited

**Symptoms:**
- Warning in console: `Warning: x is expected to be awaited, but it has no '.then' member.`
- API may still work but with warnings.

**Solutions:**
- Use direct property access instead of destructuring:
  ```typescript
  // Instead of:
  const { id } = params;
  
  // Use:
  const id = params.id;
  ```
- Place `await` operations before accessing params.

## Firebase Connection Problems

**Symptoms:**
- "Failed to fetch" errors for API routes.
- Authentication doesn't work.
- Data can't be saved or retrieved.

**Solutions:**
- Check Firebase configuration in `src/lib/firebase.ts`.
- Verify that Firebase service account credentials are correct.
- Check Firebase security rules if you get permission errors.
- Run `npm run seed:firebase` to initialize Firebase with sample data.

## Development Environment Problems

### Development Server Won't Start

**Symptoms:**
- `npm run dev` fails to start.
- Terminal shows errors about missing modules.

**Solutions:**
- Run `npm install` to ensure all dependencies are installed.
- Try clearing Next.js cache with `npm run clean`.
- Use `npm run dev:fix` to run with optimized settings.
- Check for typos or errors in configuration files.

### Hot Reload Not Working

**Symptoms:**
- Changes to code aren't reflected in the browser.
- Need to manually restart server to see changes.

**Solutions:**
- Make sure you're not using production build (`npm run build && npm start`).
- Check if file watchers are working on your system.
- Use `npm run dev:clean` to restart with a fresh cache.
- Temporarily disable any antivirus or monitoring software.

## Running the Health Check

We've included a health check script to diagnose common issues:

```bash
node scripts/health-check.js
```

This script will check for:
- Critical files
- Authentication setup
- React component issues
- Firebase configuration
- Required dependencies
- Script commands

Follow any recommendations provided by the health check to resolve issues.

## Need More Help?

If you're still experiencing issues, please:

1. Check the GitHub repository issues section for similar problems.
2. Run the health check script and include its output in any support requests.
3. Provide clear steps to reproduce the issue.
4. Include your environment details (OS, Node.js version, browser). 