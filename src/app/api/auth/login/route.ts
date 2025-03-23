import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import * as jose from 'jose';
import sendEmail from '@/lib/emailService';
import { getVerificationEmailTemplate } from '@/lib/emailTemplates';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { email, password } = body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      // Generate a new verification token
      const { token } = user.generateVerificationToken();
      await user.save();
      
      // Create verification link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const verificationLink = `${baseUrl}/api/auth/verify-email/${token}`;
      
      // Send another verification email
      try {
        // Get email template
        const emailTemplate = await getVerificationEmailTemplate(user.name, verificationLink);
        
        await sendEmail({
          to: user.email,
          subject: 'Verify Your Email - Genify',
          html: emailTemplate,
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }
      
      return NextResponse.json(
        { error: 'Please verify your email address. A new verification email has been sent.' },
        { status: 403 }
      );
    }
    
    // Create JWT token with jose
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_please_set_env_var'
    );
    
    const token = await new jose.SignJWT({ 
      id: user._id.toString(),
      isAdmin: user.isAdmin || false
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    
    // Return user info (without password)
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin || false,
      trialEndDate: user.trialEndDate,
      subscriptionStatus: user.subscriptionStatus
    };
    
    // Create response with user data
    const response = NextResponse.json({ 
      message: 'Login successful', 
      user: safeUser 
    });
    
    // Set cookie on the response
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong during login' },
      { status: 500 }
    );
  }
} 