import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockPolls } from '@/data/mockAdminData';
import { toast } from '@/hooks/use-toast';

export default function Polls() {
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  const handleVote = (pollId: string, optionId: string) => {
    setVotedPolls(prev => new Set(prev).add(pollId));
    toast({
      title: 'Vote Recorded',
      description: 'Thank you for participating in this poll!',
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

  const activePolls = mockPolls.filter(poll => poll.status === 'active');
  const closedPolls = mockPolls.filter(poll => poll.status === 'closed');

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Polls</h1>
          <p className="text-muted-foreground">
            Your voice matters! Participate in polls to help shape our policies and services.
          </p>
        </motion.div>

        {/* Active Polls */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Active Polls
          </h2>
          {activePolls.map((poll, index) => {
            const hasVoted = votedPolls.has(poll.id);
            return (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
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
                        <CardDescription className="mt-2">
                          {poll.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Ends: {new Date(poll.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {poll.totalVotes.toLocaleString()} votes
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {poll.options.map((option) => {
                      const percentage = (option.votes / poll.totalVotes) * 100;
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Button
                                variant={hasVoted ? 'outline' : 'ghost'}
                                className="w-full justify-start h-auto py-3 px-4"
                                onClick={() => handleVote(poll.id, option.id)}
                                disabled={hasVoted}
                              >
                                <span className="flex-1 text-left">{option.text}</span>
                                {hasVoted && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {percentage.toFixed(1)}%
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                          {hasVoted && (
                            <Progress value={percentage} className="h-2" />
                          )}
                        </div>
                      );
                    })}
                    {hasVoted && (
                      <div className="flex items-center gap-2 text-sm text-success mt-4 pt-4 border-t">
                        <CheckCircle className="w-4 h-4" />
                        You have voted in this poll
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Closed Polls */}
        {closedPolls.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Closed Polls
            </h2>
            {closedPolls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(poll.status)}>
                        {poll.status}
                      </Badge>
                      <Badge variant="outline">{poll.category}</Badge>
                    </div>
                    <CardTitle>{poll.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {poll.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {poll.options.map((option) => {
                      const percentage = (option.votes / poll.totalVotes) * 100;
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{option.text}</span>
                            <span className="text-muted-foreground">
                              {percentage.toFixed(1)}% ({option.votes.toLocaleString()})
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                    <div className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                      Total votes: {poll.totalVotes.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
