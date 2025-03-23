'use client';

import { useState } from 'react';
import { AdminAffiliateStats } from './AffiliateStats';
import { AdminPayoutRequests } from './PayoutRequests';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'payouts'>('stats');

  const tabClass = (tab: 'stats' | 'payouts') => {
    return activeTab === tab
      ? 'border-b-2 border-primary text-primary font-medium'
      : 'text-muted-foreground hover:text-foreground';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Affiliate Admin Dashboard</h1>
      
      <div className="mb-6 border-b">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-1 ${tabClass('stats')}`}
          >
            Affiliate Statistics
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-2 px-1 ${tabClass('payouts')}`}
          >
            Payout Requests
          </button>
        </div>
      </div>
      
      {activeTab === 'stats' && <AdminAffiliateStats />}
      {activeTab === 'payouts' && <AdminPayoutRequests />}
    </div>
  );
} 