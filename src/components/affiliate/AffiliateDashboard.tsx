'use client';

import { useState, useEffect } from 'react';
import { AffiliateStats } from './AffiliateStats';
import { PayoutRequestForm } from './PayoutRequestForm';
import { PayoutHistory } from './PayoutHistory';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

type AffiliateData = {
  affiliateCode: string;
  totalReferrals: number;
  totalConversions: number;
  totalEarned: number;
  pendingBalance: number;
  paidBalance: number;
  isEligibleForPayout: boolean;
  minimumPayout: number;
};

type PayoutRequestsData = {
  payoutRequests: any[];
  isEligible: boolean;
};

export function AffiliateDashboard() {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [payoutData, setPayoutData] = useState<PayoutRequestsData | null>(null);
  const [loadingAffiliate, setLoadingAffiliate] = useState(true);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'payout' | 'history'>('stats');
  const { toast } = useToast();

  const fetchAffiliateData = async () => {
    try {
      setLoadingAffiliate(true);
      const response = await fetch('/api/affiliate');
      const data = await response.json();
      
      if (response.ok) {
        setAffiliateData(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load affiliate data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load affiliate data',
        variant: 'destructive',
      });
    } finally {
      setLoadingAffiliate(false);
    }
  };

  const fetchPayoutData = async () => {
    try {
      setLoadingPayouts(true);
      const response = await fetch('/api/affiliate/payout');
      const data = await response.json();
      
      if (response.ok) {
        setPayoutData(data.data);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load payout data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payout data',
        variant: 'destructive',
      });
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
    fetchPayoutData();
  }, []);

  const handlePayoutSuccess = () => {
    // Refresh data after a successful payout request
    fetchAffiliateData();
    fetchPayoutData();
    // Switch to history tab
    setActiveTab('history');
  };

  const tabClass = (tab: 'stats' | 'payout' | 'history') => {
    return activeTab === tab
      ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium'
      : 'text-gray-500 hover:text-gray-700';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Affiliate Dashboard</h1>
        <p className="text-base text-gray-500 text-center">
          Earn rewards by referring your friends to Genify
        </p>
      </div>
      
      <div className="mb-8 border-b">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-1 ${tabClass('stats')}`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('payout')}
            className={`pb-2 px-1 ${tabClass('payout')}`}
          >
            Request Payout
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-1 ${tabClass('history')}`}
          >
            Payout History
          </button>
        </div>
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm">
        {activeTab === 'stats' && (
          <div>
            {loadingAffiliate ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              </div>
            ) : (
              <AffiliateStats />
            )}
          </div>
        )}
        
        {activeTab === 'payout' && (
          <div>
            {loadingAffiliate || loadingPayouts ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <PayoutRequestForm 
                isEligible={payoutData?.isEligible || false}
                minimumPayout={affiliateData?.minimumPayout || 25}
                pendingBalance={affiliateData?.pendingBalance || 0}
                onSubmitSuccess={handlePayoutSuccess}
              />
            )}
          </div>
        )}
        
        {activeTab === 'history' && (
          <div>
            {loadingPayouts ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <PayoutHistory />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 