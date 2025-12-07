import { Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/store/adminStore';
import { useState, useEffect } from 'react';
import { getRoleLabel, getRoleColor, AdminRole } from '@/lib/rbac';

export function AdminNavbar() {
  const admin = useAdminStore((state) => state.admin);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  const roleColor = admin?.role ? getRoleColor(admin.role as AdminRole) : '';
  const roleLabel = admin?.role ? getRoleLabel(admin.role as AdminRole) : '';

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold">Welcome, {admin?.fullName}</h1>
        </div>
        <Badge className={roleColor}>{roleLabel}</Badge>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
