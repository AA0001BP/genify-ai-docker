'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';

type PayoutRequest = {
  _id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  fullName: string;
  sortCode: string;
  accountNumber: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
};

export function PayoutHistory() {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPayoutRequests() {
      try {
        const response = await fetch('/api/affiliate/payout');
        const data = await response.json();
        
        if (response.ok) {
          setPayoutRequests(data.data.payoutRequests || []);
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to load payout history',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load payout history',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchPayoutRequests();
  }, [toast]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your previous payout requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
        <CardDescription>Your previous payout requests</CardDescription>
      </CardHeader>
      <CardContent>
        {payoutRequests.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            You haven't made any payout requests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {payoutRequests.map((request) => (
              <div key={request._id} className="border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{formatCurrency(request.amount)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Requested on {formatDate(request.createdAt)}</p>
                  {request.processedAt && (
                    <p>Processed on {formatDate(request.processedAt)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 