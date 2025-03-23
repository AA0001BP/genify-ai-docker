import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { trackAffiliateClick } from '@/lib/affiliateService';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await dbConnect();
    
    // Wait for params to be fully resolved
    const resolvedParams = await params;
    
    // Get the referral code from the route parameter
    const referralCode = resolvedParams.code;
    
    // Default redirect is to the landing page (root)
    const redirect = '/';
    
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
    
    // Redirect to the landing page
    const targetUrl = new URL(redirect, req.url);
    
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