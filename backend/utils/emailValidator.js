const dns = require('dns').promises;

// List of disposable, temporary, and common fake email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'mailinator.com', 'trashmail.com',
  'dispostable.com', 'yopmail.com', 'guerrillamail.com', 'sharklasers.com',
  'getnada.com', 'example.com', 'test.com', 'asdf.com', 'foo.com',
  'maildrop.cc', 'inboxalias.com', 'throwawaymail.com', 'fakeinbox.com',
  'temp-mail.org', 'tempmail.net', 'crazymailing.com', 'bupmail.com',
  'kjbkub.com', 'testtest.com', 'fake.com', 'sample.com'
]);

// Common gibberish / keyboard smash patterns for email usernames
const GIBBERISH_PATTERNS = [
  /^[a-z]\1{3,}/i, // Single letter repeated 4+ times (e.g. aaaa, zzzz)
  /^(asdf|qwerty|zxcvbn|1234|0000|test|fake|junk|dummy|jkbk)/i, // Keyboard smash prefixes
  /(asdf|qwerty|zxcvbn|jkbk){2,}/i, // Repeated smash patterns (e.g. jkbkjb, asdfasdf)
];

/**
 * Validates whether an email address format is valid, not from a disposable domain or gibberish username,
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
    return { valid: false, reason: 'Please enter a valid email address format (e.g. name@example.com)' };
  }

  const [username, domain] = emailLower.split('@');

  // Username length check
  if (username.length < 3) {
    return { valid: false, reason: 'Email username must be at least 3 characters long' };
  }

  // Check gibberish / keyboard smash patterns in username
  for (const pattern of GIBBERISH_PATTERNS) {
    if (pattern.test(username)) {
      return { valid: false, reason: 'Please enter a legitimate email address instead of test or gibberish characters' };
    }
  }

  // 1. Check against disposable & fake email domain list
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: `Temporary, fake, or disposable email domains (@${domain}) are not permitted` };
  }

  // 2. Perform DNS MX lookup with a 3.5s timeout to ensure domain has real mail receiving servers
  try {
    const mxLookup = dns.resolveMx(domain);
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 3500)
    );

    const mxRecords = await Promise.race([mxLookup, timeout]);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: `Domain @${domain} does not have active mail servers` };
    }
    return { valid: true };
  } catch (err) {
    if (err.message === 'TIMEOUT') {
      return { valid: false, reason: `Email domain @${domain} took too long to respond or is unroutable` };
    }
    // If DNS query fails (domain doesn't exist, e.g. ENOTFOUND for kjbkub.com)
    return { valid: false, reason: `Domain @${domain} does not exist or cannot receive emails` };
  }
};

module.exports = {
  validateLegitEmail
};
