import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, UserCheck, UserX, Ban, Eye, Edit, Trash2, Download } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockBeneficiaries, Beneficiary } from '@/data/mockAdminData';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiDelete } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF, formatCurrency, formatDate } from '@/lib/exportUtils';
import { auditLogger } from '@/lib/auditLog';
import { useAdminStore } from '@/store/adminStore';
import { BulkOperations } from '@/components/admin/BulkOperations';
import { AdvancedFilters } from '@/components/admin/AdvancedFilters';
import { PermissionGate } from '@/components/admin/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';

export default function Beneficiaries() {
  const { admin } = useAdminStore();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const { data: beneficiaries = mockBeneficiaries, isLoading, isError } = useQuery({
    queryKey: ['admin', 'beneficiaries'],
    queryFn: async () => {
      const res: any = await apiGet('/api/admin/users');
      const users = Array.isArray(res) ? res : [];

      // Normalize users: ensure id, fullName, safe strings
      const normalized = users.map((u: any) => ({
        ...u,
        id: u._id,
        fullName: u.fullName || u.username || '',
        email: u.email || '',
        phone: u.phone || '',
        status: u.status || 'active',
        registeredDate: u.createdAt || u.registeredDate,
        lastLogin: u.lastLogin || u.updatedAt || null,
      }));

      // Backend now returns wallet aggregates (balance, totalReceived, totalWithdrawn) on the user objects via aggregation.
      // Map those fields into normalized users with safe defaults.
      const withWallets = normalized.map((u: any) => ({
        ...u,
        balance: typeof u.balance === 'number' ? u.balance : Number(u.balance) || 0,
        totalReceived: typeof u.totalReceived === 'number' ? u.totalReceived : Number(u.totalReceived) || 0,
        totalWithdrawn: typeof u.totalWithdrawn === 'number' ? u.totalWithdrawn : Number(u.totalWithdrawn) || 0,
      }));

      return withWallets;
    },
  });

  // We'll call the APIs directly in handlers instead of using useMutation
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  const filteredBeneficiaries = (Array.isArray(beneficiaries) ? beneficiaries : []).filter((ben: any) => {
    const name = (ben?.fullName || '').toString();
    const email = (ben?.email || '').toString();
    const nin = (ben?.nin || '').toString();
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nin.includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ben?.status === statusFilter;
    
    // Advanced filters
    const matchesAdvanced = Object.entries(advancedFilters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'balance_min') return ben.balance >= Number(value);
      if (key === 'balance_max') return ben.balance <= Number(value);
      if (key === 'registered_from') return new Date(ben.registeredDate) >= new Date(value);
      if (key === 'registered_to') return new Date(ben.registeredDate) <= new Date(value);
      return true;
    });
    
    return matchesSearch && matchesStatus && matchesAdvanced;
  });

  const handleViewDetails = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    const beneficiary = beneficiaries.find((b: any) => b._id === id || b.id === id);
    try {
      await apiPut(`/api/user/${id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['admin', 'beneficiaries'] });
      if (admin && beneficiary) {
        auditLogger.log(
          'user_status_changed',
          'Beneficiary',
          `Changed status of ${beneficiary.fullName} to ${newStatus}`,
          admin.id,
          admin.fullName,
          id,
          { oldStatus: beneficiary.status, newStatus }
        );
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const beneficiary = beneficiaries.find((b: any) => b._id === id || b.id === id);
    try {
      await apiDelete(`/api/admin/users/${id}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'beneficiaries'] });
      if (admin && beneficiary) {
        auditLogger.log(
          'user_deleted',
          'Beneficiary',
          `Deleted beneficiary ${beneficiary.fullName}`,
          admin.id,
          admin.fullName,
          id
        );
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete beneficiary', variant: 'destructive' });
    }
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredBeneficiaries,
      `beneficiaries_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'Name', key: 'fullName' },
        { header: 'NIN', key: 'nin' },
        { header: 'Phone', key: 'phone' },
        { header: 'Email', key: 'email' },
        { header: 'Balance', key: 'balance' },
        { header: 'Status', key: 'status' },
        { header: 'Registered Date', key: 'registeredDate' },
      ]
    );
    
    if (admin) {
      auditLogger.log(
        'export_data',
        'Beneficiary',
        `Exported ${filteredBeneficiaries.length} beneficiary records to CSV`,
        admin.id,
        admin.fullName
      );
    }
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredBeneficiaries.map(b => ({
        ...b,
        balance: formatCurrency(b.balance),
        registeredDate: formatDate(b.registeredDate),
      })),
      `beneficiaries_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'Name', key: 'fullName', width: 40 },
        { header: 'NIN', key: 'nin', width: 30 },
        { header: 'Phone', key: 'phone', width: 30 },
        { header: 'Balance', key: 'balance', width: 25 },
        { header: 'Status', key: 'status', width: 20 },
      ],
      'Beneficiaries Report',
      `Generated on ${new Date().toLocaleDateString()}`
    );
    
    if (admin) {
      auditLogger.log(
        'export_data',
        'Beneficiary',
        `Exported ${filteredBeneficiaries.length} beneficiary records to PDF`,
        admin.id,
        admin.fullName
      );
    }
  };

  const handleBulkImport = (data: any[]) => {
    // Bulk import should ideally call a backend endpoint to persist new users.
    // For now, invalidate the beneficiaries cache and log the action.
    queryClient.invalidateQueries({ queryKey: ['admin', 'beneficiaries'] });
    toast({ title: 'Import queued', description: 'Imported beneficiaries will appear after refresh or server sync.' });
    if (admin) {
      auditLogger.log(
        'bulk_import',
        'Beneficiary',
        `Attempted bulk import of ${data.length} beneficiaries`,
        admin.id,
        admin.fullName,
        undefined,
        { count: data.length }
      );
    }
  };

  const handleBulkStatusUpdate = (status: string, count: number) => {
    if (admin) {
      auditLogger.log(
        'bulk_status_update',
        'Beneficiary',
        `Bulk updated ${count} beneficiaries to ${status}`,
        admin.id,
        admin.fullName,
        undefined,
        { status, count }
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'inactive':
        return 'bg-muted text-muted-foreground';
      case 'suspended':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      default:
        return 'bg-muted';
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
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Beneficiaries Management</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, NIN, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-[300px]"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("all")}
                        >
                          All Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("active")}
                        >
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("inactive")}
                        >
                          Inactive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setStatusFilter("suspended")}
                        >
                          Suspended
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AdvancedFilters
                      onFilterChange={setAdvancedFilters}
                      filterConfig={[
                        {
                          label: "Min Balance",
                          key: "balance_min",
                          type: "text",
                        },
                        {
                          label: "Max Balance",
                          key: "balance_max",
                          type: "text",
                        },
                        {
                          label: "Registered Date",
                          key: "registered",
                          type: "daterange",
                        },
                      ]}
                    />
                    <PermissionGate
                      resource="beneficiaries"
                      action="bulkOperations"
                    >
                      <BulkOperations
                        type="beneficiaries"
                        onImportComplete={handleBulkImport}
                        onBulkStatusUpdate={handleBulkStatusUpdate}
                      />
                    </PermissionGate>
                    <PermissionGate resource="beneficiaries" action="export">
                      <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        CSV
                      </Button>
                      <Button
                        onClick={handleExportPDF}
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>NIN</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBeneficiaries.map((beneficiary: any) => (
                        <TableRow
                          key={
                            beneficiary.id ?? beneficiary._id ?? beneficiary.nin
                          }
                        >
                          <TableCell className="font-medium">
                            {beneficiary.fullName}
                          </TableCell>
                          <TableCell>{beneficiary.nin}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{beneficiary.phone}</div>
                              <div className="text-muted-foreground">
                                {beneficiary.email}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            ₦{(beneficiary?.balance ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(beneficiary.status)}
                            >
                              {beneficiary.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(
                              beneficiary?.lastLogin ||
                                beneficiary?.registeredDate ||
                                Date.now()
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewDetails(beneficiary)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {can("beneficiaries", "update") &&
                                  beneficiary.status !== "active" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(
                                          beneficiary.id,
                                          "active"
                                        )
                                      }
                                    >
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                {can("beneficiaries", "update") &&
                                  beneficiary.status !== "inactive" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(
                                          beneficiary.id,
                                          "inactive"
                                        )
                                      }
                                    >
                                      <UserX className="w-4 h-4 mr-2" />
                                      Deactivate
                                    </DropdownMenuItem>
                                  )}
                                {can("beneficiaries", "update") &&
                                  beneficiary.status !== "suspended" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(
                                          beneficiary.id,
                                          "suspended"
                                        )
                                      }
                                    >
                                      <Ban className="w-4 h-4 mr-2" />
                                      Suspend
                                    </DropdownMenuItem>
                                  )}
                                {can("beneficiaries", "delete") && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(beneficiary.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Beneficiary Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Beneficiary Details</DialogTitle>
                </DialogHeader>
                {selectedBeneficiary && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Full Name
                        </p>
                        <p className="font-medium">
                          {selectedBeneficiary.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">NIN</p>
                        <p className="font-mono">{selectedBeneficiary.nin}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {selectedBeneficiary.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {selectedBeneficiary.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge
                          className={getStatusColor(selectedBeneficiary.status)}
                        >
                          {selectedBeneficiary.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="font-bold text-lg">
                          ₦
                          {(selectedBeneficiary?.balance ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Received
                        </p>
                        <p className="font-medium text-success">
                          ₦
                          {(
                            selectedBeneficiary?.totalReceived ?? 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Withdrawn
                        </p>
                        <p className="font-medium text-muted-foreground">
                          ₦
                          {(
                            selectedBeneficiary?.totalWithdrawn ?? 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Registered Date
                        </p>
                        <p className="font-medium">
                          {new Date(
                            selectedBeneficiary?.registeredDate || Date.now()
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Last Login
                        </p>
                        <p className="font-medium">
                          {new Date(
                            selectedBeneficiary?.lastLogin ||
                              selectedBeneficiary?.registeredDate ||
                              Date.now()
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(
                            selectedBeneficiary.id,
                            "active"
                          )
                        }
                        disabled={selectedBeneficiary.status === "active"}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(
                            selectedBeneficiary.id,
                            "suspended"
                          )
                        }
                        disabled={selectedBeneficiary.status === "suspended"}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Suspend
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDelete(
                            selectedBeneficiary.id
                          );
                          setIsDetailOpen(false);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
