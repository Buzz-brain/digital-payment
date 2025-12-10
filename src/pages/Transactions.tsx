import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiGet } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import i18n from '@/i18n/config';
import { speakText } from '@/utils/speakText';

const Transactions = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res: any = await apiGet('/api/transactions');
      return res.transactions || res;
    },
    // stale time short so UI stays relatively fresh; adjust as needed
    staleTime: 1000 * 10,
  });

  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const filteredTransactions = (transactions || []).filter((transaction) => {
    // Only show debit if user is sender, credit if user is receiver
    const isSenderDebit = transaction.type === 'debit' && transaction.from === userId;
    const isReceiverCredit = transaction.type === 'credit' && transaction.to === userId;
    if (!(isSenderDebit || isReceiverCredit)) return false;
    const desc = (transaction.description || '') as string;
    const ref = (transaction.reference || transaction._id || '') as string;
    const matchesSearch = desc.toLowerCase().includes(searchQuery.toLowerCase()) || ref.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalCredit = transactions
    .filter((t) => t.type === 'credit' && t.to === userId)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalDebit = transactions
    .filter((t) => t.type === 'debit' && t.from === userId)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('transactions')}</h1>
            <p className="text-muted-foreground">{t('transactionsDescription')}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('totalCredit')}</p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(totalCredit)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <ArrowDownLeft className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('totalDebit')}</p>
                    <p className="text-2xl font-bold text-destructive">
                      {formatCurrency(totalDebit)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('netBalance')}</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(totalCredit - totalDebit)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">₦</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>{t('filterTransactions')}</CardTitle>
              <CardDescription>{t('filterDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder={t('type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allTypes')}</SelectItem>
                    <SelectItem value="credit">{t('credit')}</SelectItem>
                    <SelectItem value="debit">{t('debit')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder={t('status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatus')}</SelectItem>
                    <SelectItem value="completed">{t('completed')}</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="failed">{t('failed')}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                >
                  {t('clear')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('transactionHistory')} ({filteredTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">{t('loadingTransactions')}</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {t('noTransactionsFound')}
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.type === 'credit'
                              ? 'bg-success/10'
                              : 'bg-destructive/10'
                          }`}
                        >
                          {transaction.type === 'credit' ? (
                            <ArrowDownLeft className="w-6 h-6 text-success" />
                          ) : (
                            <ArrowUpRight className="w-6 h-6 text-destructive" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.reference}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(transaction.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div
                          className={`text-lg font-bold ${
                            transaction.type === 'credit'
                              ? 'text-success'
                              : 'text-destructive'
                          }`}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'default'
                              : transaction.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {t(transaction.status)}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Transactions;
