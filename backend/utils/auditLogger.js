const supabase = require('../config/supabase');

/**
 * Helper function to record an audit log entry in the audit_log table.
 *
 * @param {Object} params
 * @param {string} params.serviceName - Name of the service/module performing action (e.g., 'member_service')
 * @param {string} params.tableName - Affected table name (e.g., 'members', 'candidates', 'users')
 * @param {string|number} [params.tablePrimaryKeyId] - Affected record primary key ID
 * @param {string} params.eventName - Audit event name ENUM (e.g., 'MEMBER_UPDATED', 'MEMBER_DELETED')
 * @param {string|number} [params.performedBy] - User ID or identity of actor
 * @param {Object|null} [params.oldValue] - Prior record state (null on create)
 * @param {Object|null} [params.newValue] - New record state (null on delete)
 */
async function logAuditEvent({
  serviceName,
  tableName,
  tablePrimaryKeyId = null,
  eventName,
  performedBy = null,
  oldValue = null,
  newValue = null
}) {
  try {
    if (!supabase) return;

    const record = {
      service_name: serviceName,
      table_name: tableName,
      table_primary_key_id: tablePrimaryKeyId !== null && tablePrimaryKeyId !== undefined ? String(tablePrimaryKeyId) : null,
      event_name: eventName,
      performed_by: performedBy !== null && performedBy !== undefined ? String(performedBy) : null,
      old_value: oldValue !== null && oldValue !== undefined ? oldValue : {},
      new_value: newValue || null, // Keep null in case of delete
      event_time: new Date().toISOString()
    };

    const { error } = await supabase
      .from('audit_log')
      .insert(record);

    if (error) {
      console.warn('Audit log write skipped/failed:', error.message || error);
    }
  } catch (err) {
    console.warn('Audit log write exception:', err.message || err);
  }
}

module.exports = {
  logAuditEvent
};
