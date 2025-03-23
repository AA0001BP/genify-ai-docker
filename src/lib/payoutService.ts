import { ObjectId } from 'mongodb';
import Affiliate from '../models/Affiliate';
import PayoutRequest, { IPayoutRequest } from '../models/PayoutRequest';
import dbConnect from './mongodb';
import { MINIMUM_PAYOUT } from './constants';

/**
 * Create a new payout request
 */
export async function createPayoutRequest(
  userId: string | ObjectId,
  fullName: string,
  sortCode: string,
  accountNumber: string
): Promise<IPayoutRequest | null> {
  await dbConnect();
  
  // Find the affiliate
  const affiliate = await Affiliate.findOne({ userId });
  
  if (!affiliate || affiliate.pendingBalance < MINIMUM_PAYOUT) {
    return null;
  }
  
  // Format the sort code and account number
  const formattedSortCode = sortCode.replace(/[-\s]/g, '');
  const formattedAccountNumber = accountNumber.replace(/[-\s]/g, '');
  
  // Create the payout request
  const payoutRequest = await PayoutRequest.create({
    userId,
    amount: affiliate.pendingBalance,
    status: 'pending',
    fullName,
    sortCode: formattedSortCode,
    accountNumber: formattedAccountNumber,
  });
  
  // Update the affiliate balance
  affiliate.pendingBalance = 0;
  await affiliate.save();
  
  return payoutRequest;
}

/**
 * Get all payout requests for a user
 */
export async function getUserPayoutRequests(userId: string | ObjectId) {
  await dbConnect();
  
  const payoutRequests = await PayoutRequest.find({ userId })
    .sort({ createdAt: -1 });
  
  return payoutRequests;
}

/**
 * Get all pending payout requests (admin function)
 */
export async function getPendingPayoutRequests() {
  await dbConnect();
  
  const payoutRequests = await PayoutRequest.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .populate('userId', 'name email');
  
  return payoutRequests;
}

/**
 * Update payout request status (admin function)
 */
export async function updatePayoutRequestStatus(
  requestId: string | ObjectId,
  status: 'approved' | 'rejected' | 'paid',
  adminId: string | ObjectId,
  notes?: string
) {
  await dbConnect();
  
  const payoutRequest = await PayoutRequest.findById(requestId);
  
  if (!payoutRequest) {
    return null;
  }
  
  // Update the status and add admin info
  payoutRequest.status = status;
  payoutRequest.processedBy = new ObjectId(adminId);
  payoutRequest.processedAt = new Date();
  
  if (notes) {
    payoutRequest.notes = notes;
  }
  
  // If the request is being marked as paid, update the affiliate paidBalance
  if (status === 'paid') {
    const affiliate = await Affiliate.findOne({ userId: payoutRequest.userId });
    if (affiliate) {
      affiliate.paidBalance += payoutRequest.amount;
      await affiliate.save();
    }
  }
  
  await payoutRequest.save();
  return payoutRequest;
} 