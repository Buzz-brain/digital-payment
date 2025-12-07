import { useAdminStore } from '@/store/adminStore';
import { hasPermission, getPermissions, AdminRole, RolePermissions, Permission } from '@/lib/rbac';

export function usePermissions() {
  const { admin } = useAdminStore();
  const role = (admin?.role as AdminRole) || 'viewer';

  const can = (resource: keyof RolePermissions, action: keyof Permission): boolean => {
    return hasPermission(role, resource, action);
  };

  const permissions = getPermissions(role);

  return {
    role,
    can,
    permissions,
    isSuper: role === 'super_admin',
    isModerator: role === 'moderator',
    isViewer: role === 'viewer',
  };
}
