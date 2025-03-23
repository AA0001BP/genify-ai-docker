'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-lg shadow-md p-10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Cancelled</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Your subscription payment was cancelled. If you have any questions or need help, please contact our support team.
        </p>
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <Link 
            href="/subscribe" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition"
          >
            Try Again
          </Link>
          
          <Link 
            href="/humanize" 
            className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-md text-gray-700 font-medium transition"
          >
            Back to Text Humanizer
          </Link>
        </div>
      </div>
    </div>
  );
} 