import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BarChart3, Edit, Trash2, Eye, Clock, Download } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Poll } from '@/data/mockAdminData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';

export default function PollsManagement() {
  
  const queryClient = useQueryClient();

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['admin', 'polls'],
    queryFn: async () => {
      const res: any = await apiGet('/api/polls');
      return Array.isArray(res) ? res : [];
    },
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    options: ['', '', '', ''],
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => apiPost('/api/polls', payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
      setIsCreateOpen(false);
      setNewPoll({ title: '', description: '', category: '', startDate: '', endDate: '', options: ['', '', '', ''] });
      toast({ title: 'Poll Created', description: 'The poll has been created successfully' });
    },
    onError: (err: any) => {
      toast({ title: 'Create failed', description: err?.message || 'Could not create poll', variant: 'destructive' });
    }
  });

  const handleCreatePoll = () => {
    if (!newPoll.title || !newPoll.description || !newPoll.category) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const payload = {
      title: newPoll.title,
      description: newPoll.description,
      category: newPoll.category,
      startDate: newPoll.startDate || undefined,
      endDate: newPoll.endDate || undefined,
      options: newPoll.options.filter((o) => o.trim()),
    };

    createMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiDelete(`/api/polls/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
      toast({ title: 'Poll Deleted', description: 'The poll has been removed' });
    },
    onError: (err: any) => toast({ title: 'Delete failed', description: err?.message || 'Could not delete poll', variant: 'destructive' })
  });

  const handleDeletePoll = (pollId: string) => {
    deleteMutation.mutate(pollId);
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => apiPut(`/api/polls/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'polls'] });
      toast({ title: 'Status Updated', description: 'Poll status has been changed' });
    },
    onError: (err: any) => toast({ title: 'Update failed', description: err?.message || 'Could not update poll', variant: 'destructive' })
  });

  const handleToggleStatus = (pollId: string) => {
    const poll = (polls as any).find((p: any) => p.id === pollId);
    if (!poll) return;
    const newStatus = poll.status === 'active' ? 'closed' : 'active';
    updateMutation.mutate({ id: pollId, updates: { status: newStatus } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      case 'upcoming':
        return 'bg-primary/10 text-primary hover:bg-primary/20';
      default:
        return 'bg-muted';
    }
  };

  const handleExportCSV = () => {
    const exportData = polls.map(poll => ({
      title: poll.title,
      category: poll.category,
      status: poll.status,
      totalVotes: poll.totalVotes,
      startDate: poll.startDate,
      endDate: poll.endDate,
      createdBy: poll.createdBy,
    }));
    
    exportToCSV(
      exportData,
      `polls_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'Title', key: 'title' },
        { header: 'Category', key: 'category' },
        { header: 'Status', key: 'status' },
        { header: 'Total Votes', key: 'totalVotes' },
        { header: 'Start Date', key: 'startDate' },
        { header: 'End Date', key: 'endDate' },
      ]
    );
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
                <h1 className="text-3xl font-bold text-foreground">Polls Management</h1>
                <p className="text-muted-foreground mt-1">
                  Create and manage community polls
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Poll
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Poll</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Poll Title</Label>
                      <Input
                        id="title"
                        value={newPoll.title}
                        onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                        placeholder="Enter poll title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newPoll.description}
                        onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                        placeholder="Enter poll description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newPoll.category}
                        onValueChange={(value) => setNewPoll({ ...newPoll, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Disbursement">Disbursement</SelectItem>
                          <SelectItem value="Policy">Policy</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={newPoll.startDate}
                          onChange={(e) => setNewPoll({ ...newPoll, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={newPoll.endDate}
                          onChange={(e) => setNewPoll({ ...newPoll, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Poll Options (minimum 2)</Label>
                      {newPoll.options.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => {
                            const updated = [...newPoll.options];
                            updated[index] = e.target.value;
                            setNewPoll({ ...newPoll, options: updated });
                          }}
                          placeholder={`Option ${index + 1}`}
                          className="mt-2"
                        />
                      ))}
                    </div>
                    <Button onClick={handleCreatePoll} className="w-full">
                      Create Poll
                    </Button>
                  </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-6">
              {(isLoading ? [] : polls).map((poll: any) => (
                <Card key={poll.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(poll.status)}>
                            {poll.status}
                          </Badge>
                          <Badge variant="outline">{poll.category}</Badge>
                        </div>
                        <CardTitle>{poll.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          {poll.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleStatus(poll.id)}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeletePoll(poll.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Votes</p>
                          <p className="text-2xl font-bold text-foreground">
                            {poll.totalVotes.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Options</p>
                          <p className="text-2xl font-bold text-foreground">
                            {poll.options.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(poll.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(poll.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t">
                        <p className="text-sm font-medium text-foreground">Results:</p>
                        {poll.options.map((option) => {
                          const percentage = poll.totalVotes > 0 
                            ? (option.votes / poll.totalVotes) * 100 
                            : 0;
                          return (
                            <div key={option.id} className="flex items-center justify-between text-sm">
                              <span className="text-foreground">{option.text}</span>
                              <span className="text-muted-foreground">
                                {percentage.toFixed(1)}% ({option.votes.toLocaleString()})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
