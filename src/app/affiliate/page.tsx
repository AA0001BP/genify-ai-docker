'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, DollarSign, Users, Video, CheckCircle2, Copy, ArrowRight } from 'lucide-react';

export default function AffiliatePage() {
  const [copied, setCopied] = useState(false);

  const handleCopyExample = () => {
    navigator.clipboard.writeText('https://genify.com?ref=YOURUNIQUEREF123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Earn Money by Sharing <span className="animated-gradient-text">Genify</span> on TikTok
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Get £5 for every new user who subscribes after their free trial. Simple content, real earnings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">How It Works</h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Create a Free Account</h3>
                    <p className="text-muted-foreground">Sign up for a free Genify account to get your unique affiliate link.</p>
                  </div>
                </li>
                
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Share on TikTok and Social Media</h3>
                    <p className="text-muted-foreground">Create videos showing how Genify helps students improve their writing. Add your affiliate link to your bio.</p>
                  </div>
                </li>
                
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Earn Rewards</h3>
                    <p className="text-muted-foreground">Receive £5 for every user who subscribes after their trial period using your link.</p>
                  </div>
                </li>
                
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Get Paid</h3>
                    <p className="text-muted-foreground">Cash out once you reach the £25 threshold via PayPal or bank transfer.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="rounded-xl border bg-card p-8 shadow-sm h-fit">
              <div className="flex items-center mb-6">
                <DollarSign className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-2xl font-bold">Example Earnings</h2>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">5 conversions</span>
                    <span className="font-semibold">£25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2 w-1/4"></div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">10 conversions</span>
                    <span className="font-semibold">£50</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2 w-2/4"></div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">20 conversions</span>
                    <span className="font-semibold">£100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2 w-full"></div>
                  </div>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm mb-3">Your affiliate link will look like this:</p>
                  <div className="flex items-center">
                    <code className="bg-background p-2 rounded text-xs flex-1 overflow-x-auto">
                      https://genify.com?ref=YOURUNIQUEREF123
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="ml-2 h-8" 
                      onClick={handleCopyExample}
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card">
              <div className="p-3 rounded-full bg-green-100 mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Simple Commission</h3>
              <p className="text-muted-foreground text-sm">Flat £5 fee per subscription. No complex calculations or confusing tiers.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card">
              <div className="p-3 rounded-full bg-blue-100 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Built for Students</h3>
              <p className="text-muted-foreground text-sm">Recommend a tool that genuinely helps fellow students while earning money.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card">
              <div className="p-3 rounded-full bg-purple-100 mb-4">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">TikTok Friendly</h3>
              <p className="text-muted-foreground text-sm">Perfect for short-form content. Simple demos perform exceptionally well.</p>
            </div>
          </div>
          
          <div className="rounded-xl bg-muted p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-muted-foreground mb-6">Create your free account now to get your unique affiliate link</p>
            <Link href="/signup" passHref>
              <Button size="lg" className="bg-black text-white hover:bg-black/90 font-medium cta-button">
                <span className="flex items-center">
                  Sign Up for Free <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container px-4 py-6 md:py-12">
          <p className="text-center text-xs md:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Genify | <Link href="/" className="text-primary hover:underline">Return to Home</Link>
          </p>
        </div>
      </footer>
    </div>
  );
} 