import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, UserCheck, UserX, Ban, Eye, Edit, Trash2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockBeneficiaries, Beneficiary } from '@/data/mockAdminData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState(mockBeneficiaries);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredBeneficiaries = beneficiaries.filter((ben) => {
    const matchesSearch =
      ben.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ben.nin.includes(searchTerm) ||
      ben.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ben.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setBeneficiaries(beneficiaries.map(b => 
      b.id === id ? { ...b, status: newStatus } : b
    ));
    toast({
      title: 'Status Updated',
      description: `Beneficiary status changed to ${newStatus}`,
    });
  };

  const handleDelete = (id: string) => {
    setBeneficiaries(beneficiaries.filter(b => b.id !== id));
    toast({
      title: 'Beneficiary Deleted',
      description: 'The beneficiary has been removed from the system',
      variant: 'destructive',
    });
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
                  <div className="flex gap-2">
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
                      {filteredBeneficiaries.map((beneficiary) => (
                        <TableRow key={beneficiary.id}>
                          <TableCell className="font-medium">{beneficiary.fullName}</TableCell>
                          <TableCell>{beneficiary.nin}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{beneficiary.phone}</div>
                              <div className="text-muted-foreground">{beneficiary.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>₦{beneficiary.balance.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(beneficiary.status)}>
                              {beneficiary.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(beneficiary.lastLogin).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(beneficiary)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {beneficiary.status !== 'active' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(beneficiary.id, 'active')}>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                {beneficiary.status !== 'inactive' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(beneficiary.id, 'inactive')}>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                                {beneficiary.status !== 'suspended' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(beneficiary.id, 'suspended')}>
                                    <Ban className="w-4 h-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDelete(beneficiary.id)}
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
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{selectedBeneficiary.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">NIN</p>
                        <p className="font-mono">{selectedBeneficiary.nin}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedBeneficiary.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedBeneficiary.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(selectedBeneficiary.status)}>
                          {selectedBeneficiary.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="font-bold text-lg">₦{selectedBeneficiary.balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Received</p>
                        <p className="font-medium text-success">₦{selectedBeneficiary.totalReceived.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                        <p className="font-medium text-muted-foreground">₦{selectedBeneficiary.totalWithdrawn.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registered Date</p>
                        <p className="font-medium">{new Date(selectedBeneficiary.registeredDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Login</p>
                        <p className="font-medium">{new Date(selectedBeneficiary.lastLogin).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(selectedBeneficiary.id, 'active')}
                        disabled={selectedBeneficiary.status === 'active'}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(selectedBeneficiary.id, 'suspended')}
                        disabled={selectedBeneficiary.status === 'suspended'}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Suspend
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDelete(selectedBeneficiary.id);
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
