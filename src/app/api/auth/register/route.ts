import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import sendEmail from '@/lib/emailService';
import { getVerificationEmailTemplate } from '@/lib/emailTemplates';
import { trackReferralSignup } from '@/lib/affiliateService';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, password, referralCode } = body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Calculate trial end date (7 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    
    // Create new user (not verified yet) with trial
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      trialEndDate,
      subscriptionStatus: 'trialing',
    });
    
    // Process referral code if provided
    if (referralCode) {
      await trackReferralSignup(referralCode, user._id);
    }
    
    // Generate verification token
    const { token } = user.generateVerificationToken();
    await user.save();
    
    // Create verification link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const verificationLink = `${baseUrl}/api/auth/verify-email/${token}`;
    
    // Send verification email
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
      // Continue with the registration process even if email fails
    }
    
    // Remove password from response
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      isVerified: user.isVerified,
      trialEndDate: user.trialEndDate,
      subscriptionStatus: user.subscriptionStatus,
    };
    
    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        user: safeUser 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong during registration' },
      { status: 500 }
    );
  }
} 