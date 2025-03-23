import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { updatePayoutRequestStatus } from '@/lib/payoutService';

// Update payout request status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const body = await req.json();
    const { status, notes } = body;
    
    // Validate input
    if (!status || !['approved', 'rejected', 'paid'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Update payout request status
    const payoutRequest = await updatePayoutRequestStatus(
      params.id,
      status,
      session.user.id,
      notes
    );
    
    if (!payoutRequest) {
      return NextResponse.json(
        { error: 'Payout request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Payout request updated successfully',
      data: payoutRequest
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating payout request:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 