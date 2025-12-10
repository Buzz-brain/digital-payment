import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  Send,
  Download,
  MessageSquare,
  User,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { apiGet } from '@/lib/api';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import { numberToWords } from '@/utils/numberToWords';
import i18n from '@/i18n/config';

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const wallet = useAuthStore((s) => s.wallet);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Always fetch latest wallet on mount
  useEffect(() => {
    const fetchWallet = async () => {
      if (user?.id) {
        try {
          const walletResp: any = await apiGet(`/api/wallet/${user.id}`);
          useAuthStore.setState((state: any) => ({
            wallet: walletResp || null,
            user: state.user ? { ...state.user, walletBalance: walletResp?.balance ?? state.user.walletBalance, wallet: walletResp ? { balance: walletResp.balance ?? 0, ledger: walletResp.ledger || [] } : state.user.wallet } : state.user,
          }));
        } catch (e) {
          // ignore fetch errors
        }
      }
    };
    fetchWallet();
    // Only run on mount or when user changes
  }, [user?.id]);
  const { t } = useTranslation();

  // Prefer real ledger from wallet if available, otherwise use mock data
  const recentTransactions = (wallet && wallet.ledger && wallet.ledger.length > 0)
    ? wallet.ledger.slice(-3).reverse().map((entry: any, idx: number) => {
        let txType = 'debit';
        if (entry.type === 'credit' || entry.type === 'transfer_in') txType = 'credit';
        if (entry.type === 'debit' || entry.type === 'transfer_out') txType = 'debit';
        return {
          id: `w-${idx}`,
          description: entry.type || 'Transaction',
          date: entry.createdAt || entry.date || new Date().toISOString(),
          amount: entry.amount || 0,
          type: txType,
          status: 'completed',
        };
      })
    : [];

  const quickActions = [
    {
      icon: Send,
      label: t('send'),
      description: 'Transfer money',
      color: 'bg-blue-500',
      link: '/send',
    },
    {
      icon: Download,
      label: t('withdraw'),
      description: 'Withdraw to bank',
      color: 'bg-green-500',
      link: '/withdraw',
    },
    {
      icon: MessageSquare,
      label: t('feedback'),
      description: 'Share feedback',
      color: 'bg-purple-500',
      link: '/feedback',
    },
    {
      icon: User,
      label: t('profile'),
      description: 'Manage account',
      color: 'bg-orange-500',
      link: '/profile',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {t('welcomeBack', { name: user?.username ?? user?.fullName?.split(' ')[0] ?? '' })}
              </h1>
              <p className="text-muted-foreground">{t('financialOverview')}</p>
            </div>
            {/* <Link to="/notifications">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
                  2
                </span>
              </Button>
            </Link> */}
          </motion.div>

          {/* Wallet Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5" />
                    <span className="text-sm opacity-90">{t('walletBalance')}</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                    {t('active')}
                  </Badge>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="text-4xl font-bold mb-1">
                    {formatCurrency(user?.walletBalance || 0)}
                  </div>
                  <TextToSpeechButton
                    text={numberToWords(user?.walletBalance || 0)}
                    lang={i18n.language}
                  />
                  {/* ...existing code... */}
                </div>
                <div className="flex items-center text-sm opacity-90">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+12% from last month</span>
                </div>
                <div className="text-xs opacity-75">
                  {t('nin')}: {user?.nin} • {t('email')}: {user?.email || '—'}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-4">{t('quickActions')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to={action.link}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div
                          className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}
                        >
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-semibold">{action.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('recentTransactions')}</CardTitle>
                    <CardDescription>Your latest account activity</CardDescription>
                  </div>
                  <Link to="/transactions">
                    <Button variant="ghost" size="sm">
                      {t('viewAll')}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No recent transactions</div>
                  ) : (
                    recentTransactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'credit'
                                ? 'bg-success/10'
                                : 'bg-destructive/10'
                            }`}
                          >
                            {transaction.type === 'credit' ? (
                              <ArrowDownLeft
                                className={`w-5 h-5 ${
                                  transaction.type === 'credit'
                                    ? 'text-success'
                                    : 'text-destructive'
                                }`}
                              />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-semibold ${
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
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
