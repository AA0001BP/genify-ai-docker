import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { getAdminAffiliateStats } from '@/lib/affiliateService';

// Get all affiliate statistics (admin only)
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
    
    // Get admin affiliate stats
    const stats = await getAdminAffiliateStats();
    
    return NextResponse.json({ data: stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin affiliate stats:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 