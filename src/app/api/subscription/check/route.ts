import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { hasActiveSubscription } from '@/lib/stripeService';
import { getServerSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get the authenticated user
    const session = await getServerSession();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ 
        active: false,
        message: 'User not authenticated'
      }, { status: 401 });
    }
    
    // Check if the user has an active subscription or trial
    const hasAccess = await hasActiveSubscription(session.user.id);
    
    return NextResponse.json({ 
      active: hasAccess,
      message: hasAccess ? 'Active subscription or trial' : 'No active subscription or trial'
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json({ 
      active: false,
      message: 'Error checking subscription status'
    }, { status: 500 });
  }
} 