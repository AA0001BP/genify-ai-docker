'use server';

/**
 * Email verification template
 * @param name User's name
 * @param verificationLink Link to verify the email
 * @returns HTML email template
 */
export async function getVerificationEmailTemplate(name: string, verificationLink: string): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Verify Your Email</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background-color: #f3f4f6;
          text-align: center;
          padding: 30px 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: 700;
          color: #4f46e5;
          display: inline-flex;
          align-items: center;
          margin: 0 auto;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-text {
          font-size: 22px;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 20px;
          color: #111827;
        }
        .description {
          color: #4b5563;
          font-size: 16px;
          margin-bottom: 30px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15);
          transition: all 0.2s ease;
        }
        .button:hover {
          background-color: #4338ca;
          box-shadow: 0 6px 10px rgba(79, 70, 229, 0.2);
        }
        .note {
          font-size: 14px;
          color: #6b7280;
          margin: 30px 0;
        }
        .verification-link {
          word-break: break-all;
          font-size: 14px;
          background-color: #f3f4f6;
          padding: 12px;
          border-radius: 6px;
          color: #6b7280;
          margin: 20px 0;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 30px 0;
        }
        .signature {
          margin-top: 30px;
          color: #4b5563;
        }
        .footer {
          background-color: #f3f4f6;
          text-align: center;
          padding: 20px;
          font-size: 14px;
          color: #6b7280;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-link {
          display: inline-block;
          margin: 0 8px;
          width: 32px;
          height: 32px;
          background-color: #e5e7eb;
          border-radius: 50%;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            Genify
          </div>
        </div>
        
        <div class="content">
          <h1 class="welcome-text">Welcome to Genify, ${name}!</h1>
          
          <p class="description">Thank you for joining our community. To get started with all the amazing features we offer, please verify your email address.</p>
          
          <div class="button-container">
            <a href="${verificationLink}" class="button">Verify My Email</a>
          </div>
          
          <p class="note">This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
          
          <div class="verification-link">
            ${verificationLink}
          </div>
          
          <p class="note">If the button above doesn't work, you can copy and paste the URL into your web browser.</p>
          
          <div class="divider"></div>
          
          <div class="signature">
            <p>We're excited to have you onboard!</p>
            <p>The Genify Team</p>
          </div>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="#" class="social-link"></a>
            <a href="#" class="social-link"></a>
            <a href="#" class="social-link"></a>
          </div>
          <p>&copy; ${new Date().getFullYear()} Genify. All rights reserved.</p>
          <p>Your privacy is important to us. View our <a href="#" style="color: #4f46e5; text-decoration: none;">Privacy Policy</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 