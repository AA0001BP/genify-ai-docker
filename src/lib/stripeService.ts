import Stripe from 'stripe';
import User from '@/models/User';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia', // Use the latest API version
});

/**
 * Create a new Stripe customer for a user
 */
export async function createStripeCustomer(userId: string, email: string, name: string) {
  try {
    console.log(`Creating/getting Stripe customer for user ${userId}`);
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      throw new Error('User not found');
    }
    
    // Check if user already has a Stripe customer ID
    if (user.stripeCustomerId) {
      console.log(`User already has Stripe customer ID: ${user.stripeCustomerId}`);
      
      // Verify that the customer exists in Stripe
      try {
        await stripe.customers.retrieve(user.stripeCustomerId);
        return user.stripeCustomerId;
      } catch (stripeError: any) {
        // If customer doesn't exist in Stripe, create a new one
        if (stripeError.code === 'resource_missing') {
          console.log(`Customer ID ${user.stripeCustomerId} not found in Stripe, creating new customer`);
        } else {
          throw stripeError;
        }
      }
    }
    
    console.log(`Creating new Stripe customer for ${email}`);
    
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });
    
    console.log(`Created Stripe customer with ID: ${customer.id}`);
    
    // Update user with Stripe customer ID
    user.stripeCustomerId = customer.id;
    await user.save();
    
    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Create a checkout session for the subscription
 */
export async function createCheckoutSession(customerId: string, returnUrl: string) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error('Stripe price ID not configured');
    
    console.log(`Creating checkout session with price ID: ${priceId}`);
    
    // First, verify that the price exists
    try {
      await stripe.prices.retrieve(priceId);
    } catch (error: any) {
      console.error(`Price ID ${priceId} not found in Stripe:`, error.message);
      
      // For testing purposes, if no price ID is set, create a test price
      if (priceId === 'price_test' && process.env.NODE_ENV !== 'production') {
        console.log('Creating a test price for development');
        
        const product = await stripe.products.create({
          name: 'Text Humanizer Monthly Subscription (Test)',
        });
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 1900, // £19.00
          currency: 'gbp',
          recurring: {
            interval: 'month',
          },
        });
        
        console.log(`Created test price: ${price.id}`);
        
        // Use the newly created price
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: price.id,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${returnUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${returnUrl}/payment-cancel`,
        });
        
        return session;
      }
      
      throw new Error(`Invalid price ID: ${priceId}. Please check your Stripe configuration.`);
    }
    
    // Create the checkout session with the verified price ID
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/payment-cancel`,
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a customer portal session for managing the subscription
 */
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  try {
    console.log(`Creating customer portal session for customer: ${customerId}`);
    
    // Check if the Stripe customer exists
    try {
      await stripe.customers.retrieve(customerId);
    } catch (error: any) {
      console.error(`Customer ID ${customerId} not found in Stripe:`, error.message);
      throw new Error(`Invalid customer ID: ${customerId}`);
    }
    
    try {
      // Create the portal session with configuration
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      
      console.log(`Customer portal session created: ${session.url}`);
      return session;
    } catch (error: any) {
      // Check for the specific test mode configuration error
      if (error.type === 'StripeInvalidRequestError' && 
          error.message.includes('test mode default configuration has not been created')) {
        console.log('Test mode portal configuration not found, returning mock data');
        
        // In test mode, if there's no portal configuration, return a mock response
        // that will redirect back to the account page
        return {
          url: `${returnUrl}?portal_session=mock_session`,
          id: 'mock_session_id',
          object: 'billing_portal.session',
          created: Date.now() / 1000,
          customer: customerId,
          livemode: false,
          return_url: returnUrl,
        };
      }
      
      // For other errors, rethrow
      throw error;
    }
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const user = await User.findById(userId);
    if (!user) return false;
    
    // Check if user is in trial period
    if (user.subscriptionStatus === 'trialing' && user.trialEndDate) {
      const now = new Date();
      if (now < user.trialEndDate) {
        return true;
      } else {
        // Update user status if trial has expired
        user.subscriptionStatus = 'expired';
        await user.save();
        return false;
      }
    }
    
    // Check for active subscription
    return user.subscriptionStatus === 'active';
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Update user subscription status based on Stripe webhook event
 */
export async function handleSubscriptionEvent(event: Stripe.Event) {
  try {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    // Find the user with this Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) {
      throw new Error(`No user found with Stripe customer ID: ${customerId}`);
    }
    
    // Update user subscription status
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        user.subscriptionStatus = subscription.status === 'active' ? 'active' : 'canceled';
        user.stripeSubscriptionId = subscription.id;
        break;
        
      case 'customer.subscription.deleted':
        user.subscriptionStatus = 'canceled';
        break;
    }
    
    await user.save();
    return true;
  } catch (error) {
    console.error('Error handling subscription event:', error);
    throw error;
  }
}

/**
 * Get the Stripe instance for direct API calls
 */
export function getStripe() {
  return stripe;
} 