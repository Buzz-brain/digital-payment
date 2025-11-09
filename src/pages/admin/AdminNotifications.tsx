import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockAdminNotifications, AdminNotification } from '@/data/mockAdminData';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(mockAdminNotifications);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast({
      title: 'All Marked as Read',
      description: 'All notifications have been marked as read',
    });
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast({
      title: 'Notification Deleted',
      description: 'The notification has been removed',
    });
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    handleMarkAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      case 'warning':
        return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'success':
        return 'bg-success/10 text-success hover:bg-success/20';
      default:
        return 'bg-primary/10 text-primary hover:bg-primary/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Bell className="w-8 h-8 text-primary" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      {unreadCount}
                    </Badge>
                  )}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Stay updated with system alerts and important events
                </p>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All as Read
                </Button>
              )}
            </div>

            {notifications.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Notifications
                  </h3>
                  <p className="text-muted-foreground">
                    You're all caught up! No new notifications at the moment.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.read ? 'border-primary/50 bg-primary/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className={`font-semibold ${
                                !notification.read ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {notification.title}
                              </h3>
                              <Badge className={getTypeColor(notification.type)}>
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.date).toLocaleString()}
                              </span>
                              <div className="flex gap-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                  >
                                    <CheckCheck className="w-4 h-4 mr-1" />
                                    Mark as Read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
