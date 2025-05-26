'use client';

import AppLayout from '../../components/AppLayout';
import AuthWrapper from '../../components/AuthWrapper';
import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the EnhancedActivityLogs component with error boundary
const EnhancedActivityLogs = dynamic(
  () => import('../../components/EnhancedActivityLogs'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading activity logs...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

export default function ActivityLogsPage() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('✅ Logs page mounted successfully!');
    console.log('Current URL:', window.location.href);
    console.log('Timestamp:', new Date().toISOString());
  }, []);

  if (hasError) {
    return (
      <AuthWrapper>
        <AppLayout title="Activity Logs">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Activity Logs
              </h1>
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-700 dark:text-red-300">
                  ❌ Error loading activity logs component
                </p>
                <button
                  onClick={() => setHasError(false)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </AppLayout>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <AppLayout title="Activity Logs">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Loading activity logs...</p>
            </div>
          </div>
        }>
          <EnhancedActivityLogs />
        </Suspense>
      </AppLayout>
    </AuthWrapper>
  );
}