'use client';

import { Suspense } from 'react'
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Brain, Mail, Lock, User, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
};

export function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [hasReferralParam, setHasReferralParam] = useState(false);
  const { register: registerUser, error: authError } = useAuthContext();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();
  const password = watch('password');
  
  // Check for referral code in URL params or localStorage
  useEffect(() => {
    // First check URL parameters for referral code
    const refCode = searchParams.get('ref');
    if (refCode) {
      // If referral code is in URL, save it to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('referralCode', refCode);
      }
      setValue('referralCode', refCode);
      setHasReferralParam(true);
    } 
    // If no referral code in URL, check cookies
    else if (typeof window !== 'undefined') {
      // First check cookies
      const getCookie = (name: string) => {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
          }
        }
        return null;
      };
      
      const cookieRefCode = getCookie('affiliate_ref');
      if (cookieRefCode) {
        setValue('referralCode', cookieRefCode);
        setHasReferralParam(true);
      } 
      // If no cookie, check localStorage as fallback
      else {
        const storedRefCode = localStorage.getItem('referralCode');
        if (storedRefCode) {
          setValue('referralCode', storedRefCode);
          setHasReferralParam(true);
        }
      }
    }
  }, [searchParams, setValue]);
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Register the user with the API using our auth context
      const success = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode
      });
      
      if (success) {
        // Clear the stored referral code after successful registration
        if (typeof window !== 'undefined') {
          localStorage.removeItem('referralCode');
          
          // Also clear the affiliate_ref cookie
          document.cookie = 'affiliate_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        
        // Store the user's email and show verification message
        setUserEmail(data.email);
        setRegistrationSuccess(true);
      }
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show verification instructions after successful registration
  if (registrationSuccess) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center mb-8">
        </div>
        
        <div className="rounded-xl border bg-blue-50 border-blue-200 p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold mb-3 text-center">Check Your Email</h2>
          <p className="mb-2 text-center">
            We've sent a verification link to <span className="font-semibold">{userEmail}</span>
          </p>
          <p className="text-center">Please check your inbox and click the link to verify your email address.</p>
        </div>
        
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Open the email from Genify</li>
            <li>Click the verification link in the email</li>
            <li>After verification, you can log in to your account</li>
          </ol>
          
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setRegistrationSuccess(false)}
                className="text-primary font-medium hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto px-4 py-6 md:py-10">
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Sign up to your free account</h1>
      </div>
      
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <div className="flex-1">{authError}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-black text-white hover:bg-black/90 font-medium h-11 cta-button"
          >
            {isLoading ? 'Creating account...' : 'Create your account'}
          </Button>
        </form>
      </div>
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
} 

export default function SignupContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signup />
    </Suspense>
  );
}