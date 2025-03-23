import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { trackAffiliateClick } from '@/lib/affiliateService';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Parse the request body
    const body = await req.json();
    const { referralCode } = body;
    
    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }
    
    // Get the IP address
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               '0.0.0.0';
    
    // Get the user agent
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    // Track the click
    await trackAffiliateClick(referralCode, ip, userAgent);
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Also support GET requests for redirects
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get the referral code from query parameters
    const url = new URL(req.url);
    const referralCode = url.searchParams.get('ref');
    const redirect = url.searchParams.get('to') || '/'; // Default to landing page
    
    if (!referralCode) {
      // If no referral code provided, redirect to homepage
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Get the IP address
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               '0.0.0.0';
    
    // Get the user agent
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    // Track the click
    await trackAffiliateClick(referralCode, ip, userAgent);
    
    // Redirect to the specified page (default to landing page)
    const targetUrl = new URL(redirect, req.url);
    
    // Only add ref param to signup page, not needed on the landing page
    if (redirect.includes('/signup')) {
      targetUrl.searchParams.set('ref', referralCode);
    }
    
    // Create the response with redirect
    const response = NextResponse.redirect(targetUrl);
    
    // Set a cookie that will persist the referral code for 30 days
    // This allows the referral to be tracked even if the user navigates away and comes back
    response.cookies.set({
      name: 'affiliate_ref',
      value: referralCode,
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error tracking affiliate click and redirecting:', error);
    // In case of error, redirect to homepage
    return NextResponse.redirect(new URL('/', req.url));
  }
} 