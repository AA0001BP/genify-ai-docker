import mongoose from 'mongoose';

export interface IPayoutRequest extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  fullName: string;
  sortCode: string;
  accountNumber: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  processedAt: Date | null;
  processedBy: mongoose.Types.ObjectId | null;
}

const PayoutRequestSchema = new mongoose.Schema<IPayoutRequest>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 25, // £25 minimum payout
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    fullName: {
      type: String,
      required: true,
    },
    sortCode: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^\d{6}$/.test(v.replace(/[-\s]/g, ''));
        },
        message: 'Sort code must be a valid 6-digit number'
      }
    },
    accountNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^\d{8}$/.test(v.replace(/[-\s]/g, ''));
        },
        message: 'Account number must be a valid 8-digit number'
      }
    },
    notes: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Check if model already exists to prevent OverwriteModelError during hot reloads
const PayoutRequest = mongoose.models.PayoutRequest || mongoose.model<IPayoutRequest>('PayoutRequest', PayoutRequestSchema);

export default PayoutRequest; 