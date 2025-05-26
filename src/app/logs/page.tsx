'use client';

import AppLayout from '../../components/AppLayout';
import AuthWrapper from '../../components/AuthWrapper';
import { useState, useEffect, Suspense } from 'react';
import EnhancedActivityLogs from '../../components/EnhancedActivityLogs';

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
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Activity Logs
            </h1>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-700 dark:text-blue-300">
                ✅ Logs page is working on Vercel!
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
                Enhanced activity logs component will be loaded below.
              </p>
            </div>
          </div>
          <EnhancedActivityLogs />
        </div>
      </AppLayout>
    </AuthWrapper>
  );
}