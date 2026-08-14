const supabase = require('../config/supabase');
const { sendRejectionEmail } = require('./emailService');

/**
 * Checks for submissions in 'REQUESTED_CHANGE' status that have not been updated for over 7 days,
 * automatically rejects them with an auto-rejection reason, and sends out a rejection email.
 */
const checkAndAutoRejectStaleSubmissions = async () => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Select submissions with status REQUESTED_CHANGE updated before 7 days ago
    const { data: staleSubmissions, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('status', 'REQUESTED_CHANGE')
      .lt('updated_at', oneWeekAgo);

    if (error) {
      console.error('Error querying stale submissions:', error);
      return;
    }

    if (!staleSubmissions || staleSubmissions.length === 0) {
      return;
    }

    console.log(`[Auto-Reject Scheduler] Found ${staleSubmissions.length} submission(s) exceeding 7 days in REQUESTED_CHANGE.`);

    const autoRejectionReason = "Automatically closed: No response or revisions were submitted within the 7-day window following the change request.";

    for (const submission of staleSubmissions) {
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'REJECTED',
          rejection_reason: autoRejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('submission_id', submission.submission_id);

      if (updateError) {
        console.error(`Failed to auto-reject submission ${submission.submission_id}:`, updateError);
        continue;
      }

      console.log(`[Auto-Reject Scheduler] Submission "${submission.title}" (${submission.submission_id}) auto-rejected.`);

      // Send rejection email
      sendRejectionEmail({
        toEmail: submission.student_email,
        studentName: submission.student_name,
        title: submission.title,
        rejectionReason: autoRejectionReason,
        isAutoRejected: true
      }).catch(err => {
        console.error('Error sending auto-rejection email:', err);
      });
    }
  } catch (err) {
    console.error('checkAndAutoRejectStaleSubmissions unexpected error:', err);
  }
};

/**
 * Starts the periodic auto-rejection scheduler.
 * Runs an immediate check, then repeats every hour.
 */
const startAutoRejectScheduler = () => {
  console.log('[Auto-Reject Scheduler] Service initialized.');
  checkAndAutoRejectStaleSubmissions();
  const ONE_HOUR_MS = 60 * 60 * 1000;
  setInterval(checkAndAutoRejectStaleSubmissions, ONE_HOUR_MS);
};

module.exports = {
  checkAndAutoRejectStaleSubmissions,
  startAutoRejectScheduler
};
