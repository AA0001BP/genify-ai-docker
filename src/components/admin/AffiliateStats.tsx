'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';

type AffiliateUser = {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  affiliateCode: string;
  totalReferrals: number;
  totalConversions: number;
  totalEarned: number;
  pendingBalance: number;
  paidBalance: number;
};

type AdminStats = {
  totalAffiliates: number;
  totalReferrals: number;
  totalConversions: number;
  totalEarned: number;
  totalPendingBalance: number;
  totalPaidBalance: number;
  conversionRate: number;
  affiliates: AffiliateUser[];
};

export function AdminAffiliateStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/affiliate');
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

  if (loading) {
    return <AdminStatsLoading />;
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Program Stats</CardTitle>
          <CardDescription>
            No statistics available. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Affiliates" 
          value={stats.totalAffiliates.toString()}
          description="Users with referral links"
        />
        <StatsCard 
          title="Total Referrals" 
          value={stats.totalReferrals.toString()}
          description="Total users referred"
        />
        <StatsCard 
          title="Total Conversions" 
          value={stats.totalConversions.toString()}
          description="Referrals that subscribed"
        />
        <StatsCard 
          title="Conversion Rate" 
          value={`${stats.conversionRate.toFixed(1)}%`}
          description="Percentage of referrals that converted"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Earned</CardTitle>
            <CardDescription>Total commissions earned by affiliates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalEarned)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Balance</CardTitle>
            <CardDescription>Total pending payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalPendingBalance)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Paid Balance</CardTitle>
            <CardDescription>Total paid out to affiliates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalPaidBalance)}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Affiliates</CardTitle>
          <CardDescription>Ranked by total earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-center py-2 px-2">Code</th>
                  <th className="text-center py-2 px-2">Referrals</th>
                  <th className="text-center py-2 px-2">Conversions</th>
                  <th className="text-center py-2 px-2">Earned</th>
                  <th className="text-center py-2 px-2">Pending</th>
                  <th className="text-center py-2 px-2">Paid</th>
                </tr>
              </thead>
              <tbody>
                {stats.affiliates.map((affiliate) => (
                  <tr key={affiliate.userId._id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">
                      <div>
                        <p className="font-medium">{affiliate.userId.name}</p>
                        <p className="text-xs text-muted-foreground">{affiliate.userId.email}</p>
                      </div>
                    </td>
                    <td className="text-center py-2 px-2 font-mono text-sm">{affiliate.affiliateCode}</td>
                    <td className="text-center py-2 px-2">{affiliate.totalReferrals}</td>
                    <td className="text-center py-2 px-2">{affiliate.totalConversions}</td>
                    <td className="text-center py-2 px-2">{formatCurrency(affiliate.totalEarned)}</td>
                    <td className="text-center py-2 px-2">{formatCurrency(affiliate.pendingBalance)}</td>
                    <td className="text-center py-2 px-2">{formatCurrency(affiliate.paidBalance)}</td>
                  </tr>
                ))}
                
                {stats.affiliates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted-foreground">
                      No affiliates found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function AdminStatsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
} 