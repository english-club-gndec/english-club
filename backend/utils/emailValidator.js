const dns = require('dns').promises;

// List of disposable, temporary, and common fake email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'mailinator.com', 'trashmail.com',
  'dispostable.com', 'yopmail.com', 'guerrillamail.com', 'sharklasers.com',
  'getnada.com', 'example.com', 'test.com', 'asdf.com', 'foo.com',
  'maildrop.cc', 'inboxalias.com', 'throwawaymail.com', 'fakeinbox.com',
  'temp-mail.org', 'tempmail.net', 'crazymailing.com', 'bupmail.com'
]);

/**
 * Validates whether an email address format is valid, not from a disposable domain,
 * and has valid DNS MX records (real mail servers configured).
 */
const validateLegitEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email address is required' };
  }

  const emailLower = email.trim().toLowerCase();

  // Basic structure check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailLower)) {
    return { valid: false, reason: 'Please enter a valid email address format' };
  }

  const domain = emailLower.split('@')[1];

  // 1. Check against disposable & fake email domain list
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: `Temporary or disposable email addresses (@${domain}) are not permitted` };
  }

  // 2. Perform DNS MX lookup to ensure domain has real mail receiving servers
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: `Domain @${domain} does not have active mail servers` };
    }
    return { valid: true };
  } catch (err) {
    // If DNS query fails (domain doesn't exist or has no MX records)
    return { valid: false, reason: `Domain @${domain} does not exist or cannot receive emails` };
  }
};

module.exports = {
  validateLegitEmail
};
