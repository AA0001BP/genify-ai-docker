import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getPendingPayoutRequests } from '@/lib/payoutService';

// Get all pending payout requests (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the user is an admin
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Get pending payout requests
    const payoutRequests = await getPendingPayoutRequests();
    
    return NextResponse.json({ data: payoutRequests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 