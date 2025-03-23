import { ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import Affiliate, { IAffiliate, IAffiliateReferral, IAffiliateClick } from '../models/Affiliate';
import User from '../models/User';
import dbConnect from './mongodb';
import { COMMISSION_AMOUNT, MINIMUM_PAYOUT } from './constants';

/**
 * Generate a unique affiliate code for a user
 */
export async function generateAffiliateCode(userId: string | ObjectId): Promise<string> {
  await dbConnect();
  
  // Generate a short code with nanoid (6 characters)
  let code = nanoid(6);
  
  // Ensure code is unique
  let existingAffiliate = await Affiliate.findOne({ affiliateCode: code });
  while (existingAffiliate) {
    code = nanoid(6);
    existingAffiliate = await Affiliate.findOne({ affiliateCode: code });
  }
  
  return code;
}

/**
 * Create or retrieve an affiliate account for a user
 */
export async function getOrCreateAffiliate(userId: string | ObjectId): Promise<IAffiliate> {
  await dbConnect();
  
  // Check if affiliate already exists
  let affiliate = await Affiliate.findOne({ userId });
  
  if (!affiliate) {
    try {
      // Generate a unique affiliate code
      const affiliateCode = await generateAffiliateCode(userId);
      
      // Use findOneAndUpdate with upsert to safely create a new document
      // or return the existing one if it was created in a concurrent operation
      affiliate = await Affiliate.findOneAndUpdate(
        { userId }, // filter
        { // update
          userId,
          affiliateCode,
          totalReferrals: 0,
          totalConversions: 0,
          totalClicks: 0,
          clickToSignupRate: 0,
          totalEarned: 0,
          pendingBalance: 0,
          paidBalance: 0,
          referrals: [],
          clicks: [],
        },
        { 
          upsert: true, // create if it doesn't exist
          new: true, // return the modified/new document
          runValidators: true, // run validators on the update
          setDefaultsOnInsert: true // set default values on insert
        }
      );
      
      // Update the user with the referral code
      // Only if we actually created a new affiliate
      await User.findByIdAndUpdate(userId, { referralCode: affiliateCode });
    } catch (error) {
      // If there was an error (like duplicate key), try to get the existing record
      console.error('Error in getOrCreateAffiliate:', error);
      affiliate = await Affiliate.findOne({ userId });
      
      // If we still don't have an affiliate record, rethrow the error
      if (!affiliate) throw error;
    }
  }
  
  return affiliate;
}

/**
 * Generate a hash of the IP address to maintain privacy
 */
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Track a click on an affiliate link
 */
export async function trackAffiliateClick(
  referralCode: string, 
  ip: string, 
  userAgent: string,
  countryCode?: string,
  city?: string
): Promise<boolean> {
  try {
    await dbConnect();
    
    // Find the affiliate by the referral code
    const referrer = await User.findOne({ referralCode });
    
    if (!referrer) {
      return false;
    }
    
    // Get or create the affiliate account
    const affiliate = await getOrCreateAffiliate(referrer._id);
    
    // Hash the IP address for privacy
    const ipHash = hashIP(ip);
    
    // Check if this IP has clicked in the last 24 hours to prevent duplicate counts
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const existingClick = affiliate.clicks.find(click => 
      click.ipHash === ipHash && new Date(click.timestamp) > oneDayAgo
    );
    
    if (existingClick) {
      // If this IP clicked recently, don't count as a new click
      return true;
    }
    
    // Add the new click
    affiliate.clicks.push({
      ipHash,
      userAgent,
      timestamp: new Date(),
      country: countryCode,
      city: city,
      convertedToSignup: false
    });
    
    // Update totals
    affiliate.totalClicks += 1;
    
    // Update click-to-signup rate
    if (affiliate.totalReferrals > 0) {
      affiliate.clickToSignupRate = (affiliate.totalReferrals / affiliate.totalClicks) * 100;
    }
    
    await affiliate.save();
    return true;
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return false;
  }
}

/**
 * Track a new referral signup
 */
export async function trackReferralSignup(referralCode: string, newUserId: string | ObjectId): Promise<boolean> {
  await dbConnect();
  
  // Find the affiliate by the referral code
  const referrer = await User.findOne({ referralCode });
  
  if (!referrer) {
    return false;
  }
  
  // Update the new user with the referrer ID
  await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });
  
  // Get or create the affiliate account
  const affiliate = await getOrCreateAffiliate(referrer._id);
  
  // Add the new referral
  affiliate.referrals.push({
    referredUserId: new ObjectId(newUserId),
    signupDate: new Date(),
    conversionDate: null,
    isConverted: false,
    commission: 0,
    isPaid: false,
  });
  
  // Update totals
  affiliate.totalReferrals += 1;
  
  // Update click-to-signup rate
  if (affiliate.totalClicks > 0) {
    affiliate.clickToSignupRate = (affiliate.totalReferrals / affiliate.totalClicks) * 100;
  }
  
  await affiliate.save();
  return true;
}

/**
 * Track a referral conversion (when a referred user purchases a subscription)
 */
export async function trackReferralConversion(userId: string | ObjectId): Promise<boolean> {
  await dbConnect();
  
  // Find the user that was referred
  const user = await User.findById(userId);
  
  if (!user || !user.referredBy) {
    return false;
  }
  
  // Find the affiliate account of the referrer
  const affiliate = await Affiliate.findOne({ userId: user.referredBy });
  
  if (!affiliate) {
    return false;
  }
  
  // Find the referral in the list
  const referralIndex = affiliate.referrals.findIndex(
    (ref: IAffiliateReferral) => ref.referredUserId.toString() === userId.toString() && !ref.isConverted
  );
  
  if (referralIndex === -1) {
    return false;
  }
  
  // Update the referral
  affiliate.referrals[referralIndex].isConverted = true;
  affiliate.referrals[referralIndex].conversionDate = new Date();
  affiliate.referrals[referralIndex].commission = COMMISSION_AMOUNT;
  
  // Update totals
  affiliate.totalConversions += 1;
  affiliate.totalEarned += COMMISSION_AMOUNT;
  affiliate.pendingBalance += COMMISSION_AMOUNT;
  
  await affiliate.save();
  return true;
}

/**
 * Check if a user is eligible for a payout
 */
export async function isEligibleForPayout(userId: string | ObjectId): Promise<boolean> {
  await dbConnect();
  
  const affiliate = await Affiliate.findOne({ userId });
  
  if (!affiliate) {
    return false;
  }
  
  return affiliate.pendingBalance >= MINIMUM_PAYOUT;
}

/**
 * Get affiliate statistics for a user
 */
export async function getAffiliateStats(userId: string | ObjectId) {
  await dbConnect();
  
  const affiliate = await Affiliate.findOne({ userId });
  
  if (!affiliate) {
    return null;
  }
  
  return {
    affiliateCode: affiliate.affiliateCode,
    totalReferrals: affiliate.totalReferrals,
    totalConversions: affiliate.totalConversions,
    totalClicks: affiliate.totalClicks,
    clickToSignupRate: affiliate.clickToSignupRate.toFixed(2),
    totalEarned: affiliate.totalEarned,
    pendingBalance: affiliate.pendingBalance,
    paidBalance: affiliate.paidBalance,
    isEligibleForPayout: affiliate.pendingBalance >= MINIMUM_PAYOUT,
    minimumPayout: MINIMUM_PAYOUT,
  };
}

/**
 * Get admin statistics for all affiliates
 */
export async function getAdminAffiliateStats() {
  await dbConnect();
  
  const allAffiliates = await Affiliate.find()
    .sort({ totalEarned: -1 })
    .populate('userId', 'name email');
  
  const totalReferrals = allAffiliates.reduce((sum, aff) => sum + aff.totalReferrals, 0);
  const totalClicks = allAffiliates.reduce((sum, aff) => sum + aff.totalClicks, 0);
  const totalConversions = allAffiliates.reduce((sum, aff) => sum + aff.totalConversions, 0);
  const totalEarned = allAffiliates.reduce((sum, aff) => sum + aff.totalEarned, 0);
  const totalPendingBalance = allAffiliates.reduce((sum, aff) => sum + aff.pendingBalance, 0);
  const totalPaidBalance = allAffiliates.reduce((sum, aff) => sum + aff.paidBalance, 0);
  
  return {
    totalAffiliates: allAffiliates.length,
    totalReferrals,
    totalClicks,
    totalConversions,
    overallClickToSignupRate: totalClicks > 0 ? ((totalReferrals / totalClicks) * 100).toFixed(2) : '0',
    totalEarned,
    totalPendingBalance,
    totalPaidBalance,
    conversionRate: totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0,
    affiliates: allAffiliates.map(aff => ({
      userId: aff.userId,
      affiliateCode: aff.affiliateCode,
      totalReferrals: aff.totalReferrals,
      totalClicks: aff.totalClicks,
      totalConversions: aff.totalConversions,
      clickToSignupRate: aff.clickToSignupRate.toFixed(2),
      totalEarned: aff.totalEarned,
      pendingBalance: aff.pendingBalance,
      paidBalance: aff.paidBalance,
    })),
  };
} 