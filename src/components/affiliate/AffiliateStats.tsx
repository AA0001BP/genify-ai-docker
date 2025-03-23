'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';

type AffiliateStats = {
  affiliateCode: string;
  totalReferrals: number;
  totalConversions: number;
  totalClicks: number;
  clickToSignupRate: string;
  totalEarned: number;
  pendingBalance: number;
  paidBalance: number;
  isEligibleForPayout: boolean;
  minimumPayout: number;
};

export function AffiliateStats() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/affiliate');
        const data = await response.json();
        
        if (response.ok) {
          setStats(data.data);
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to load affiliate stats',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load affiliate stats',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [toast]);

  const copyToClipboard = async () => {
    if (!stats) return;
    
    try {
      const baseUrl = window.location.origin;
      const referralLink = `${baseUrl}/ref/${stats.affiliateCode}`;
      await navigator.clipboard.writeText(referralLink);
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
      toast({
        title: 'Success',
        description: 'Referral link copied to clipboard!',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy referral link',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <AffiliateStatsLoading />;
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Program</CardTitle>
          <CardDescription>
            No affiliate stats available. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${baseUrl}/ref/${stats.affiliateCode}`;
  const conversionRate = stats.totalReferrals > 0 
    ? ((stats.totalConversions / stats.totalReferrals) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Link</CardTitle>
          <CardDescription>
            Share this link with friends to earn £5 for each user who subscribes after their free trial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="bg-muted p-2 rounded-md text-sm flex-1 w-full overflow-x-auto">
              <code className="text-xs sm:text-sm">{referralLink}</code>
            </div>
            <button
              onClick={copyToClipboard}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Referral Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Link Clicks</span>
                <span className="font-medium">{stats.totalClicks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Signups</span>
                <span className="font-medium">{stats.totalReferrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Click-to-Signup Rate</span>
                <span className="font-medium">{stats.clickToSignupRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Successful Conversions</span>
                <span className="font-medium">{stats.totalConversions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Signup-to-Conversion Rate</span>
                <span className="font-medium">{conversionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Earned</span>
                <span className="font-medium">{formatCurrency(stats.totalEarned)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Balance</span>
                <span className="font-medium">{formatCurrency(stats.pendingBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Paid Balance</span>
                <span className="font-medium">{formatCurrency(stats.paidBalance)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Status</CardTitle>
          <CardDescription>
            {stats.isEligibleForPayout 
              ? `You have reached the minimum payout amount of ${formatCurrency(stats.minimumPayout)}!` 
              : `You need a minimum of ${formatCurrency(stats.minimumPayout)} to request a payout.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Current Balance</p>
                <p className="text-lg font-bold">{formatCurrency(stats.pendingBalance)}</p>
              </div>
              <div>
                <p className="text-right font-medium">Minimum Payout</p>
                <p className="text-right text-lg font-bold">{formatCurrency(stats.minimumPayout)}</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-background rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (stats.pendingBalance / stats.minimumPayout) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AffiliateStatsLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Link</CardTitle>
          <CardDescription>
            Share this link with friends to earn £5 for each user who subscribes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Referral Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Link Clicks</span>
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Signups</span>
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Click-to-Signup Rate</span>
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Successful Conversions</span>
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Signup-to-Conversion Rate</span>
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Earned</span>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Balance</span>
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Paid Balance</span>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 