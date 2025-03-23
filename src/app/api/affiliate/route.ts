import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getOrCreateAffiliate, getAffiliateStats } from '@/lib/affiliateService';

// Get affiliate stats for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get affiliate stats
    const stats = await getAffiliateStats(session.user.id);
    
    if (!stats) {
      // Create a new affiliate account if one doesn't exist
      const affiliate = await getOrCreateAffiliate(session.user.id);
      
      // Get the stats for the new account
      const newStats = await getAffiliateStats(session.user.id);
      
      return NextResponse.json({ data: newStats }, { status: 200 });
    }
    
    return NextResponse.json({ data: stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 