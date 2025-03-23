import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

// Session type definition
type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    isAdmin: boolean;
    trialEndDate?: Date | null;
    subscriptionStatus?: string | null;
  } | null;
};

/**
 * Get the current user session from JWT token in cookies
 * This function should only be used in server components or API routes, not in middleware
 */
export async function getServerSession(): Promise<Session> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');
    const token = authToken ? authToken.value : undefined;
    
    if (!token) {
      return { user: null };
    }
    
    const jwtSecret = process.env.JWT_SECRET || '';
    const decoded = jwt.verify(token, jwtSecret) as { id: string; isAdmin?: boolean };
    
    if (!decoded || !decoded.id) {
      return { user: null };
    }
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return { user: null };
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return { user: null };
    }
    
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin || false,
        trialEndDate: user.trialEndDate,
        subscriptionStatus: user.subscriptionStatus,
      }
    };
  } catch (error) {
    console.error('Session error:', error);
    return { user: null };
  }
}

/**
 * Get the user ID from the request cookie
 * This function is used in API routes, not middleware
 */
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      console.error('No auth_token cookie found in request');
      return null;
    }
    
    const jwtSecret = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return null;
    }
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      
      if (!decoded || !decoded.id) {
        console.error('Invalid JWT token format, missing id field');
        return null;
      }
      
      return decoded.id;
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return null;
    }
  } catch (error) {
    console.error('Error getting user ID from request:', error);
    return null;
  }
} 