import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, UserCheck, UserX, Ban } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockBeneficiaries } from '@/data/mockAdminData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Beneficiaries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBeneficiaries = mockBeneficiaries.filter((ben) => {
    const matchesSearch =
      ben.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ben.nin.includes(searchTerm) ||
      ben.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ben.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                                <DropdownMenuItem>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend
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
