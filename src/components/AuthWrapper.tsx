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
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [cacheClearAttempted, setCacheClearAttempted] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let counter: NodeJS.Timeout;

    if (status === 'loading') {
      // Increment loading time counter
      counter = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);

      // Set a timeout for when authentication is taking too long
      timer = setTimeout(() => {
        setTimeoutOccurred(true);
        console.error('Authentication loading timeout occurred');
      }, 5000); // Reduced timeout to 5 seconds
    }

    return () => {
      clearTimeout(timer);
      clearInterval(counter);
    };
  }, [status]);

  // Handle authentication redirects
  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router, requireAuth]);

  // Handle clearing cache
  const handleClearCacheAndRefresh = () => {
    setCacheClearAttempted(true);
    
    // Attempt to clear browser cache for this site
    if ('caches' in window) {
      try {
        caches.keys().then((keyList) => {
          return Promise.all(
            keyList.map((key) => {
              return caches.delete(key);
            })
          );
        });
      } catch (e) {
        console.error('Failed to clear cache:', e);
      }
    }
    
    // Hard reload the page
    window.location.href = window.location.pathname + '?nocache=' + Date.now();
  };

  // Skip auth in development with manual bypass
  const handleBypassAuth = () => {
    // This is only for development purposes
    if (process.env.NODE_ENV !== 'production') {
      localStorage.setItem('bypassAuth', 'true');
      window.location.reload();
    }
  };

  // If the auth is taking too long, provide a manual option
  if (requireAuth && (status === 'loading' || timeoutOccurred)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md w-full p-6 bg-white dark:bg-slate-800 shadow-lg rounded-xl">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 animate-pulse">TM</div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading... ({loadingTime}s)</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Checking authentication status</p>
          
          {timeoutOccurred && (
            <div className="mt-6">
              <p className="text-amber-600 dark:text-amber-400 mb-3">
                Authentication is taking longer than expected.
              </p>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => router.push('/auth/signin')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Login
                </button>
                <button 
                  onClick={handleClearCacheAndRefresh}
                  className={`px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors ${cacheClearAttempted ? 'opacity-50' : ''}`}
                  disabled={cacheClearAttempted}
                >
                  {cacheClearAttempted ? 'Cache Clear Attempted' : 'Clear Cache & Refresh'}
                </button>
                {process.env.NODE_ENV !== 'production' && (
                  <button 
                    onClick={handleBypassAuth}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors mt-2"
                  >
                    Development: Bypass Auth Check
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (requireAuth && status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">TM</div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Redirecting to login...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Please wait while we redirect you</p>
        </div>
      </div>
    );
  }

  // Check for development bypass
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    const bypassAuth = localStorage.getItem('bypassAuth') === 'true';
    if (bypassAuth) {
      return <>{children}</>;
    }
  }

  return <>{children}</>;
} 