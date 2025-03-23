'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { Brain, User, CreditCard, Gift, Loader2, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: isLoading, refreshUser } = useAuthContext();
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate subscription renewal date (this would ideally come from the backend)
  const getNextRenewalDate = () => {
    // In a real app, we would get the original subscription date from the user data
    // For now, we'll assume the user subscribed on the current day of the month
    const today = new Date();
    const nextRenewal = new Date();
    
    // Set to the next month but keep the same day
    nextRenewal.setMonth(today.getMonth() + 1);
    
    // Handle edge cases like subscribing on Jan 31 (next date would be Feb 28/29)
    const currentDay = today.getDate();
    const daysInNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
    
    if (currentDay > daysInNextMonth) {
      // If the current day doesn't exist in next month, use the last day of next month
      nextRenewal.setDate(daysInNextMonth);
    }
    
    return nextRenewal;
  };

  // Refresh user data on load
  useEffect(() => {
    const refresh = async () => {
      try {
        await refreshUser();
      } catch (err: any) {
        console.error('Failed to refresh user data:', err);
      }
    };
    
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removing refreshUser from dependencies to prevent infinite loop

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Handle customer portal
  const handleManageSubscription = async () => {
    try {
      setIsManagingSubscription(true);
      setError(null);
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.origin + '/account',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }
      
      // Check if this is a mock session (used in test mode when portal isn't configured)
      if (data.url.includes('portal_session=mock_session')) {
        // Just refresh the user data instead of redirecting
        await refreshUser();
        setIsManagingSubscription(false);
        return;
      }
      
      // Redirect to Stripe customer portal
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsManagingSubscription(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Your Account</h1>
        <p className="text-base text-gray-500 text-center">
          Manage your account settings and subscription
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <div className="flex-1">{error}</div>
        </div>
      )}
      
      {user && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Account Information
          </h2>
          <div className="space-y-4 pl-7">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium w-40">Name:</span> 
              <span className="font-semibold">{user.name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium w-40">Email:</span> 
              <span className="font-semibold">{user.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium w-40">Subscription Status:</span> 
              <span className={`${
                user.subscriptionStatus === 'active' 
                  ? 'text-green-600' 
                  : user.subscriptionStatus === 'trialing' 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
              } font-medium`}>
                {user.subscriptionStatus === 'active' 
                  ? 'Active' 
                  : user.subscriptionStatus === 'trialing' 
                    ? 'Trial' 
                    : user.subscriptionStatus || 'None'}
              </span>
            </div>
            
            {user.subscriptionStatus === 'active' ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium w-40">Next Renewal:</span> 
                <span className="font-bold text-green-600">{getNextRenewalDate().toLocaleDateString()}</span>
              </div>
            ) : user.trialEndDate && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium w-40">Trial End Date:</span> 
                <span className="font-bold text-blue-600">{new Date(user.trialEndDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-primary" />
          Subscription Management
        </h2>
        
        {user?.subscriptionStatus === 'active' ? (
          <div className="pl-7">
            <p className="mb-6 text-muted-foreground">
              You have an active subscription. You can manage your subscription, update payment information, or cancel through Stripe's secure portal.
            </p>
            <Button
              onClick={handleManageSubscription}
              disabled={isManagingSubscription}
              className="bg-black text-white hover:bg-black/90 cta-button"
            >
              {isManagingSubscription ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  Manage Subscription
                  <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              )}
            </Button>
          </div>
        ) : user?.subscriptionStatus === 'trialing' ? (
          <div className="pl-7">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-blue-600 font-medium">
                Your free trial will end on {user.trialEndDate && new Date(user.trialEndDate).toLocaleDateString()}
              </p>
            </div>
            <p className="mb-6 text-muted-foreground pl-11">
              Subscribe now to maintain access to all features after your trial ends.
            </p>
            <div className="pl-11">
              <Button
                asChild
                className="bg-black text-white hover:bg-black/90 cta-button"
              >
                <Link href="/subscribe">
                  <span className="flex items-center gap-1">
                    Subscribe Now
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="pl-7">
            <p className="mb-6 text-muted-foreground">
              {user?.subscriptionStatus === 'expired' 
                ? 'Your free trial has expired. Subscribe to continue using all features.' 
                : 'You currently don\'t have an active subscription.'}
            </p>
            <Button
              asChild
              className="bg-black text-white hover:bg-black/90 cta-button"
            >
              <Link href="/subscribe">
                <span className="flex items-center gap-1">
                  Subscribe Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Gift className="mr-2 h-5 w-5 text-primary" />
          Affiliate Program
        </h2>
        <p className="mb-6 text-muted-foreground pl-7">
          Earn £5 for every friend you refer who upgrades after their trial. Start earning today!
        </p>
        <div className="pl-7">
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Link href="/account/affiliate">
              <span className="flex items-center gap-1">
                View Affiliate Dashboard
                <ArrowRight className="h-4 w-4 ml-1" />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 