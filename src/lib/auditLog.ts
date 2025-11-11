export type AuditAction = 
  | 'user_created' 
  | 'user_updated' 
  | 'user_deleted'
  | 'user_status_changed'
  | 'nin_created'
  | 'nin_updated'
  | 'nin_deleted'
  | 'nin_linked'
  | 'disbursement_created'
  | 'disbursement_approved'
  | 'announcement_created'
  | 'announcement_updated'
  | 'announcement_deleted'
  | 'poll_created'
  | 'poll_updated'
  | 'poll_deleted'
  | 'feedback_updated'
  | 'admin_login'
  | 'admin_logout'
  | 'bulk_import'
  | 'bulk_status_update'
  | 'export_data';

export interface AuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  status: 'success' | 'failed';
  metadata?: Record<string, any>;
}

class AuditLogger {
  private logs: AuditLog[] = [];

  log(
    action: AuditAction,
    resource: string,
    details: string,
    adminId: string,
    adminName: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ) {
    const log: AuditLog = {
      id: `LOG${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      adminId,
      adminName,
      action,
      resource,
      resourceId,
      details,
      ipAddress: '192.168.1.1', // Mock IP
      status: 'success',
      metadata,
    };

    this.logs.unshift(log);
    
    // Store in localStorage
    const storedLogs = this.getLogs();
    storedLogs.unshift(log);
    localStorage.setItem('audit_logs', JSON.stringify(storedLogs.slice(0, 1000))); // Keep last 1000
    
    console.log('Audit Log:', log);
  }

  getLogs(): AuditLog[] {
    const stored = localStorage.getItem('audit_logs');
    return stored ? JSON.parse(stored) : [];
  }

  clearLogs() {
    localStorage.removeItem('audit_logs');
    this.logs = [];
  }

  getLogsByAction(action: AuditAction): AuditLog[] {
    return this.getLogs().filter(log => log.action === action);
  }

  getLogsByAdmin(adminId: string): AuditLog[] {
    return this.getLogs().filter(log => log.adminId === adminId);
  }

  getLogsByDateRange(startDate: string, endDate: string): AuditLog[] {
    return this.getLogs().filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  }
}

export const auditLogger = new AuditLogger();
