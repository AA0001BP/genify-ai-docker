import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
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
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Set the trial end date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    user.trialEndDate = yesterday;
    user.subscriptionStatus = 'expired';
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Trial expired successfully',
      user: {
        id: user._id,
        email: user.email,
        trialEndDate: user.trialEndDate,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Error expiring trial:', error);
    return NextResponse.json({ error: 'Failed to expire trial' }, { status: 500 });
  }
} 