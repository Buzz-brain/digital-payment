import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Search, Filter, Calendar } from 'lucide-react';
import { auditLogger, AuditLog } from '@/lib/auditLog';
import { exportToCSV, exportToPDF, formatDateTime } from '@/lib/exportUtils';
import { motion } from 'framer-motion';

const actionLabels: Record<string, string> = {
  user_created: 'User Created',
  user_updated: 'User Updated',
  user_deleted: 'User Deleted',
  user_status_changed: 'Status Changed',
  nin_created: 'NIN Created',
  nin_updated: 'NIN Updated',
  nin_deleted: 'NIN Deleted',
  nin_linked: 'NIN Linked',
  disbursement_created: 'Disbursement Created',
  disbursement_approved: 'Disbursement Approved',
  announcement_created: 'Announcement Created',
  announcement_updated: 'Announcement Updated',
  announcement_deleted: 'Announcement Deleted',
  poll_created: 'Poll Created',
  poll_updated: 'Poll Updated',
  poll_deleted: 'Poll Deleted',
  feedback_updated: 'Feedback Updated',
  admin_login: 'Admin Login',
  admin_logout: 'Admin Logout',
  bulk_import: 'Bulk Import',
  bulk_status_update: 'Bulk Status Update',
  export_data: 'Data Export',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    setLogs(auditLogger.getLogs());
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    const matchesDate = (!dateFrom || new Date(log.timestamp) >= new Date(dateFrom)) &&
                        (!dateTo || new Date(log.timestamp) <= new Date(dateTo));
    
    return matchesSearch && matchesAction && matchesStatus && matchesDate;
  });

  const handleExportCSV = () => {
    exportToCSV(
      filteredLogs,
      `audit_logs_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'Timestamp', key: 'timestamp' },
        { header: 'Admin', key: 'adminName' },
        { header: 'Action', key: 'action' },
        { header: 'Resource', key: 'resource' },
        { header: 'Details', key: 'details' },
        { header: 'Status', key: 'status' },
        { header: 'IP Address', key: 'ipAddress' },
      ]
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredLogs.map(log => ({
        ...log,
        timestamp: formatDateTime(log.timestamp),
      })),
      `audit_logs_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'Timestamp', key: 'timestamp', width: 35 },
        { header: 'Admin', key: 'adminName', width: 30 },
        { header: 'Action', key: 'action', width: 35 },
        { header: 'Details', key: 'details', width: 60 },
        { header: 'Status', key: 'status', width: 20 },
      ],
      'Audit Logs Report',
      `Generated on ${new Date().toLocaleDateString()}`
    );
  };

  const getActionColor = (action: string) => {
    if (action.includes('deleted')) return 'text-destructive';
    if (action.includes('created')) return 'text-green-600 dark:text-green-400';
    if (action.includes('updated')) return 'text-blue-600 dark:text-blue-400';
    return 'text-foreground';
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Audit Logs</h1>
                <p className="text-muted-foreground">Track all admin actions and system events</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {Object.entries(actionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-1/2"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-1/2"
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {filteredLogs.length} of {logs.length} logs
                </div>
              </div>
            </Card>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Timestamp</th>
                      <th className="text-left p-4 font-medium">Admin</th>
                      <th className="text-left p-4 font-medium">Action</th>
                      <th className="text-left p-4 font-medium">Resource</th>
                      <th className="text-left p-4 font-medium">Details</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-4 text-sm">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="p-4 text-sm font-medium">{log.adminName}</td>
                        <td className={`p-4 text-sm font-medium ${getActionColor(log.action)}`}>
                          {actionLabels[log.action] || log.action}
                        </td>
                        <td className="p-4 text-sm">{log.resource}</td>
                        <td className="p-4 text-sm text-muted-foreground">{log.details}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === 'success' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{log.ipAddress}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
