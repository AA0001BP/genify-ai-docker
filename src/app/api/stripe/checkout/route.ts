import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { createStripeCustomer, createCheckoutSession } from '@/lib/stripeService';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get the token from cookies
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      console.error('No auth token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_please_set_env_var') as any;
      userId = decoded.userId || decoded.id;
      
      if (!userId) {
        console.error('Token verified but no user ID found in token');
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      }
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log('User ID from token:', userId);
    
    // Get user data from the database
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('User not found in database:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('Found user:', user.email);
    
    // Get return URL from request body
    let returnUrl;
    try {
      const body = await req.json();
      returnUrl = body.returnUrl;
    } catch (error) {
      console.error('Error parsing request body:', error);
      returnUrl = req.headers.get('referer') || 'http://localhost:3000';
    }
    
    if (!returnUrl) {
      returnUrl = 'http://localhost:3000';
    }
    
    console.log('Return URL:', returnUrl);
    
    // Create or get Stripe customer ID
    const customerId = await createStripeCustomer(
      userId,
      user.email,
      user.name
    );
    
    // Create checkout session
    const checkoutSession = await createCheckoutSession(customerId, returnUrl);
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 