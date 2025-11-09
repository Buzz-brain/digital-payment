import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BarChart3, Edit, Trash2, Eye, Clock } from 'lucide-react';
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
import { mockPolls, Poll } from '@/data/mockAdminData';
import { toast } from '@/hooks/use-toast';

export default function PollsManagement() {
  const [polls, setPolls] = useState(mockPolls);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    options: ['', '', '', ''],
  });

  const handleCreatePoll = () => {
    if (!newPoll.title || !newPoll.description || !newPoll.category) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    const poll: Poll = {
      id: `POLL${String(polls.length + 1).padStart(3, '0')}`,
      title: newPoll.title,
      description: newPoll.description,
      category: newPoll.category,
      startDate: newPoll.startDate,
      endDate: newPoll.endDate,
      status: 'active',
      options: newPoll.options
        .filter(opt => opt.trim())
        .map((text, idx) => ({
          id: `OPT${idx + 1}`,
          text,
          votes: 0,
        })),
      totalVotes: 0,
      createdBy: 'Admin User',
    };

    setPolls([poll, ...polls]);
    setIsCreateOpen(false);
    setNewPoll({
      title: '',
      description: '',
      category: '',
      startDate: '',
      endDate: '',
      options: ['', '', '', ''],
    });
    toast({
      title: 'Poll Created',
      description: 'The poll has been created successfully',
    });
  };

  const handleDeletePoll = (pollId: string) => {
    setPolls(polls.filter(p => p.id !== pollId));
    toast({
      title: 'Poll Deleted',
      description: 'The poll has been removed',
    });
  };

  const handleToggleStatus = (pollId: string) => {
    setPolls(polls.map(p => 
      p.id === pollId 
        ? { ...p, status: p.status === 'active' ? 'closed' : 'active' as 'active' | 'closed' } 
        : p
    ));
    toast({
      title: 'Status Updated',
      description: 'Poll status has been changed',
    });
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

            <div className="grid gap-6">
              {polls.map((poll) => (
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
