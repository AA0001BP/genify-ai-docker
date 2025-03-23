import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata = {
  title: 'Affiliate Admin | Text Humanizer',
  description: 'Admin dashboard for the Text Humanizer affiliate program',
};

export default function AdminAffiliatePage() {
  return (
    <ToastProvider>
      <AdminDashboard />
    </ToastProvider>
  );
} 