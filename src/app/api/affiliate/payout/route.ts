import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { createPayoutRequest, getUserPayoutRequests } from '@/lib/payoutService';
import { isEligibleForPayout } from '@/lib/affiliateService';

// Get payout requests for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get payout requests
    const payoutRequests = await getUserPayoutRequests(session.user.id);
    
    // Check if the user is eligible for a new payout
    const isEligible = await isEligibleForPayout(session.user.id);
    
    return NextResponse.json({
      data: {
        payoutRequests,
        isEligible
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Create a new payout request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the user is eligible for a payout
    const isEligible = await isEligibleForPayout(session.user.id);
    
    if (!isEligible) {
      return NextResponse.json(
        { error: 'You are not eligible for a payout at this time' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const { fullName, sortCode, accountNumber } = body;
    
    // Validate input
    if (!fullName || !sortCode || !accountNumber) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    // Create the payout request
    const payoutRequest = await createPayoutRequest(
      session.user.id,
      fullName,
      sortCode,
      accountNumber
    );
    
    if (!payoutRequest) {
      return NextResponse.json(
        { error: 'Failed to create payout request' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Payout request created successfully',
      data: payoutRequest
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating payout request:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 