import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Announcement as AnnouncementType } from '@/data/mockData';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function AnnouncementsManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('low');
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);

  // Helper: map backend announcement to local shape
  const mapAnnouncement = (a: any): AnnouncementType => ({
    id: a._id || a.id,
    title: a.title,
    content: a.content || a.body || '',
    category: a.category || 'general',
    priority: a.priority || 'low',
    date: a.createdAt || new Date().toISOString(),
    publishedAt: a.publishedAt || null,
    createdBy: a.createdBy,
    published: !!a.published,
  });

  // Helper: load announcements (admin) and set state
  const loadAnnouncements = async () => {
    try {
      const data = await apiGet('/api/announcements/all');
      setAnnouncements(((data || []) as any[]).map(mapAnnouncement));
    } catch (err) {
      console.warn('Failed to load announcements for admin view', err);
    }
  };
  // Load announcements for admin view — admin endpoint returns all announcements
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadAnnouncements();
    })();
    return () => { mounted = false; };
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        // Close UI immediately for snappier response
        setIsOpen(false);
        setTitle(''); setContent(''); setCategory('general'); setPriority('low');
        await apiPost('/api/announcements', { title, content, category, priority, published: true });
        toast({ title: 'Announcement Created', description: 'The announcement has been published successfully' });
        // reload authoritative list
        await loadAnnouncements();
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || 'Failed to create announcement' });
      }
    })();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    (async () => {
      try {
        await apiPut(`/api/announcements/${editingId}`, { title, content, category, priority, published: true });
        toast({ title: 'Announcement Updated', description: 'The announcement was updated successfully' });
        setIsOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setTitle(''); setContent(''); setCategory('general'); setPriority('low');
        // reload list
        const updated = await apiGet('/api/announcements/all');
        setAnnouncements((updated || []).map((a: any) => ({ id: a._id || a.id, title: a.title, content: a.content || a.body || '', category: a.category || 'general', priority: a.priority || 'low', date: a.createdAt || new Date().toISOString(), publishedAt: a.publishedAt || null, createdBy: a.createdBy, published: !!a.published })));
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || 'Failed to update announcement' });
      }
    })();
  };

  const handleDelete = (id: string) => {
    // optimistic update: remove from UI immediately, rollback on error
    const previous = announcements;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    (async () => {
      try {
        await apiDelete(`/api/announcements/${id}`);
        toast({ title: 'Announcement Deleted', description: 'The announcement has been deleted' });
        // reload authoritative list to ensure consistency
        await loadAnnouncements();
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || 'Failed to delete announcement' });
        // rollback
        setAnnouncements(previous);
      }
    })();
  };

  const togglePublish = (id: string, current: boolean) => {
    // optimistic toggle: update UI first
    const previous = announcements;
    setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, published: !current, publishedAt: !current ? new Date().toISOString() : null } : a));
    (async () => {
      try {
        await apiPut(`/api/announcements/${id}`, { published: !current });
        toast({ title: current ? 'Announcement Unpublished' : 'Announcement Published' });
        // reload authoritative list
        await loadAnnouncements();
      } catch (err: any) {
        toast({ title: 'Error', description: err?.message || 'Failed to change publish state' });
        // rollback
        setAnnouncements(previous);
      }
    })();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'low':
        return 'bg-muted text-muted-foreground';
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
                <div className="flex items-center justify-between">
                  <CardTitle>Announcements Management</CardTitle>
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Announcement
                      </Button>
                    </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Announcement content"
                            rows={5}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category as any} onValueChange={(v) => setCategory(v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="disbursement">Disbursement</SelectItem>
                                <SelectItem value="update">Update</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority as any} onValueChange={(v) => setPriority(v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">{isEditing ? 'Update' : 'Publish'}</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{announcement.title}</h4>
                              <Badge className={getPriorityColor(announcement.priority)}>
                                {announcement.priority}
                              </Badge>
                              <Badge className={announcement.published ? 'bg-green-100 text-green-800 ml-2' : 'bg-muted text-muted-foreground ml-2'}>
                                {announcement.published ? 'Published' : 'Draft'}
                              </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {announcement.content}
                          </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(announcement.date).toLocaleDateString()} • {announcement.category}
                            </p>
                            {announcement.publishedAt && (
                              <p className="text-xs text-muted-foreground mt-1">Published at: {new Date(announcement.publishedAt).toLocaleString()}</p>
                            )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          // open edit dialog and populate
                          setIsEditing(true);
                          setEditingId(announcement.id);
                          setTitle(announcement.title);
                          setContent(announcement.content);
                          setCategory(announcement.category);
                          setPriority(announcement.priority);
                          setIsOpen(true);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => togglePublish(announcement.id, announcement.published)}>
                          {announcement.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
