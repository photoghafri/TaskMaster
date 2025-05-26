'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthWrapper({ children, requireAuth = true }: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle authentication redirects
  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router, requireAuth]);

  // Show a simple loading spinner for very brief loading states
  if (requireAuth && status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For unauthenticated users, redirect immediately without showing loading screen
  if (requireAuth && status === 'unauthenticated') {
    return null; // Return null to avoid flash of content before redirect
  }

  return <>{children}</>;
}