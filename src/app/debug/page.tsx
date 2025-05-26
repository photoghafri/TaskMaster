'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [envVars, setEnvVars] = useState<any>({});
  const [authTest, setAuthTest] = useState<any>(null);

  useEffect(() => {
    // Check environment variables (client-side only)
    setEnvVars({
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      // Firebase vars
      FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set',
      FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set',
    });

    // Test auth endpoint
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setAuthTest(data))
      .catch(err => setAuthTest({ error: err.message }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Information</h1>
        
        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session:</strong> {session ? 'Authenticated' : 'Not authenticated'}</p>
            {session && (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <p><strong>User:</strong> {session.user?.email}</p>
                <p><strong>Name:</strong> {session.user?.name}</p>
                <p><strong>Role:</strong> {session.user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> 
                <span className={value === 'Not set' ? 'text-red-600' : 'text-green-600'}>
                  {' '}{String(value)}
                </span>
              </p>
            ))}
          </div>
        </div>

        {/* Auth Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Auth Endpoint Test</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authTest, null, 2)}
          </pre>
        </div>

        {/* Current URL */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current URL Info</h2>
          <div className="space-y-2">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
            <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/api/auth/signin'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Direct Auth Signin
            </button>
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
            >
              Go to Custom Signin
            </button>
            <button
              onClick={() => {
                fetch('/api/auth/csrf')
                  .then(res => res.json())
                  .then(data => alert(JSON.stringify(data, null, 2)))
                  .catch(err => alert('Error: ' + err.message));
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ml-4"
            >
              Test CSRF Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
