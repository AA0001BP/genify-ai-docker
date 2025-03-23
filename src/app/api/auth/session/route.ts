import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    // Get the token from cookies
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }
    
    // Verify the token using jose
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_please_set_env_var'
    );
    
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.id || payload.userId;
    
    if (!userId) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }
    
    // Check if email is verified (logout if not verified)
    if (!user.isVerified) {
      // Clear auth cookie
      const response = NextResponse.json(
        { user: null, error: 'Email not verified' },
        { status: 403 }
      );
      
      response.cookies.set({
        name: 'auth_token',
        value: '',
        httpOnly: true,
        path: '/',
        maxAge: 0, // Expire immediately
      });
      
      return response;
    }
    
    // Return user data (without password)
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin || false,
      trialEndDate: user.trialEndDate,
      subscriptionStatus: user.subscriptionStatus
    };
    
    // Check if trial has expired but status is still 'trialing'
    if (user.subscriptionStatus === 'trialing' && user.trialEndDate) {
      const now = new Date();
      const trialEnd = new Date(user.trialEndDate);
      
      if (now > trialEnd) {
        // Update user's subscription status in the database
        user.subscriptionStatus = 'expired';
        await user.save();
        
        // Update the response object
        safeUser.subscriptionStatus = 'expired';
      }
    }
    
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }
} 