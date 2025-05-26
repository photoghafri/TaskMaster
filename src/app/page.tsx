import AppLayout from '../components/AppLayout';
import Dashboard from '../components/Dashboard';
import AuthWrapper from '../components/AuthWrapper';

export default function Home() {
  return (
    <AuthWrapper>
      <AppLayout title="">
        <Dashboard />
      </AppLayout>
    </AuthWrapper>
  );
}
