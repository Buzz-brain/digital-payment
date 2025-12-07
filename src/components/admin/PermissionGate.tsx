import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { RolePermissions, Permission } from '@/lib/rbac';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PermissionGateProps {
  resource: keyof RolePermissions;
  action: keyof Permission;
  children: ReactNode;
  fallback?: ReactNode;
  showLock?: boolean;
}

export function PermissionGate({
  resource,
  action,
  children,
  fallback,
  showLock = false,
}: PermissionGateProps) {
  const { can } = usePermissions();

  if (can(resource, action)) {
    return <>{children}</>;
  }

  if (showLock) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1 text-muted-foreground cursor-not-allowed opacity-50">
              <Lock className="h-3 w-3" />
              <span className="text-xs">Restricted</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>You don't have permission to {action} {resource}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return fallback ? <>{fallback}</> : null;
}
