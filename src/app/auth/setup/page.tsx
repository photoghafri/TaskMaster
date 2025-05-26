'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
  name: 'Admin User',
  role: 'ADMIN',
  department: 'Admin'
};

export default function SetupPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState('');

  const setupAdmin = async () => {
    try {
      // First try the API endpoint
      const response = await fetch('/api/seed');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up admin account');
      }

      setMessage(data.message || 'Admin account created successfully');
      setStatus('success');
    } catch (apiError) {
      console.error('API error:', apiError);
      setDetails('API endpoint failed. Trying direct Firebase setup...');

      // If the API fails, try direct Firebase setup
      try {
        // Try to create admin user in Firebase Auth
        await createUserWithEmailAndPassword(
          auth,
          DEFAULT_ADMIN.email,
          DEFAULT_ADMIN.password
        )
        .then(async (userCredential) => {
          const uid = userCredential.user.uid;

          // Create admin user in Firestore
          const adminUser = {
            name: DEFAULT_ADMIN.name,
            email: DEFAULT_ADMIN.email,
            role: DEFAULT_ADMIN.role,
            department: DEFAULT_ADMIN.department,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await setDoc(doc(db, 'users', uid), adminUser);

          setMessage('Admin user created successfully via direct Firebase setup');
          setStatus('success');
        })
        .catch(err => {
          if (err.code === 'auth/email-already-in-use') {
            setMessage('Admin user already exists');
            setStatus('success');
          } else {
            throw err;
          }
        });
      } catch (firebaseError) {
        console.error('Firebase setup error:', firebaseError);
        setMessage('Failed to set up admin account');
        setDetails(firebaseError instanceof Error ? firebaseError.message : 'Unknown error');
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    setupAdmin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">TM</div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            App Setup
          </h2>

          {status === 'loading' && (
            <div className="mt-4">
              <div className="flex justify-center">
                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-3 text-center text-base text-gray-600">
                Setting up admin account...
              </p>
              {details && (
                <p className="mt-2 text-center text-sm text-gray-500">{details}</p>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                  <p className="text-amber-800 text-sm font-medium">Login Credentials</p>
                  <p className="text-amber-700 text-xs mt-1">Email: admin@example.com</p>
                  <p className="text-amber-700 text-xs">Password: password</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                  <p className="text-blue-800 text-sm font-medium mb-2">Additional Setup Options</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-blue-700 text-xs mb-2">If you have users in Firestore but no authentication records:</p>
                      <Link
                        href="/auth/sync-users"
                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        Sync Firestore Users
                      </Link>
                    </div>
                    <div>
                      <p className="text-blue-700 text-xs mb-2">If you forgot user passwords and need to reset them:</p>
                      <Link
                        href="/auth/reset-passwords"
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-800 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                      >
                        Reset All Passwords
                      </Link>
                    </div>
                  </div>
                </div>

                <Link
                  href="/auth/signin"
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {message}
                    </p>
                    {details && (
                      <p className="text-sm text-red-700 mt-1">{details}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    setStatus('loading');
                    setDetails('');
                    setupAdmin();
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}