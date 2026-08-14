const nodemailer = require('nodemailer');

/**
 * Creates nodemailer transporter based on env variables or fallback.
 */
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback for development / mock sending when SMTP credentials are not configured
  return {
    sendMail: async (mailOptions) => {
      console.log('====================================================');
      console.log('📧 [MOCK EMAIL SENT - SMTP credentials not set]');
      console.log(`From: ${mailOptions.from}`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      const linkMatch = mailOptions.html.match(/href="([^"]+)"/);
      if (linkMatch) {
        console.log(`Edit URL Link: ${linkMatch[1]}`);
      }
      console.log('====================================================');
      return { messageId: 'mock-email-' + Date.now() };
    }
  };
};

/**
 * Sends a creative and artistic yet professional email requesting changes for a submission.
 */
const sendRequestChangesEmail = async ({ toEmail, studentName, title, feedback, submissionId, editToken }) => {
  const transporter = createTransporter();
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const editLink = `${baseUrl}/edit-submission/${submissionId}/${editToken}`;
  const senderEmail = process.env.EMAIL_USER;

  const mailOptions = {
    from: `"English Club GNDEC" <${senderEmail}>`,
    to: toEmail,
    subject: `✨ English Club GNDEC: Revisions Requested for "${title}"`,
    text: `Hello ${studentName},\n\nThank you for contributing your piece "${title}" to English Club GNDEC.\n\nOur editorial team reviewed your submission and requested the following changes before publication:\n\n"${feedback || 'Please review and update your article.'}"\n\nYou can edit your submission here:\n${editLink}\n\nWarm regards,\nEnglish Club GNDEC Team`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Revisions Requested - English Club GNDEC</title>
      <style>
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #1e293b;
        }
        .container {
          max-width: 620px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: #1e1b4b;
          background-image: linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #4c1d95 100%);
          padding: 40px 30px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-family: 'Poppins', 'Helvetica Neue', sans-serif;
          letter-spacing: 0.5px;
          font-weight: 700;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #e9d5ff;
          font-style: italic;
        }
        .content {
          padding: 36px 32px;
          line-height: 1.7;
          font-size: 16px;
        }
        .quote-box {
          background: #fcf5ff;
          border-left: 4px solid #8b5cf6;
          border-radius: 8px;
          padding: 20px 24px;
          margin: 24px 0;
        }
        .quote-title {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #7c3aed;
          margin-bottom: 8px;
        }
        .quote-text {
          font-style: italic;
          color: #4c1d95;
          margin: 0;
          font-size: 15px;
        }
        .btn-wrapper {
          text-align: center;
          margin: 36px 0 24px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 30px;
          font-family: 'Helvetica Neue', sans-serif;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.35);
        }
        .footer {
          background: #f1f5f9;
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          font-family: 'Helvetica Neue', sans-serif;
          border-top: 1px solid #e2e8f0;
        }
        .link-text {
          word-break: break-all;
          color: #6d28d9;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>English Club GNDEC</h1>
          <p>Where Words Create Worlds ✨</p>
        </div>
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Thank you for submitting your piece, <strong>"${title}"</strong>. Our editorial committee reviewed your work with great appreciation for your effort and creativity.</p>
          <p>To ensure your publication reaches its full potential, our editors suggest a few updates:</p>

          <div class="quote-box">
            <div class="quote-title">Editorial Feedback</div>
            <p class="quote-text">"${feedback || 'Please review your article content and make the requested updates.'}"</p>
          </div>

          <p>You can refine your manuscript and resubmit it directly using your personal edit link below:</p>

          <div class="btn-wrapper">
            <a href="${editLink}" class="btn" target="_blank">Revise Your Article</a>
          </div>

          <p style="font-size: 13px; color: #64748b; text-align: center;">
            Or copy and paste this URL into your browser:<br>
            <a href="${editLink}" class="link-text">${editLink}</a>
          </p>
        </div>
        <div class="footer">
          <p style="margin:0 0 6px 0;"><strong>English Club • Guru Nanak Dev Engineering College</strong></p>
          <p style="margin:0;">Contact us at <a href="mailto:${senderEmail}" style="color:#6d28d9; text-decoration:none;">${senderEmail}</a></p>
        </div>
      </div>
    </body>
    </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (err) {
    console.error('Failed to send email:', err);
    // Don't crash if mail sending fails in environment without SMTP
    return null;
  }
};

/**
 * Sends a creative and artistic yet professional rejection email for a submission.
 */
const sendRejectionEmail = async ({ toEmail, studentName, title, rejectionReason, isAutoRejected = false }) => {
  const transporter = createTransporter();
  const senderEmail = process.env.EMAIL_USER;

  const defaultReason = isAutoRejected
    ? "Automatically closed: No response or revisions were submitted within the 7-day window following the change request."
    : "Thank you for your submission. After careful evaluation by our editorial board, we have decided not to proceed with publication for this piece at this time.";

  const reasonText = rejectionReason || defaultReason;

  const mailOptions = {
    from: `"English Club GNDEC" <${senderEmail}>`,
    to: toEmail,
    subject: `Update on your submission: "${title}" - English Club GNDEC`,
    text: `Dear ${studentName},\n\nThank you for submitting your piece "${title}" to English Club GNDEC.\n\nAfter reviewing your submission, we regret to inform you that it has been marked as rejected.\n\nReason / Feedback:\n"${reasonText}"\n\nWe deeply value your literary enthusiasm and encourage you to submit new works for future publications.\n\nWarm regards,\nEnglish Club GNDEC Team`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Submission Status Update - English Club GNDEC</title>
      <style>
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #1e293b;
        }
        .container {
          max-width: 620px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: #1e1b4b;
          background-image: linear-gradient(135deg, #1e1b4b 0%, #450a0a 50%, #7f1d1d 100%);
          padding: 40px 30px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-family: 'Poppins', 'Helvetica Neue', sans-serif;
          letter-spacing: 0.5px;
          font-weight: 700;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #fecdd3;
          font-style: italic;
        }
        .content {
          padding: 36px 32px;
          line-height: 1.7;
          font-size: 16px;
        }
        .quote-box {
          background: #fff1f2;
          border-left: 4px solid #f43f5e;
          border-radius: 8px;
          padding: 20px 24px;
          margin: 24px 0;
        }
        .quote-title {
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #e11d48;
          margin-bottom: 8px;
        }
        .quote-text {
          font-style: italic;
          color: #9f1239;
          margin: 0;
          font-size: 15px;
        }
        .footer {
          background: #f1f5f9;
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          font-family: 'Helvetica Neue', sans-serif;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>English Club GNDEC</h1>
          <p>Where Words Create Worlds ✨</p>
        </div>
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Thank you for submitting your creative piece, <strong>"${title}"</strong>. We truly appreciate the time, passion, and effort you poured into your manuscript.</p>
          <p>Our editorial committee has completed the review process. Regrettably, this submission will not be moving forward for publication at this time.</p>

          <div class="quote-box">
            <div class="quote-title">Editorial Note / Reason</div>
            <p class="quote-text">"${reasonText}"</p>
          </div>

          <p>Every piece of writing is a stepping stone. We warmly encourage you to continue honing your craft and submit your future original articles to English Club GNDEC!</p>
        </div>
        <div class="footer">
          <p style="margin:0 0 6px 0;"><strong>English Club • Guru Nanak Dev Engineering College</strong></p>
          <p style="margin:0;">Contact us at <a href="mailto:${senderEmail}" style="color:#e11d48; text-decoration:none;">${senderEmail}</a></p>
        </div>
      </div>
    </body>
    </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully:', info.messageId);
    return info;
  } catch (err) {
    console.error('Failed to send rejection email:', err);
    return null;
  }
};

module.exports = {
  sendRequestChangesEmail,
  sendRejectionEmail,
};
