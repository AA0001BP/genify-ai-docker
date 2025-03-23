import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Helper function to generate random token
function generateToken(size = 32) {
  let token = '';
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < size * 2; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  trialEndDate: Date | null;
  subscriptionStatus: 'trialing' | 'active' | 'canceled' | 'expired' | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  referredBy: mongoose.Types.ObjectId | null;
  referralCode: string | null;
  isAdmin: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): { token: string, expires: Date };
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props: { value: string }) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password should be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
    },
    trialEndDate: {
      type: Date,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ['trialing', 'active', 'canceled', 'expired', null],
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralCode: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
UserSchema.methods.generateVerificationToken = function(): { token: string, expires: Date } {
  // Generate a random token
  const token = generateToken();
  
  // Set token expiration to 24 hours from now
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  // Save token and expiration to user
  this.verificationToken = token;
  this.verificationTokenExpires = expires;
  
  return { token, expires };
};

// Check if the model already exists to prevent OverwriteModelError during hot reloads
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 