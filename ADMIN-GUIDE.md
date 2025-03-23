# Admin Panel Guide

## Accessing the Admin Panel

The admin panel provides access to affiliate statistics and payout management. To access it:

1. **Ensure your account has admin privileges**:
   - By default, user accounts do not have admin privileges
   - Admin privileges must be granted by setting the `isAdmin` flag to `true` in the database
   - Use the provided script to promote a user to admin (see below)

2. **Login to your account** with admin privileges

3. **Navigate to the admin dashboard** at `/admin/affiliate`

## Running the Make-Admin Script

A script has been provided to promote a user to admin status. To use it:

1. Ensure MongoDB is running and accessible
2. Run the script with the user's email:
   ```
   node scripts/make-admin.js user@email.com
   ```
3. The script will confirm when the user has been made an admin

## Admin Panel Features

### Affiliate Statistics Dashboard

The affiliate statistics dashboard provides an overview of:

- Total number of affiliates
- Total referrals generated
- Total conversions
- Total affiliate earnings
- Detailed affiliate performance metrics

### Payout Request Management

The payout request management system allows you to:

- View all pending payout requests
- Approve, reject, or mark requests as paid
- Add notes to payout requests
- Track processed payouts with timestamps

## Security Implementation

The admin panel is protected by middleware that checks:

1. **Authentication**: Users must be logged in with a valid session
2. **Authorization**: Users must have the `isAdmin` flag set to `true` in their JWT token

Unauthorized access attempts are:
- Redirected to the login page if not authenticated
- Redirected to the dashboard if authenticated but not an admin
- Returned a 403 Forbidden status for API routes

## Troubleshooting Admin Access

If you're unable to access the admin panel after running the make-admin script:

1. Ensure you've logged out and logged back in to refresh your session token
2. Check that the email used in the script matches exactly with the email in your account
3. Verify that the MongoDB connection in the script is pointing to the correct database
4. Check the server logs for any authentication or authorization errors 