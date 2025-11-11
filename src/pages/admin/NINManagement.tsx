import { useState } from 'react';
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
import { mockNINRecords, NINRecord } from '@/data/mockAdminData';
import { toast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF, formatDate } from '@/lib/exportUtils';
import { auditLogger } from '@/lib/auditLog';
import { useAdminStore } from '@/store/adminStore';
import { BulkOperations } from '@/components/admin/BulkOperations';

export default function NINManagement() {
  const { admin } = useAdminStore();
  const [records, setRecords] = useState(mockNINRecords);
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
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingRecord) {
      setRecords(records.map(r => 
        r.id === editingRecord.id 
          ? { ...r, ...formData }
          : r
      ));
      
      if (admin) {
        auditLogger.log(
          'nin_updated',
          'NIN',
          `Updated NIN record for ${formData.fullName}`,
          admin.id,
          admin.fullName,
          editingRecord.id
        );
      }
      
      toast({
        title: 'NIN Updated',
        description: 'NIN record has been updated successfully',
      });
    } else {
      const newRecord: NINRecord = {
        id: `NIN${String(records.length + 1).padStart(3, '0')}`,
        ...formData,
        registeredDate: new Date().toISOString().split('T')[0],
        isLinked: false,
        status: 'active',
      };
      setRecords([newRecord, ...records]);
      
      if (admin) {
        auditLogger.log(
          'nin_created',
          'NIN',
          `Created new NIN record for ${formData.fullName}`,
          admin.id,
          admin.fullName,
          newRecord.id
        );
      }
      
      toast({
        title: 'NIN Registered',
        description: 'New NIN has been registered successfully',
      });
    }

    resetForm();
  };

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
    const record = records.find(r => r.id === id);
    setRecords(records.filter(r => r.id !== id));
    
    if (admin && record) {
      auditLogger.log(
        'nin_deleted',
        'NIN',
        `Deleted NIN record for ${record.fullName}`,
        admin.id,
        admin.fullName,
        id
      );
    }
    
    toast({
      title: 'NIN Deleted',
      description: 'NIN record has been removed',
    });
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

  const handleBulkImport = (data: any[]) => {
    const newRecords = data.map((item, index) => ({
      id: `NIN${String(records.length + index + 1).padStart(3, '0')}`,
      nin: item.NIN || item.nin,
      fullName: item['Full Name'] || item.fullName,
      dateOfBirth: item['Date of Birth'] || item.dateOfBirth || '',
      gender: (item.Gender || item.gender || 'male') as 'male' | 'female',
      phone: item.Phone || item.phone,
      email: item.Email || item.email || '',
      address: item.Address || item.address || '',
      state: item.State || item.state,
      lga: item.LGA || item.lga,
      registeredDate: new Date().toISOString().split('T')[0],
      isLinked: false,
      status: 'active' as 'active' | 'suspended',
    }));
    
    setRecords([...records, ...newRecords]);
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
                    <BulkOperations 
                      type="nin"
                      onImportComplete={handleBulkImport}
                    />
                    <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={(open) => {
                      setIsCreateOpen(open);
                      if (!open) resetForm();
                    }}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Register NIN
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingRecord ? 'Edit NIN Record' : 'Register New NIN'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="nin">NIN *</Label>
                            <Input
                              id="nin"
                              value={formData.nin}
                              onChange={(e) => setFormData({ ...formData, nin: e.target.value })}
                              placeholder="11 digit NIN"
                              maxLength={11}
                            />
                          </div>
                          <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                              id="fullName"
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                              value={formData.gender}
                              onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, gender: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+234 XXX XXX XXXX"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="email@example.com"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              placeholder="Enter address"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              placeholder="Enter state"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lga">LGA</Label>
                            <Input
                              id="lga"
                              value={formData.lga}
                              onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                              placeholder="Enter LGA"
                            />
                          </div>
                        </div>
                        <Button onClick={handleCreateOrUpdate} className="w-full mt-4">
                          {editingRecord ? 'Update NIN' : 'Register NIN'}
                        </Button>
                      </DialogContent>
                    </Dialog>
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
                        <TableHead>Linked</TableHead>
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
                            {record.isLinked ? (
                              <Badge className="bg-success/10 text-success">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Linked
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Linked</Badge>
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
