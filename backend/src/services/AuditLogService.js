const BaseService = require('./BaseService');
const AuditLog = require('../models/AuditLog');

class AuditLogService extends BaseService {
    constructor() {
        super('AuditLogService');
    }

    /**
     * @desc Record an activity
     */
    async log({ userId, action, target, targetId, oldData, newData, req, severity = 'INFO' }) {
        try {
            const auditData = {
                userId,
                action,
                target,
                targetId,
                oldData,
                newData,
                severity,
                ipAddress: req ? req.ip || req.headers['x-forwarded-for'] : 'SYSTEM',
                userAgent: req ? req.headers['user-agent'] : 'SYSTEM'
            };

            const logEntry = await AuditLog.create(auditData);
            this.logSuccess('Audit Recorded', { action, logId: logEntry._id });
            return logEntry;
        } catch (error) {
            console.error(`[AUDIT_FAIL] Failed to log action ${action}: ${error.message}`);
            // We don't throw here to prevent blocking main business logic if audit fails
        }
    }
}

module.exports = new AuditLogService();
