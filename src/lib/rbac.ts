// Role-Based Access Control System
// NOTE: This is a mock implementation. In production, roles should be validated server-side.

export type AdminRole = 'super_admin' | 'moderator' | 'viewer';

export interface Permission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  bulkOperations: boolean;
}

export interface RolePermissions {
  beneficiaries: Permission;
  disbursements: Permission;
  polls: Permission;
  nin: Permission;
  feedback: Permission;
  announcements: Permission;
  notifications: Permission;
  analytics: Permission;
  auditLogs: Permission;
  settings: Permission;
}

// Permission definitions for each role
const rolePermissions: Record<AdminRole, RolePermissions> = {
  super_admin: {
    beneficiaries: { read: true, create: true, update: true, delete: true, export: true, bulkOperations: true },
    disbursements: { read: true, create: true, update: true, delete: true, export: true, bulkOperations: true },
    polls: { read: true, create: true, update: true, delete: true, export: true, bulkOperations: true },
    nin: { read: true, create: true, update: true, delete: true, export: true, bulkOperations: true },
    feedback: { read: true, create: true, update: true, delete: true, export: true, bulkOperations: true },
    announcements: { read: true, create: true, update: true, delete: true, export: true, bulkOperations: true },
    notifications: { read: true, create: true, update: true, delete: true, export: true, bulkOperations: true },
    analytics: { read: true, create: false, update: false, delete: false, export: true, bulkOperations: false },
    auditLogs: { read: true, create: false, update: false, delete: false, export: true, bulkOperations: false },
    settings: { read: true, create: true, update: true, delete: true, export: false, bulkOperations: false },
  },
  moderator: {
    beneficiaries: { read: true, create: true, update: true, delete: false, export: true, bulkOperations: false },
    disbursements: { read: true, create: true, update: true, delete: false, export: true, bulkOperations: false },
    polls: { read: true, create: true, update: true, delete: false, export: true, bulkOperations: false },
    nin: { read: true, create: true, update: true, delete: false, export: true, bulkOperations: false },
    feedback: { read: true, create: false, update: true, delete: false, export: true, bulkOperations: false },
    announcements: { read: true, create: true, update: true, delete: false, export: true, bulkOperations: false },
    notifications: { read: true, create: true, update: false, delete: false, export: false, bulkOperations: false },
    analytics: { read: true, create: false, update: false, delete: false, export: true, bulkOperations: false },
    auditLogs: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    settings: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
  },
  viewer: {
    beneficiaries: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    disbursements: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    polls: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    nin: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    feedback: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    announcements: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    notifications: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    analytics: { read: true, create: false, update: false, delete: false, export: false, bulkOperations: false },
    auditLogs: { read: false, create: false, update: false, delete: false, export: false, bulkOperations: false },
    settings: { read: false, create: false, update: false, delete: false, export: false, bulkOperations: false },
  },
};

export function getPermissions(role: AdminRole): RolePermissions {
  return rolePermissions[role];
}

export function hasPermission(
  role: AdminRole,
  resource: keyof RolePermissions,
  action: keyof Permission
): boolean {
  return rolePermissions[role]?.[resource]?.[action] ?? false;
}

export function getRoleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    super_admin: 'Super Admin',
    moderator: 'Moderator',
    viewer: 'Viewer',
  };
  return labels[role];
}

export function getRoleColor(role: AdminRole): string {
  const colors: Record<AdminRole, string> = {
    super_admin: 'bg-destructive/10 text-destructive',
    moderator: 'bg-primary/10 text-primary',
    viewer: 'bg-muted text-muted-foreground',
  };
  return colors[role];
}
