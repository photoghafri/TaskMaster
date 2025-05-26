'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import bcrypt from 'bcryptjs';

interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  departmentId?: string;
}

interface ResetResult {
  email: string;
  name: string;
  status: 'success' | 'error';
  message: string;
}

export default function ResetPasswordsPage() {
  const [status, setStatus] = useState<'loading' | 'resetting' | 'completed' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [firestoreUsers, setFirestoreUsers] = useState<FirestoreUser[]>([]);
  const [resetResults, setResetResults] = useState<ResetResult[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [defaultPassword, setDefaultPassword] = useState('password123');

  // Load users from Firestore
  const loadFirestoreUsers = async () => {
    try {
      setMessage('Loading users from Firestore...');
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const users: FirestoreUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'USER',
          department: data.department,
          departmentId: data.departmentId
        });
      });

      setFirestoreUsers(users);
      setMessage(`Found ${users.length} users in Firestore. Ready to reset passwords.`);
      setStatus('resetting');
    } catch (error) {
      console.error('Error loading Firestore users:', error);
      setMessage('Failed to load users from Firestore');
      setStatus('error');
    }
  };

  // Reset passwords for all users
  const resetAllPasswords = async () => {
    if (!defaultPassword.trim()) {
      alert('Please enter a default password');
      return;
    }

    setStatus('resetting');
    setMessage('Resetting passwords...');

    const results: ResetResult[] = [];

    for (const user of firestoreUsers) {
      setCurrentUser(`Resetting password for ${user.name} (${user.email})`);

      try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Update password in Firestore
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        });

        results.push({
          email: user.email,
          name: user.name,
          status: 'success',
          message: `Password reset to: ${defaultPassword}`
        });

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error: any) {
        results.push({
          email: user.email,
          name: user.name,
          status: 'error',
          message: error.message || 'Unknown error'
        });
      }
    }

    setResetResults(results);
    setCurrentUser('');
    setStatus('completed');

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    setMessage(`Password reset completed: ${successCount} successful, ${errorCount} errors`);
  };

  useEffect(() => {
    loadFirestoreUsers();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
              🔑
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset All User Passwords
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This will reset passwords for all users in your Firestore database
          </p>
        </div>

        {status === 'loading' && (
          <div className="text-center">
            <div className="flex justify-center">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-3 text-base text-gray-600">{message}</p>
          </div>
        )}

        {status === 'resetting' && !currentUser && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <p className="text-blue-800 text-sm font-medium mb-3">Found {firestoreUsers.length} users</p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="defaultPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Default Password for All Users
                  </label>
                  <input
                    type="text"
                    id="defaultPassword"
                    value={defaultPassword}
                    onChange={(e) => setDefaultPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter default password"
                  />
                  <p className="text-xs text-gray-500 mt-1">This password will be set for all users</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                  <p className="text-amber-800 text-xs font-medium mb-1">⚠️ Warning</p>
                  <p className="text-amber-700 text-xs">This will overwrite existing passwords for all users. Make sure to inform users of the new password.</p>
                </div>

                <button
                  onClick={resetAllPasswords}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  Reset All Passwords
                </button>
              </div>
            </div>

            {/* User List Preview */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
              <p className="text-gray-800 text-sm font-medium mb-3">Users to be updated:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {firestoreUsers.map((user, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-900">{user.name}</span>
                    <span className="text-gray-500">{user.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {status === 'resetting' && currentUser && (
          <div className="text-center">
            <div className="flex justify-center">
              <svg className="animate-spin h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-3 text-base text-gray-600">Resetting passwords...</p>
            <p className="mt-2 text-sm text-gray-500">{currentUser}</p>
          </div>
        )}

        {status === 'completed' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{message}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <p className="text-blue-800 text-sm font-medium mb-2">New Login Information</p>
              <p className="text-blue-700 text-xs">All users can now login with:</p>
              <p className="text-blue-700 text-xs mt-1"><strong>Email:</strong> Their existing email address</p>
              <p className="text-blue-700 text-xs"><strong>Password:</strong> {defaultPassword}</p>
            </div>

            {/* Results Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Reset Results</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {resetResults.map((result, index) => (
                  <li key={index} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-3 w-3 rounded-full ${
                          result.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{result.name}</p>
                          <p className="text-sm text-gray-500">{result.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          result.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.status === 'success' ? 'Reset' : 'Error'}
                        </p>
                        <p className="text-xs text-gray-500">{result.message}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/auth/signin"
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Go to Login
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Reset Again
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{message}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setStatus('loading');
                  setMessage('');
                  setResetResults([]);
                  loadFirestoreUsers();
                }}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Try Again
              </button>
              <Link
                href="/auth/signin"
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
