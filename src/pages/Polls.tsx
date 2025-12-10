import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { speakText } from '@/utils/speakText';
import { useTranslation } from 'react-i18next';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import i18n from '@/i18n/config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

export default function Polls() {
  const { t } = useTranslation();
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: polls = [], isLoading, isError } = useQuery({
    queryKey: ['polls'],
    queryFn: async () => {
      const res: any = await apiGet('/api/polls');
      return Array.isArray(res) ? res : [];
    },
  });

  // Initialize votedPolls from server response so refresh preserves voted state
  useEffect(() => {
    if (Array.isArray(polls) && polls.length > 0) {
      const voted = new Set<string>();
      polls.forEach((p: any) => {
        if (p.voted) voted.add(p.id);
      });
      setVotedPolls(voted);
    }
  }, [polls]);

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const res: any = await apiPost(`/api/polls/${pollId}/vote`, { optionId });
      return res;
    },
    onSuccess: (data, vars: any) => {
      // Refresh polls list
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      setVotedPolls(prev => new Set(prev).add(vars.pollId));
      const title = t('voteRecordedTitle');
      const desc = t('voteRecordedDesc');
      toast({ title, description: desc });
      speakText(`${title}. ${desc}`, i18n.language);
    },
    onError: (err: any) => {
      const title = t('voteFailedTitle');
      const desc = err?.message || t('voteFailedDesc');
      toast({ title, description: desc, variant: 'destructive' });
      speakText(`${title}. ${desc}`, i18n.language);
    }
  });

  const handleVote = (pollId: string, optionId: string) => {
    // optimistic local UI update
    setVotedPolls(prev => new Set(prev).add(pollId));
    const title = t('voteRecordedTitle');
    const desc = t('voteRecordedDesc');
    toast({ title, description: desc });
    speakText(`${title}. ${desc}`, i18n.language);
    voteMutation.mutate({ pollId, optionId });
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

  const activePolls = polls.filter((poll: any) => poll.status === 'active');
  const closedPolls = polls.filter((poll: any) => poll.status === 'closed');

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('pollsTitle')}</h1>
          <p className="text-muted-foreground">{t('pollsDescription')}</p>
        </motion.div>

        {/* Active Polls */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t('activePolls')}
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
                            {t(poll.status)}
                          </Badge>
                          <Badge variant="outline">{poll.category}</Badge>
                        </div>
                        <CardTitle>{poll.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <CardDescription className="flex-1">{poll.description}</CardDescription>
                          <TextToSpeechButton
                            text={`Poll: ${poll.title}. Description: ${poll.description}. Options: ${poll.options.map((o:any) => o.text).join(', ')}`}
                            lang={i18n.language}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t('ends')}: {new Date(poll.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {poll.totalVotes.toLocaleString()} {t('votes')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {poll.options.map((option: any) => {
                      const total = poll.totalVotes || poll.options.reduce((s: number, o: any) => s + (o.votes || 0), 0);
                      const percentage = total > 0 ? (option.votes / total) * 100 : 0;
                      if (hasVoted) {
                        console.log('Option:', option.text, 'Votes:', option.votes, 'Total:', total, 'Percentage:', percentage);
                      }
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Button
                                variant={hasVoted ? 'outline' : 'ghost'}
                                className="w-full justify-start h-auto py-3 px-4"
                                onClick={() => handleVote(poll.id, option.optionId || option.id)}
                                disabled={hasVoted || poll.status !== 'active' || voteMutation.isPending}
                              >
                                <span className="flex-1 text-left">{option.text}</span>
                                {hasVoted && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {percentage.toFixed(1)}% ({option.votes})
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
                        {t('youHaveVoted')}
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
                {t('closedPolls')}
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
                    <div className="flex items-center gap-2 mt-2">
                      <CardDescription className="flex-1">{poll.description}</CardDescription>
                      <TextToSpeechButton
                        text={`Poll: ${poll.title}. Description: ${poll.description}. Options: ${poll.options.map((o:any) => o.text).join(', ')}`}
                        lang={i18n.language}
                      />
                    </div>
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
                      {t('totalVotesLabel')}: {poll.totalVotes.toLocaleString()}
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
