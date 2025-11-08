import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Clock, Flag } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { mockAdminFeedback } from '@/data/mockAdminData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export default function FeedbackReview() {
  const handleRespond = () => {
    toast({
      title: 'Response Sent',
      description: 'Your response has been sent to the user',
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'reviewed':
        return 'bg-primary/10 text-primary hover:bg-primary/20';
      case 'resolved':
        return 'bg-success/10 text-success hover:bg-success/20';
      default:
        return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewed':
        return <Flag className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
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
                <CardTitle>Feedback Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAdminFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{feedback.userName}</h4>
                            <Badge className={getPriorityColor(feedback.priority)}>
                              {feedback.priority}
                            </Badge>
                            <Badge className={getStatusColor(feedback.status)}>
                              {getStatusIcon(feedback.status)}
                              <span className="ml-1">{feedback.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            {feedback.category}
                          </p>
                          <p className="text-sm">{feedback.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(feedback.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Respond
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Respond to Feedback</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-2">Original Message:</p>
                              <p className="text-sm">{feedback.message}</p>
                            </div>
                            <Textarea
                              placeholder="Type your response here..."
                              rows={5}
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Mark as Reviewed</Button>
                              <Button onClick={handleRespond}>Send Response</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
