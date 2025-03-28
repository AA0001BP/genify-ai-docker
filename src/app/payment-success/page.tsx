'use client';

import { Suspense } from 'react'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/lib/contexts/AuthContext';

export function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuthContext();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [status, setStatus] = useState('Updating subscription status...');
  
  useEffect(() => {
    // Update subscription status manually since webhooks may not work in local development
    const updateSubscriptionStatus = async () => {
      try {
        setStatus('Checking subscription status...');
        
        // Call our update subscription endpoint
        const response = await fetch('/api/debug/update-subscription');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStatus('Subscription status updated successfully!');
          } else if (data.message) {
            setStatus(data.message);
          }
        } else {
          // If debug endpoint fails, still try to refresh user data
          setStatus('Could not update subscription status directly. Refreshing user data...');
        }
        
        // Refresh user data from session endpoint
        await refreshUser();
        setIsRefreshing(false);
      } catch (error) {
        console.error('Failed to update subscription status:', error);
        setStatus('Error updating subscription status. Refreshing user data...');
        
        // Still try to refresh user data
        await refreshUser();
        setIsRefreshing(false);
      }
    };
    
    updateSubscriptionStatus();
    
    // Redirect to humanize page after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/humanize');
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [refreshUser, router]);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-lg shadow-md p-10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        
        <p className="text-lg text-gray-600 mb-4">
          Thank you for your subscription. Your payment has been processed successfully.
          You now have full access to Text Humanizer!
        </p>
        
        {isRefreshing && (
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm text-gray-500">{status}</p>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <Link 
            href="/humanize" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition"
          >
            Go to Text Humanizer
          </Link>
          
          <p className="text-sm text-gray-500">
            You will be redirected automatically in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
} 

export default function PaymentSuccessPageContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessPage />
    </Suspense>
  );
}