'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, formatSortCode, formatAccountNumber } from '@/lib/utils';

type PayoutRequest = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  fullName: string;
  sortCode: string;
  accountNumber: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  processedBy: string | null;
};

export function AdminPayoutRequests() {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const { toast } = useToast();

  const fetchPayoutRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payouts');
      const data = await response.json();
      
      if (response.ok) {
        setPayoutRequests(data.data || []);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load payout requests',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payout requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutRequests();
  }, []);

  const handleStatusChange = async (requestId: string, status: 'approved' | 'rejected' | 'paid') => {
    try {
      setProcessingId(requestId);
      
      const response = await fetch(`/api/admin/payouts/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes: statusNotes.trim() || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Payout request marked as ${status}`,
          variant: 'default',
        });
        
        // Refresh payout requests
        fetchPayoutRequests();
        setStatusNotes('');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update payout request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payout request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

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
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>Manage affiliate payout requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
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
        <CardTitle>Payout Requests</CardTitle>
        <CardDescription>Manage affiliate payout requests</CardDescription>
      </CardHeader>
      <CardContent>
        {payoutRequests.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            There are no pending payout requests.
          </div>
        ) : (
          <div className="space-y-6">
            {payoutRequests.map((request) => (
              <div key={request._id} className="border rounded-md p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-medium">{request.fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {request.userId.name} ({request.userId.email})
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold">{formatCurrency(request.amount)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Sort Code</p>
                    <p className="font-mono">{formatSortCode(request.sortCode)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Number</p>
                    <p className="font-mono">{formatAccountNumber(request.accountNumber)}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Requested on</p>
                  <p>{formatDate(request.createdAt)}</p>
                </div>
                
                {request.status === 'pending' && (
                  <div className="mt-4">
                    <label htmlFor={`notes-${request._id}`} className="block text-sm font-medium mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      id={`notes-${request._id}`}
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={2}
                      placeholder="Add notes about this payout (visible to admin only)"
                      disabled={!!processingId}
                    />
                    
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleStatusChange(request._id, 'approved')}
                        disabled={processingId === request._id}
                        className="px-4 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(request._id, 'paid')}
                        disabled={processingId === request._id}
                        className="px-4 py-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Mark as Paid
                      </button>
                      <button
                        onClick={() => handleStatusChange(request._id, 'rejected')}
                        disabled={processingId === request._id}
                        className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 