'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Brain, Check, Loader2, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SubscribePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refresh user data when component loads
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        await refreshUser();
        setIsRefreshing(false);
      } catch (err) {
        console.error('Error refreshing user data:', err);
        setIsRefreshing(false);
      }
    };
    
    refreshUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed refreshUser from dependencies to prevent infinite loop
  
  // Check if user is logged in and redirect if not
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // Calculate trial status
  const getTrialStatus = () => {
    if (!user || !user.trialEndDate) return { isActive: false, daysLeft: 0 };
    
    const trialEnd = new Date(user.trialEndDate);
    const now = new Date();
    
    if (trialEnd > now) {
      const diffTime = Math.abs(trialEnd.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { isActive: true, daysLeft: diffDays };
    }
    
    return { isActive: false, daysLeft: 0 };
  };
  
  const trialStatus = user ? getTrialStatus() : { isActive: false, daysLeft: 0 };
  
  // Handle subscription checkout
  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting subscription checkout process...');
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.origin,
        }),
        credentials: 'include', // Include cookies with the request
      });
      
      console.log('Received response:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };
  
  // Handle customer portal
  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.origin,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }
      
      // Redirect to Stripe customer portal
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };
  
  // Show loading state if auth is still loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Don't render the page content if not authenticated
  if (!user) {
    return null;
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Your Subscription</h1>
        <p className="text-base text-gray-500 text-center">
          {user.subscriptionStatus === 'active' 
            ? 'Manage your active subscription' 
            : 'Subscribe to continue using Genify'}
        </p>
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm mb-10">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-primary" />
          Subscription Status
        </h2>
        
        {user.subscriptionStatus === 'active' ? (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-green-600 font-semibold text-lg">
                You have an active subscription
              </p>
            </div>
            <p className="text-muted-foreground mb-6 pl-11">
              You have full access to Genify. Thank you for your support!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pl-11">
              <Button
                onClick={handleManageSubscription}
                disabled={isLoading}
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200 border-gray-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  'Manage Subscription'
                )}
              </Button>
              
              <Button
                onClick={() => router.push('/account')}
                className="bg-black text-white hover:bg-black/90 cta-button"
              >
                <span className="flex items-center gap-1">
                  Go to Account
                  <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </Button>
            </div>
          </div>
        ) : trialStatus.isActive ? (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-blue-600 font-semibold text-lg">
                Trial Active: {trialStatus.daysLeft} {trialStatus.daysLeft === 1 ? 'day' : 'days'} remaining
              </p>
            </div>
            <p className="text-muted-foreground mb-6 pl-11">
              Your free trial gives you full access to Genify. Subscribe before your trial ends to maintain access.
            </p>
            
            <div className="pl-11">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-black text-white hover:bg-black/90 px-6 py-5 h-auto cta-button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  'Subscribe Now - £19/month'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-red-600 font-semibold text-lg">
                Trial Expired
              </p>
            </div>
            <p className="text-muted-foreground mb-6 pl-11">
              Your free trial has ended. Subscribe now to continue using Genify.
            </p>
            
            <div className="pl-11">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-black text-white hover:bg-black/90 px-6 py-5 h-auto cta-button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  'Subscribe Now - £19/month'
                )}
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6 flex items-start">
            <div className="flex-1">{error}</div>
          </div>
        )}
      </div>
      
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Subscription Benefits</h2>
        
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="flex items-start">
            <div className="mr-3 p-1">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <span>Full access to Genify</span>
          </li>
          <li className="flex items-start">
            <div className="mr-3 p-1">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <span>Unlimited text humanizations</span>
          </li>
          <li className="flex items-start">
            <div className="mr-3 p-1">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <span>Fast and reliable service</span>
          </li>
          <li className="flex items-start">
            <div className="mr-3 p-1">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <span>Cancel anytime</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 