"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import AuthWrapper from '@/components/AuthWrapper';
import {
  HeartIcon,
  CodeBracketIcon,
  InformationCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  CloudIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const currentYear = new Date().getFullYear();
  const appVersion = "1.0.0";
  const buildDate = "May 2025";

  return (
    <AuthWrapper>
      <AppLayout title="About TaskMaster">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-8 text-white">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4">
                <img
                  src="https://res.cloudinary.com/daiil8ury/image/upload/v1747259495/x5sdqf4sw2bfl78atskh.png"
                  alt="Oman Airports Logo"
                  className="w-32 h-32 object-contain mx-auto"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 text-white">TaskMaster</h1>
                <p className="text-blue-100 text-lg">Project Management System for Oman Airports OPD</p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 mb-4">
                <InformationCircleIcon className="h-5 w-5" />
                <span>Version {appVersion} • Built {buildDate}</span>
              </div>
              <p className="text-blue-100 max-w-2xl mx-auto">
                A comprehensive project tracking and management solution designed specifically
                for Oman Airports OPD operations, enabling efficient project oversight,
                team collaboration, and progress monitoring.
              </p>
            </div>
          </div>

          {/* Developer Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Developed with <HeartIcon className="inline h-6 w-6 text-red-500 animate-pulse" /> by
              </h2>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Mohammed Al Ghafri
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                Senior Airfield Duty Officer
              </p>
              <p className="text-slate-500 dark:text-slate-500 mt-2">
                Oman Airports Management Company
              </p>
            </div>


          </div>

          {/* Platform Features */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <SparklesIcon className="h-6 w-6 mr-2 text-blue-600" />
              Platform Features
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Real-time Analytics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Comprehensive project analytics and progress tracking
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Team Collaboration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Seamless team coordination and communication tools
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Project Scheduling</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Advanced scheduling and deadline management
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Secure Access</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Role-based access control and data security
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <CpuChipIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Modern Technology</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Built with cutting-edge web technologies
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <CloudIcon className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Cloud Integration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Firebase-powered backend with real-time sync
                </p>
              </div>
            </div>
          </div>



          {/* Contact & Support */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Support & Contact
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                For technical support, feature requests, or any inquiries about TaskMaster,
                please contact Mohammed Al Ghafri.
              </p>

              <div className="inline-flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-lg px-6 py-3 shadow-sm border border-slate-200 dark:border-slate-600">
                <UserIcon className="h-5 w-5 text-blue-600" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Mohammed Al Ghafri - Senior Airfield Duty Officer
                </span>
              </div>

              <div className="mt-6 text-sm text-slate-500 dark:text-slate-500">
                <p>&copy; {currentYear} TaskMaster v{appVersion} • Designed for Oman Airports OPD Operations</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthWrapper>
  );
}
