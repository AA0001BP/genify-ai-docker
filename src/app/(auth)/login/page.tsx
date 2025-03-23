'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Brain, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { login, error: authError } = useAuthContext();
  
  // Check for success or error messages in URL
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'email-verified') {
      setSuccessMessage('Email verified successfully! You can now log in.');
    }
    
    if (error) {
      switch (error) {
        case 'invalid-token':
          setVerificationError('Invalid verification token. Please try again.');
          break;
        case 'invalid-or-expired-token':
          setVerificationError('Verification token is invalid or has expired. Please request a new one.');
          break;
        case 'verification-failed':
          setVerificationError('Email verification failed. Please try again or contact support.');
          break;
        default:
          break;
      }
    }
  }, [searchParams]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setSuccessMessage(null);
    setVerificationError(null);
    
    try {
      const success = await login(data);
      
      if (success) {
        // Redirect to humanize page after successful login
        router.push('/humanize');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center space-x-2 mb-6">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Genify</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-2">Log in to your account to continue</p>
      </div>
      
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <div className="flex-1">{successMessage}</div>
          </div>
        )}
        
        {verificationError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <div className="flex-1">{verificationError}</div>
          </div>
        )}
        
        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <div className="flex-1">{authError}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-black text-white hover:bg-black/90 font-medium h-11 cta-button"
          >
            {isLoading ? 'Logging in...' : 'Log in to your account'}
          </Button>
        </form>
      </div>
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
} 