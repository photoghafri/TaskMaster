'use client';

import AppLayout from '../../components/AppLayout';
import AuthWrapper from '../../components/AuthWrapper';
import EnhancedActivityLogs from '../../components/EnhancedActivityLogs';



export default function ActivityLogsPage() {
  return (
    <AuthWrapper>
      <AppLayout title="">
        <EnhancedActivityLogs />
      </AppLayout>
    </AuthWrapper>
  );
}