import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';

// Get user by ID (for authenticated users and admin verification)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the user ID from the request cookie for auth check
    const requestUserId = await getUserIdFromRequest(req);
    
    if (!requestUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Get the user ID from path parameter
    const userId = params.id;
    
    // Only allow users to fetch their own data for security
    if (requestUserId !== userId) {
      // Check if the requester is an admin (in this case we need to fetch the user first)
      const requestingUser = await User.findById(requestUserId).select('isAdmin');
      
      if (!requestingUser || !requestingUser.isAdmin) {
        return NextResponse.json(
          { error: 'You can only access your own user data' },
          { status: 403 }
        );
      }
    }
    
    // Find user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user data without sensitive fields
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin || false,
      trialEndDate: user.trialEndDate,
      subscriptionStatus: user.subscriptionStatus,
    };
    
    return NextResponse.json({ data: userData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 