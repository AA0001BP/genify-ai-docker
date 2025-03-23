import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata = {
  title: 'Affiliate Dashboard',
  description: 'Manage your Text Humanizer affiliate account and earnings',
};

export default function AffiliatePage() {
  return (
    <ToastProvider>
      <AffiliateDashboard />
    </ToastProvider>
  );
} 