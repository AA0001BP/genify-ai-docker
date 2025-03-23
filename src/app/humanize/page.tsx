'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { humanizeText } from '@/lib/api';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Brain, FileText, FileCheck, Info, Loader2, CheckCircle, Copy, Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper function to count words
const countWords = (text: string): number => {
  const trimmedText = text.trim();
  return trimmedText === '' ? 0 : trimmedText.split(/\s+/).length;
};

// Define an extended user type that includes subscription fields
type User = {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  trialEndDate?: string | Date | null;
  subscriptionStatus?: 'trialing' | 'active' | 'canceled' | 'expired' | null;
};

export default function Humanize() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Get authentication state from context
  const { user, loading: authLoading } = useAuthContext();
  
  // Check if user is logged in and redirect if not
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        // Check if user's trial is valid or subscription is active
        const trialEndDate = user.trialEndDate ? new Date(user.trialEndDate) : null;
        const now = new Date();
        
        const isTrialValid = trialEndDate && trialEndDate > now;
        const isSubscriptionActive = user.subscriptionStatus === 'active';
        
        if (!isTrialValid && !isSubscriptionActive) {
          // Redirect to subscription page if trial expired and no active subscription
          router.push('/subscribe');
        }
      }
    }
  }, [user, authLoading, router]);
  
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };
  
  const handleClearInput = () => {
    setInputText('');
    setOutputText('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('Please enter some text to humanize');
      return;
    }
    
    // Check minimum word count (50 words as per API requirement)
    const wordCount = countWords(inputText);
    if (wordCount < 50) {
      setError('Input must be at least 50 words for effective humanization');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setOutputText('Processing your text. This may take up to a minute...');
    setTaskId(null);
    
    try {
      console.log('Starting humanization process...');
      const humanized = await humanizeText(inputText);
      console.log('Humanization complete, updating output');
      setOutputText(humanized || 'No output received from the API.');
    } catch (err: any) {
      console.error('Error in humanization process:', err);
      setError(err.message || 'Failed to humanize text. Please try again.');
      setOutputText('');
    } finally {
      setIsLoading(false);
      setTaskId(null);
    }
  };
  
  const handleCopyOutput = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleDownloadOutput = () => {
    if (outputText) {
      const element = document.createElement('a');
      const file = new Blob([outputText], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = 'humanized-text.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  // Calculate current word count
  const currentWordCount = countWords(inputText);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };
  
  // Get the first name of the user
  const getFirstName = (fullName: string): string => {
    return fullName.split(' ')[0];
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-20"></div>
            <div className="relative bg-white px-6 py-4 rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold">
                Good {getGreeting()}, {getFirstName(user.name)}
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center max-w-2xl mb-4">
            Transform your ChatGPT-written essays into authentic human-like content that bypasses Turnitin AI detection with a 100% success rate
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-center mb-1">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-xs font-medium">Instant Processing</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-xs font-medium">100% Undetectable</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <Brain className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-xs font-medium">AI-Powered</p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <div className="flex-1">{error}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">Input Text</h2>
                </div>
                {inputText && !isLoading && (
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={handleClearInput}
                      variant="outline"
                      className="h-8 px-2 text-xs"
                    >
                      <span className="flex items-center space-x-1">
                        <span>Clear</span>
                      </span>
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <textarea
                  className="w-full h-80 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                  placeholder="Enter your ChatGPT-generated text here (minimum 50 words)..."
                  value={inputText}
                  onChange={handleInputChange}
                  disabled={isLoading}
                ></textarea>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">
                    Word count: {currentWordCount} 
                  </span>
                  <span className="text-xs text-gray-400">
                    {currentWordCount < 50 ? '50 words minimum required' : 'Ready to humanize'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCheck className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">Humanized Output</h2>
                </div>
                {outputText && !isLoading && (
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={handleCopyOutput}
                      variant="outline"
                      className="h-8 px-2 text-xs"
                    >
                      {copied ? (
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Copied</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1">
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </span>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDownloadOutput}
                      variant="outline"
                      className="h-8 px-2 text-xs"
                    >
                      <span className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </span>
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="relative">
                  <textarea
                    className={`w-full h-80 p-4 border border-gray-200 rounded-lg ${isLoading ? 'bg-gray-50' : outputText ? 'bg-green-50/20' : 'bg-white'}`}
                    placeholder="Humanized text will appear here..."
                    value={outputText}
                    readOnly
                  ></textarea>
                  
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg backdrop-blur-sm">
                      <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-lg">
                        <div className="w-16 h-16 relative mb-4">
                          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                          <div className="absolute inset-3 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Brain className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <p className="text-lg font-medium">Humanizing your text...</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 mb-2">
                          <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-sm text-gray-500">
                          This may take 30-60 seconds for best quality results
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isLoading || !inputText.trim() || currentWordCount < 50}
              className="px-8 py-2 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Humanizing...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Humanize Text</span>
                </span>
              )}
            </Button>
          </div>
        </form>
        
        <div className="mt-16 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b flex items-center space-x-2">
            <Info className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Pro Tips for Better Results</h2>
          </div>
          <div className="p-6">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                  <span className="text-indigo-600 text-sm font-bold">1</span>
                </span>
                <span className="text-sm">Input at least 50 words for effective humanization</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                  <span className="text-indigo-600 text-sm font-bold">2</span>
                </span>
                <span className="text-sm">Genify intentionally makes grammatical mistakes</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                  <span className="text-indigo-600 text-sm font-bold">3</span>
                </span>
                <span className="text-sm">Include complete sentences rather than fragments</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                  <span className="text-indigo-600 text-sm font-bold">4</span>
                </span>
                <span className="text-sm">Review and correct before submitting to Turnitin</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                  <span className="text-indigo-600 text-sm font-bold">5</span>
                </span>
                <span className="text-sm">The maximum word count is 2000 words per request</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                  <span className="text-indigo-600 text-sm font-bold">6</span>
                </span>
                <span className="text-sm font-medium">Keep citations in the proper format for academic papers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 