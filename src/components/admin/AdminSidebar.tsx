import { LayoutDashboard, Users, DollarSign, BarChart3, Megaphone, MessageSquare, LogOut, CreditCard, Bell, Vote, FileText } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAdminStore } from '@/store/adminStore';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/beneficiaries', icon: Users, label: 'Beneficiaries' },
  { to: '/admin/nin-management', icon: CreditCard, label: 'NIN Management' },
  { to: '/admin/disbursements', icon: DollarSign, label: 'Disbursements' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/polls', icon: Vote, label: 'Polls' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
  { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
];

export function AdminSidebar() {
  const logout = useAdminStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-primary">DPI Admin</h2>
        <p className="text-xs text-muted-foreground mt-1">Government Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
