import { NextRequest, NextResponse } from 'next/server';
import { handleSubscriptionEvent, getStripe } from '@/lib/stripeService';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { trackReferralConversion } from '@/lib/affiliateService';

// Define the events we want to handle
const relevantEvents = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
];

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }
    
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Stripe webhook secret is not configured');
      return NextResponse.json(
        { error: 'Webhook is not configured correctly' },
        { status: 500 }
      );
    }
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`Received Stripe webhook event: ${event.type}`);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err?.message || 'Unknown error'}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed` },
        { status: 400 }
      );
    }
    
    // Special handling for checkout session completion
    if (event.type === 'checkout.session.completed') {
      try {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        // Handle subscription checkout completion
        if (session.mode === 'subscription' && session.customer) {
          const customerId = session.customer as string;
          console.log('Finding user with customerId:', customerId);
          
          // Find the user with this Stripe customer ID
          const user = await User.findOne({ stripeCustomerId: customerId });
          
          if (!user) {
            console.error('No user found for Stripe customer:', customerId);
            return NextResponse.json(
              { error: 'User not found for this customer' },
              { status: 404 }
            );
          }
          
          console.log('Found user:', user.email);
          
          // Update user's subscription status
          user.subscriptionStatus = 'active';
          
          // If there's a subscription ID in the session, save it
          if (session.subscription) {
            user.stripeSubscriptionId = session.subscription as string;
            console.log('Updated subscription ID:', user.stripeSubscriptionId);
          }
          
          await user.save();
          console.log('User subscription status updated to active');
          
          // Track affiliate conversion if user was referred
          if (user.referredBy) {
            await trackReferralConversion(user._id);
            console.log('Tracked affiliate conversion for user:', user._id);
          }
          
          return NextResponse.json({ received: true }, { status: 200 });
        }
      } catch (error: any) {
        console.error('Error handling checkout session:', error?.message || 'Unknown error');
        return NextResponse.json(
          { error: 'Error handling checkout session' },
          { status: 500 }
        );
      }
    }
    
    // Handle the subscription events
    if (relevantEvents.includes(event.type) && event.type !== 'checkout.session.completed') {
      try {
        await handleSubscriptionEvent(event);
        
        // For subscription created events, also track affiliate conversion
        if (event.type === 'customer.subscription.created') {
          const subscription = event.data.object;
          const customerId = subscription.customer as string;
          
          const user = await User.findOne({ stripeCustomerId: customerId });
          if (user && user.referredBy) {
            await trackReferralConversion(user._id);
            console.log('Tracked affiliate conversion for subscription event:', user._id);
          }
        }
        
        return NextResponse.json({ received: true }, { status: 200 });
      } catch (error: any) {
        console.error(`Error handling Stripe event: ${error?.message || 'Unknown error'}`);
        return NextResponse.json(
          { error: 'Error handling Stripe event' },
          { status: 500 }
        );
      }
    }
    
    // Return a success response for any unhandled events
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error?.message || 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 