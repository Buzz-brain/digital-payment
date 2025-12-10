import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, UserCheck, MoreVertical, Download } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NINRecord } from '@/data/mockAdminData';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF, formatDate } from '@/lib/exportUtils';
import { auditLogger } from '@/lib/auditLog';
import { useAdminStore } from '@/store/adminStore';

export default function NINManagement() {
  const { admin } = useAdminStore();
  const [records, setRecords] = useState<NINRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NINRecord | null>(null);
  const [formData, setFormData] = useState({
    nin: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    email: '',
    address: '',
    state: '',
    lga: '',
  });

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.nin.includes(searchTerm) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrUpdate = () => {
    if (!formData.nin || !formData.fullName || !formData.phone) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (NIN, Full Name, Phone)',
        variant: 'destructive',
      });
      return;
    }

    (async () => {
      try {
        if (editingRecord) {
          // Update via API (use NIN as identifier)
          const payload = { ...formData };
          const updated: any = await apiPut(`/api/nininfo/${encodeURIComponent(formData.nin)}`, payload);
          // reflect in local state (match by nin)
          setRecords((prev) => prev.map(r => (r.nin === updated.nin ? { ...r, ...updated } : r)));

          if (admin) {
            auditLogger.log('nin_updated', 'NIN', `Updated NIN record for ${formData.fullName}`, admin.id, admin.fullName, formData.nin);
          }

          toast({ title: 'NIN Updated', description: 'NIN record has been updated successfully' });
        } else {
          // Create via API
          const payload = { ...formData };
          const created: any = await apiPost('/api/nininfo', payload);
          const newRecord: NINRecord = {
            id: `NIN${String(records.length + 1).padStart(3, '0')}`,
            nin: created.nin,
            fullName: created.fullName,
            dateOfBirth: created.dob ? created.dob.split('T')[0] : formData.dateOfBirth,
            gender: created.gender || formData.gender,
            phone: created.phone,
            email: created.email || '',
            address: created.address || '',
            state: created.state || '',
            lga: created.lga || '',
            registeredDate: new Date().toISOString().split('T')[0],
            isLinked: false,
            isVerified: false,
            status: 'active',
          };
          setRecords((prev) => [newRecord, ...prev]);

          if (admin) {
            auditLogger.log('nin_created', 'NIN', `Created new NIN record for ${formData.fullName}`, admin.id, admin.fullName, created.nin);
          }

          toast({ title: 'NIN Registered', description: 'New NIN has been registered successfully' });
        }
        resetForm();
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to save NIN record', variant: 'destructive' });
      }
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: any[] = await apiGet('/api/nininfo');
        if (!mounted) return;
        const mapped: NINRecord[] = data.map((d, idx) => ({
          id: d._id || `NIN${String(idx + 1).padStart(3, '0')}`,
          nin: d.nin,
          fullName: d.fullName || '',
          dateOfBirth: d.dob ? (d.dob.split ? d.dob.split('T')[0] : String(d.dob)) : '',
          gender: (d.gender === 'female' ? 'female' : 'male'),
          phone: d.phone || '',
          email: d.email || '',
          address: d.address || '',
          state: d.state || '',
          lga: d.lga || '',
          registeredDate: d.createdAt ? (d.createdAt.split ? d.createdAt.split('T')[0] : String(d.createdAt)) : new Date().toISOString().split('T')[0],
          isLinked: !!d.linkedUserId,
          linkedUserId: d.linkedUserId,
          isVerified: !!d.isVerified,
          status: 'active',
        }));
        setRecords(mapped);
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to fetch NIN records', variant: 'destructive' });
      }
    })();
    return () => { mounted = false; };
  }, []);

  const resetForm = () => {
    setFormData({
      nin: '',
      fullName: '',
      dateOfBirth: '',
      gender: 'male',
      phone: '',
      email: '',
      address: '',
      state: '',
      lga: '',
    });
    setEditingRecord(null);
    setIsCreateOpen(false);
  };

  const handleEdit = (record: NINRecord) => {
    setEditingRecord(record);
    setFormData({
      nin: record.nin,
      fullName: record.fullName,
      dateOfBirth: record.dateOfBirth,
      gender: record.gender,
      phone: record.phone,
      email: record.email,
      address: record.address,
      state: record.state,
      lga: record.lga,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    (async () => {
      try {
        const record = records.find(r => r.id === id);
        if (!record) throw new Error('Record not found');
        await apiDelete(`/api/nininfo/${encodeURIComponent(record.nin)}`);
        setRecords((prev) => prev.filter(r => r.id !== id));
        if (admin && record) {
          auditLogger.log('nin_deleted', 'NIN', `Deleted NIN record for ${record.fullName}`, admin.id, admin.fullName, record.nin);
        }
        toast({ title: 'NIN Deleted', description: 'NIN record has been removed' });
      } catch (err: any) {
        toast({ title: 'Error', description: err.message || 'Failed to delete NIN', variant: 'destructive' });
      }
    })();
  };

  const handleToggleStatus = (id: string) => {
    setRecords(records.map(r => 
      r.id === id 
        ? { ...r, status: r.status === 'active' ? 'suspended' : 'active' as 'active' | 'suspended' }
        : r
    ));
    toast({
      title: 'Status Updated',
      description: 'NIN status has been changed',
    });
  };

  const handleVerify = (id: string) => {
    (async () => {
      try {
        const record = records.find(r => r.id === id);
        if (!record) throw new Error('Record not found');
        
        // Call verify endpoint with NIN
        await apiPost('/api/nin/verify', { nin: record.nin });
        
        // Update local state
        setRecords((prev) => prev.map(r => 
          r.id === id 
            ? { ...r, isVerified: true }
            : r
        ));
        
        if (admin) {
          auditLogger.log('nin_verified', 'NIN', `Verified NIN for ${record.fullName}`, admin.id, admin.fullName, record.nin);
        }
        
        toast({
          title: 'NIN Verified',
          description: `NIN for ${record.fullName} has been verified successfully`,
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to verify NIN',
          variant: 'destructive',
        });
      }
    })();
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredRecords,
      `nin_records_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'NIN', key: 'nin' },
        { header: 'Full Name', key: 'fullName' },
        { header: 'Phone', key: 'phone' },
        { header: 'Email', key: 'email' },
        { header: 'State', key: 'state' },
        { header: 'LGA', key: 'lga' },
        { header: 'Status', key: 'status' },
      ]
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredRecords.map(r => ({
        ...r,
        registeredDate: formatDate(r.registeredDate),
      })),
      `nin_records_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'NIN', key: 'nin', width: 30 },
        { header: 'Full Name', key: 'fullName', width: 40 },
        { header: 'Phone', key: 'phone', width: 30 },
        { header: 'State', key: 'state', width: 25 },
        { header: 'Status', key: 'status', width: 20 },
      ],
      'NIN Records Report',
      `Generated on ${new Date().toLocaleDateString()}`
    );
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
                  <CardTitle>NIN Management</CardTitle>
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
                        <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                          All Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                          Inactive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                          Suspended
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIN</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono">{record.nin}</TableCell>
                          <TableCell className="font-medium">{record.fullName}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{record.phone}</div>
                              <div className="text-muted-foreground">{record.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{record.state}</div>
                              <div className="text-muted-foreground">{record.lga}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.isVerified ? (
                              <Badge className="bg-success/10 text-success">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Verified</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!record.isVerified && (
                                  <DropdownMenuItem onClick={() => handleVerify(record.id)}>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Verify NIN
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleEdit(record)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(record.id)}>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  {record.status === 'active' ? 'Suspend' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDelete(record.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
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
          </motion.div>
        </main>
      </div>
    </div>
  );
}
