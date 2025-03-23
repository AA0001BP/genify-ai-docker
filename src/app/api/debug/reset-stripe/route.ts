import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

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
    
    // Reset current user's Stripe data
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Reset Stripe-related fields
    user.stripeCustomerId = null;
    user.stripeSubscriptionId = null;
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Stripe data reset successfully',
      user: {
        id: user._id,
        email: user.email,
        trialEndDate: user.trialEndDate,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId
      }
    });
  } catch (error) {
    console.error('Error resetting Stripe data:', error);
    return NextResponse.json({ error: 'Failed to reset Stripe data' }, { status: 500 });
  }
} 