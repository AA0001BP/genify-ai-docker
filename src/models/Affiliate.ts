import mongoose from 'mongoose';

export interface IAffiliateReferral {
  referredUserId: mongoose.Types.ObjectId;
  signupDate: Date;
  conversionDate: Date | null;
  isConverted: boolean;
  commission: number;
  isPaid: boolean;
}

export interface IAffiliateClick {
  ipHash: string;
  userAgent: string;
  timestamp: Date;
  country?: string;
  city?: string;
  convertedToSignup: boolean;
}

export interface IAffiliate extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  affiliateCode: string;
  totalReferrals: number;
  totalConversions: number;
  totalClicks: number;
  clickToSignupRate: number;
  totalEarned: number;
  pendingBalance: number;
  paidBalance: number;
  referrals: IAffiliateReferral[];
  clicks: IAffiliateClick[];
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateReferralSchema = new mongoose.Schema({
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  signupDate: {
    type: Date,
    default: Date.now,
  },
  conversionDate: {
    type: Date,
    default: null,
  },
  isConverted: {
    type: Boolean,
    default: false,
  },
  commission: {
    type: Number,
    default: 0,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

const AffiliateClickSchema = new mongoose.Schema({
  ipHash: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  convertedToSignup: {
    type: Boolean,
    default: false,
  }
});

const AffiliateSchema = new mongoose.Schema<IAffiliate>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    affiliateCode: {
      type: String,
      required: true,
      unique: true,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    totalConversions: {
      type: Number,
      default: 0,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    clickToSignupRate: {
      type: Number,
      default: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    pendingBalance: {
      type: Number,
      default: 0,
    },
    paidBalance: {
      type: Number,
      default: 0,
    },
    referrals: [AffiliateReferralSchema],
    clicks: [AffiliateClickSchema],
  },
  { timestamps: true }
);

// Check if model already exists to prevent OverwriteModelError during hot reloads
const Affiliate = mongoose.models.Affiliate || mongoose.model<IAffiliate>('Affiliate', AffiliateSchema);

export default Affiliate; 