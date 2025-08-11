// Email service utility for password reset functionality
// In a production environment, you would use a service like SendGrid, Mailgun, or AWS SES

const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    // For development, we'll just log the email content
    // In production, replace this with actual email sending logic
    
    const emailContent = {
      to: email,
      subject: 'GradePro - Password Reset Request',
      html: generatePasswordResetHTML(resetUrl),
      text: generatePasswordResetText(resetUrl)
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== PASSWORD RESET EMAIL ===');
      console.log('To:', emailContent.to);
      console.log('Subject:', emailContent.subject);
      console.log('Reset URL:', resetUrl);
      console.log('=============================\n');
      
      // In development, we'll return success
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    // TODO: Implement actual email sending for production
    // Example with nodemailer:
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const result = await transporter.sendMail(emailContent);
    return { success: true, messageId: result.messageId };
    */

    // For now, simulate success
    return { success: true, messageId: 'simulated-' + Date.now() };

  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send password reset email');
  }
};

const generatePasswordResetHTML = (resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - GradePro</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p>GradePro Academic System</p>
        </div>
        
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your GradePro account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important Security Information:</strong>
            <ul>
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
              <li>Contact support if you have concerns</li>
            </ul>
          </div>
          
          <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
          
          <p>Best regards,<br>The GradePro Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent from GradePro Academic Grading System</p>
          <p>If you have questions, contact us at support@gradepro.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePasswordResetText = (resetUrl) => {
  return `
Password Reset Request - GradePro

Hello,

We received a request to reset your password for your GradePro account.

To reset your password, please visit the following link:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

For security reasons:
- Never share this link with anyone
- The link will expire after 1 hour
- Contact support if you have any concerns

Best regards,
The GradePro Team

---
This email was sent from GradePro Academic Grading System
If you have questions, contact us at support@gradepro.com
  `;
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const emailContent = {
      to: email,
      subject: 'Welcome to GradePro!',
      html: generateWelcomeHTML(name),
      text: generateWelcomeText(name)
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== WELCOME EMAIL ===');
      console.log('To:', emailContent.to);
      console.log('Subject:', emailContent.subject);
      console.log('===================\n');
      
      return { success: true, messageId: 'dev-welcome-' + Date.now() };
    }

    // TODO: Implement actual email sending for production
    return { success: true, messageId: 'simulated-welcome-' + Date.now() };

  } catch (error) {
    console.error('Welcome email sending error:', error);
    throw new Error('Failed to send welcome email');
  }
};

const generateWelcomeHTML = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to GradePro</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to GradePro!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Welcome to GradePro, your comprehensive academic grading and evaluation system.</p>
          <p>You can now log in and start using all the features available for your role.</p>
          <p>If you have any questions, don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The GradePro Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateWelcomeText = (name) => {
  return `
Welcome to GradePro!

Hello ${name}!

Welcome to GradePro, your comprehensive academic grading and evaluation system.

You can now log in and start using all the features available for your role.

If you have any questions, don't hesitate to contact our support team.

Best regards,
The GradePro Team
  `;
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
