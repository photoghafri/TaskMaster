"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/AppLayout';
import { UserIcon, BellIcon, PaintBrushIcon, LinkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { auth } from '@/lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, AuthError } from 'firebase/auth';
import { updateUser, sendPasswordReset } from '@/lib/user-utils';
import toast from 'react-hot-toast';

// Type definitions
type ThemeType = 'light' | 'dark' | 'auto';

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  departmentId?: string;
  phone: string;
  bio: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, update } = useSession();
  const router = useRouter();

  // Theme state
  const [theme, setTheme] = useState<ThemeType>('light');
  const [compactMode, setCompactMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Departments state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    department: '',
    departmentId: '',
    phone: '',
    bio: ''
  });

  // Load user preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load theme settings
      const savedTheme = localStorage.getItem('app-theme') || 'light';
      setTheme(savedTheme as ThemeType);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');

      // Load other appearance settings
      const savedCompactMode = localStorage.getItem('compact-mode') === 'true';
      const savedHighContrast = localStorage.getItem('high-contrast') === 'true';

      setCompactMode(savedCompactMode);
      setHighContrast(savedHighContrast);

      // Apply compact mode if enabled
      document.documentElement.classList.toggle('compact', savedCompactMode);

      // Apply high contrast if enabled
      document.documentElement.classList.toggle('high-contrast', savedHighContrast);
    }
  }, []);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const response = await fetch('/api/departments');

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        toast.error('Failed to load departments. Using default values instead.');
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Load user data from API (not session)
  useEffect(() => {
    const loadUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const userData = await response.json();

            // Parse the full name into first and last name
            const fullName = userData.name || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            setProfile({
              firstName,
              lastName,
              email: userData.email || '',
              jobTitle: userData.jobTitle || '',
              department: userData.department || '',
              departmentId: userData.departmentId || '',
              phone: userData.phone || '',
              bio: userData.bio || ''
            });
          } else {
            // Fallback to session data if API fails
            const fullName = session.user.name || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            setProfile({
              firstName,
              lastName,
              email: session.user.email || '',
              jobTitle: '',
              department: '',
              departmentId: '',
              phone: '',
              bio: ''
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to session data
          const fullName = session.user.name || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          setProfile({
            firstName,
            lastName,
            email: session.user.email || '',
            jobTitle: '',
            department: '',
            departmentId: '',
            phone: '',
            bio: ''
          });
        }
      }
    };

    loadUserProfile();
  }, [session?.user?.id]); // Only depend on user ID, not the entire session

  // Handle theme change
  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);

    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (newTheme === 'auto') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  // Handle compact mode toggle
  const handleCompactModeToggle = () => {
    const newValue = !compactMode;
    setCompactMode(newValue);
    localStorage.setItem('compact-mode', String(newValue));
    document.documentElement.classList.toggle('compact', newValue);
  };

  // Handle high contrast toggle
  const handleHighContrastToggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('high-contrast', String(newValue));
    document.documentElement.classList.toggle('high-contrast', newValue);
  };

  // Handle password update
  const handlePasswordUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // Update password via API
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');

      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);

      if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!profile.firstName.trim() || !profile.lastName.trim()) {
        toast.error('First name and last name are required');
        return;
      }

      if (!profile.email.trim() || !profile.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (session?.user?.id) {
        // Update user profile via API
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${profile.firstName.trim()} ${profile.lastName.trim()}`,
            email: profile.email.trim(),
            department: profile.department,
            departmentId: profile.departmentId,
            phone: profile.phone,
            bio: profile.bio,
            jobTitle: profile.jobTitle
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update profile');
        }

        toast.success('Profile updated successfully');

        // Update the session to reflect name changes in UI
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            email: data.user.email,
          },
        });

        // Force a page reload to ensure all components update with new session data
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 500);
      } else {
        toast.error('No user session found');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset
  const handlePasswordReset = async () => {
    try {
      if (session?.user?.email) {
        await sendPasswordReset(session.user.email);
        toast.success('Password reset email sent');
      }
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <PaintBrushIcon className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <ShieldCheckIcon className="h-4 w-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <LinkIcon className="h-4 w-4" /> },
  ];

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 flex items-center space-x-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Manage your account settings and preferences</span>
            </p>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Sidebar */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 border-r border-slate-200 dark:border-slate-700">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="col-span-3 p-6">
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Profile Settings</h3>
                  <form className="space-y-6" onSubmit={handleProfileUpdate}>
                    <div className="flex items-center">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-medium mr-6">
                        {profile.firstName?.[0] || 'U'}{profile.lastName?.[0] || ''}
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-slate-900 dark:text-white mb-1">Profile Picture</h4>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={() => {
                              // TODO: Implement file upload
                              toast('Profile picture upload coming soon!', { icon: 'ℹ️' });
                            }}
                          >
                            Upload new
                          </button>
                          <button
                            type="button"
                            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            onClick={() => {
                              // TODO: Implement remove picture
                              toast('Remove picture feature coming soon!', { icon: 'ℹ️' });
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`input dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                            !profile.firstName.trim() ? 'border-red-300 focus:border-red-500' : ''
                          }`}
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                          required
                          placeholder="Enter your first name"
                        />
                        {!profile.firstName.trim() && (
                          <p className="text-red-500 text-xs mt-1">First name is required</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`input dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
                            !profile.lastName.trim() ? 'border-red-300 focus:border-red-500' : ''
                          }`}
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                          required
                          placeholder="Enter your last name"
                        />
                        {!profile.lastName.trim() && (
                          <p className="text-red-500 text-xs mt-1">Last name is required</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white bg-slate-50 dark:bg-slate-900"
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          disabled
                          title="Email cannot be changed"
                        />
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                          Email cannot be changed. Contact administrator if needed.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Job Title
                        </label>
                        <input
                          type="text"
                          className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          value={profile.jobTitle}
                          onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                          placeholder="e.g., Project Manager, Developer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Department
                        </label>
                        <select
                          className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          value={profile.departmentId || ''}
                          onChange={(e) => {
                            const deptId = e.target.value;
                            const selectedDept = departments.find(d => d.id === deptId);
                            setProfile({
                              ...profile,
                              departmentId: deptId,
                              department: selectedDept?.name || ''
                            });
                          }}
                          disabled={departmentsLoading}
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        {departmentsLoading && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                            Loading departments...
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          placeholder="+968 9123 4567"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          className="input min-h-[100px] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          rows={4}
                          value={profile.bio}
                          onChange={(e) => setProfile({...profile, bio: e.target.value})}
                          placeholder="Tell us about yourself, your experience, and expertise..."
                          maxLength={500}
                        />
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                          {profile.bio.length}/500 characters
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        <span className="text-red-500">*</span> Required fields
                      </p>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={async () => {
                            // Reset form to original values from database
                            try {
                              const response = await fetch('/api/user/profile');
                              if (response.ok) {
                                const userData = await response.json();

                                // Parse the full name into first and last name
                                const fullName = userData.name || '';
                                const nameParts = fullName.split(' ');
                                const firstName = nameParts[0] || '';
                                const lastName = nameParts.slice(1).join(' ') || '';

                                setProfile({
                                  firstName,
                                  lastName,
                                  email: userData.email || '',
                                  jobTitle: userData.jobTitle || '',
                                  department: userData.department || '',
                                  departmentId: userData.departmentId || '',
                                  phone: userData.phone || '',
                                  bio: userData.bio || ''
                                });

                                toast.success('Form reset to saved values');
                              } else {
                                toast.error('Failed to load saved data');
                              }
                            } catch (error) {
                              console.error('Error resetting form:', error);
                              toast.error('Failed to reset form');
                            }
                          }}
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isLoading || !profile.firstName.trim() || !profile.lastName.trim()}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Notification Settings</h3>
                  <div className="space-y-6">
                    {[
                      { title: 'Email Notifications', desc: 'Receive notifications via email' },
                      { title: 'Project Updates', desc: 'Get notified when projects are updated' },
                      { title: 'Task Assignments', desc: 'Notifications for new task assignments' },
                      { title: 'Deadline Reminders', desc: 'Reminders for upcoming deadlines' },
                      { title: 'Team Mentions', desc: 'When someone mentions you in comments' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Appearance Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-4">Theme</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { name: 'Light', desc: 'Clean and bright interface', value: 'light' as ThemeType },
                          { name: 'Dark', desc: 'Easy on the eyes', value: 'dark' as ThemeType },
                          { name: 'Auto', desc: 'Matches system preference', value: 'auto' as ThemeType },
                        ].map((themeOption) => (
                          <div
                            key={themeOption.value}
                            className={`card p-4 cursor-pointer border-2 ${theme === themeOption.value ? 'border-blue-500' : 'border-transparent'} dark:bg-slate-800`}
                            onClick={() => handleThemeChange(themeOption.value)}
                          >
                            <h5 className="font-medium text-slate-900 dark:text-white">{themeOption.name}</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{themeOption.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-4">Display Options</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-slate-900 dark:text-white">Compact Mode</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Reduce spacing for more content</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={compactMode}
                              onChange={handleCompactModeToggle}
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-slate-900 dark:text-white">High Contrast</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Increase contrast for better visibility</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={highContrast}
                              onChange={handleHighContrastToggle}
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="card p-4 dark:bg-slate-800 dark:border-slate-700">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-4">Change Password</h4>
                      <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                          <input
                            type="password"
                            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                          <input
                            type="password"
                            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>

                        {passwordError && (
                          <div className="text-red-500 text-sm">{passwordError}</div>
                        )}

                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Updating...' : 'Update Password'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handlePasswordReset}
                          >
                            Send Reset Email
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="card p-4 dark:bg-slate-800 dark:border-slate-700">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-4">Login Activity</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Monitor your account login activity</p>
                      <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg mb-3">
                        <p className="text-sm text-slate-900 dark:text-white font-medium">Current Session</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Active now - {new Date().toLocaleString()}</p>
                      </div>
                      <button className="btn btn-secondary text-sm">View All Activity</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Integrations</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Slack', desc: 'Connect with your Slack workspace', connected: true },
                      { name: 'Microsoft Teams', desc: 'Integrate with Teams for notifications', connected: false },
                      { name: 'Google Calendar', desc: 'Sync project deadlines with calendar', connected: true },
                      { name: 'Jira', desc: 'Import and sync Jira issues', connected: false },
                    ].map((integration, index) => (
                      <div key={index} className="card p-4 dark:bg-slate-800 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">{integration.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{integration.desc}</p>
                          </div>
                          <button className={`btn ${integration.connected ? 'btn-secondary' : 'btn-primary'}`}>
                            {integration.connected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}