import { Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/store/adminStore';
import { useState, useEffect } from 'react';

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

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {admin?.fullName}</h1>
        <p className="text-xs text-muted-foreground">{admin?.role}</p>
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
