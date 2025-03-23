'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { formatSortCode, formatAccountNumber } from '@/lib/utils';

interface PayoutRequestFormProps {
  isEligible: boolean;
  minimumPayout: number;
  pendingBalance: number;
  onSubmitSuccess: () => void;
}

export function PayoutRequestForm({ 
  isEligible,
  minimumPayout,
  pendingBalance,
  onSubmitSuccess
}: PayoutRequestFormProps) {
  const [fullName, setFullName] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSortCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and hyphens
    const value = e.target.value.replace(/[^0-9-]/g, '');
    setSortCode(value);
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAccountNumber(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEligible) {
      toast({
        title: 'Not Eligible',
        description: `You need a minimum of £${minimumPayout} to request a payout.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Basic validation
    if (!fullName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }
    
    const cleanedSortCode = sortCode.replace(/[^0-9]/g, '');
    if (cleanedSortCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit sort code.',
        variant: 'destructive',
      });
      return;
    }
    
    const cleanedAccountNumber = accountNumber.replace(/[^0-9]/g, '');
    if (cleanedAccountNumber.length !== 8) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 8-digit account number.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/affiliate/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          sortCode: cleanedSortCode,
          accountNumber: cleanedAccountNumber,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your payout request has been submitted.',
          variant: 'default',
        });
        
        // Reset form
        setFullName('');
        setSortCode('');
        setAccountNumber('');
        
        // Notify parent component of success
        onSubmitSuccess();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit payout request.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit payout request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Payout</CardTitle>
        <CardDescription>
          {isEligible 
            ? `You can request a payout of £${pendingBalance.toFixed(2)}`
            : `You need a minimum of £${minimumPayout} to request a payout (current balance: £${pendingBalance.toFixed(2)})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEligible || isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              placeholder="John Smith"
            />
          </div>
          
          <div>
            <label htmlFor="sortCode" className="block text-sm font-medium mb-1">
              Sort Code
            </label>
            <input
              id="sortCode"
              type="text"
              value={sortCode}
              onChange={handleSortCodeChange}
              disabled={!isEligible || isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              placeholder="00-00-00"
              maxLength={8} // Allow for formatting (xx-xx-xx)
            />
            <p className="text-xs text-muted-foreground mt-1">Format: XX-XX-XX</p>
          </div>
          
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium mb-1">
              Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={handleAccountNumberChange}
              disabled={!isEligible || isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              placeholder="12345678"
              maxLength={8}
            />
            <p className="text-xs text-muted-foreground mt-1">8 digits</p>
          </div>
          
          <button
            type="submit"
            disabled={!isEligible || isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Submit Payout Request'}
          </button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start">
        <div className="text-xs text-muted-foreground">
          <p>Note: Payouts will be processed manually by our team.</p>
          <p>You will receive your payment within 2-3 working days.</p>
        </div>
      </CardFooter>
    </Card>
  );
} 