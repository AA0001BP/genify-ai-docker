import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    // Get the token from cookies
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });
    
    // Verify the token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_please_set_env_var') as any;
      userId = decoded.userId || decoded.id;
      
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get user data
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user has a Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No Stripe customer ID found for this user',
        user: {
          id: user._id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
        }
      }, { status: 400 });
    }
    
    try {
      // Get customer subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all',
        limit: 1,
      });
      
      if (subscriptions.data.length === 0) {
        // No subscriptions found, but customer exists
        return NextResponse.json({ 
          message: 'No subscriptions found for this customer',
          user: {
            id: user._id,
            email: user.email,
            subscriptionStatus: user.subscriptionStatus,
          }
        });
      }
      
      // Get the most recent subscription
      const subscription = subscriptions.data[0];
      
      // Update user subscription status
      user.stripeSubscriptionId = subscription.id;
      
      // Update status based on subscription status
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        user.subscriptionStatus = 'active';
      } else if (subscription.status === 'canceled') {
        user.subscriptionStatus = 'canceled';
      } else {
        user.subscriptionStatus = 'expired';
      }
      
      await user.save();
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription status updated successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        user: {
          id: user._id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          stripeSubscriptionId: user.stripeSubscriptionId,
        }
      });
    } catch (stripeError) {
      console.error('Error fetching Stripe subscriptions:', stripeError);
      return NextResponse.json({ 
        error: 'Error fetching subscription information from Stripe',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
  }
} 