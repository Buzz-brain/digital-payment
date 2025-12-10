import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from '@/i18n/config';
import { speakText } from '@/utils/speakText';
import { ArrowLeft, Send, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiPost, apiGet } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SendMoney = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    description: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [recipientLookupLoading, setRecipientLookupLoading] = useState(false);
  const [recipientNotFound, setRecipientNotFound] = useState(false);

  const LARGE_TRANSFER_THRESHOLD = 100000; // ₦100,000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // validate NIN
    const recipient = (formData.recipient || '').trim();
    if (!/^[0-9]{11}$/.test(recipient)) {
      setLoading(false);
      const msg = 'Recipient NIN must be 11 digits';
      toast.error(msg);
      speakText(msg, i18n.language);
      return;
    }

    // ensure recipient exists and fullname known
    const ok = await lookupRecipient(recipient);
    if (!ok) {
      setLoading(false);
      const msg = 'Recipient NIN not found';
      toast.error(msg);
      speakText(msg, i18n.language);
      return;
    }

    const amountNum = Number(formData.amount);
    if (!amountNum || amountNum <= 0) {
      setLoading(false);
      const msg = 'Enter a valid amount';
      toast.error(msg);
      speakText(msg, i18n.language);
      return;
    }

    const payload = { recipient, amount: amountNum, description: formData.description };

    // If large transfer, ask for confirmation
    if (amountNum >= LARGE_TRANSFER_THRESHOLD) {
      setPendingPayload(payload);
      setConfirmOpen(true);
      setLoading(false);
      return;
    }

    await doTransfer(payload);
  };

  const doTransfer = async (payload: any) => {
    setLoading(true);
    try {
      const res: any = await apiPost('/api/transactions/send', payload);
      setLoading(false);
      setConfirmOpen(false);
      setPendingPayload(null);
      const msg = res?.message || `Successfully sent ₦${payload.amount} to ${recipientName || payload.recipient}`;
      toast.success(msg);
      speakText(msg, i18n.language);

      // Best-practice: refresh only the wallet and transactions resources
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        try {
          // fetch updated wallet
          const walletResp: any = await apiGet(`/api/wallet/${userId}`);
          // fetch updated transactions for logged in user
          const txResp: any = await apiGet('/api/transactions');

          // Update react-query cache so Transactions page refreshes immediately
          try {
            const txs = txResp?.transactions || txResp || [];
            queryClient.setQueryData(['transactions'], txs);
          } catch (e) {
            // ignore cache update errors
          }

          // Update react-query cache for wallet so Dashboard reads fresh data
          try {
            queryClient.setQueryData(['wallet', userId], walletResp);
          } catch (e) {
            // ignore
          }

          // update zustand auth store with new wallet info
          useAuthStore.setState((state: any) => ({
            wallet: walletResp || null,
            user: state.user ? { ...state.user, walletBalance: walletResp?.balance ?? state.user.walletBalance, wallet: walletResp ? { balance: walletResp.balance ?? 0, ledger: walletResp.ledger || [] } : state.user.wallet } : state.user,
          }));

          // Wait a tick to ensure zustand subscribers update before navigation
          setTimeout(() => {
            navigate('/dashboard');
          }, 0);
        } catch (e) {
          // fallback: still navigate, but may be stale
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Transfer failed';
      toast.error(msg);
      speakText(msg, i18n.language);
    }
  };

  // lookup recipient by NIN and set recipientName/flags
  const lookupRecipient = async (nin: string) => {
    const cleaned = (nin || '').trim();
    if (!/^[0-9]{11}$/.test(cleaned)) {
      setRecipientName(null);
      setRecipientNotFound(false);
      return false;
    }
    setRecipientLookupLoading(true);
    try {
      const res: any = await apiGet(`/api/nininfo/${cleaned}`);
      // controller returns fullName
      setRecipientName(res?.fullName || res?.fullName || res?.fullName);
      setRecipientNotFound(false);
      setRecipientLookupLoading(false);
      return true;
    } catch (err: any) {
      setRecipientName(null);
      setRecipientNotFound(true);
      setRecipientLookupLoading(false);
      return false;
    }
  };

  // debounce lookup when recipient changes
  useEffect(() => {
    const nin = (formData.recipient || '').trim();
    if (nin.length !== 11) {
      setRecipientName(null);
      setRecipientNotFound(false);
      return;
    }
    const t = setTimeout(() => {
      lookupRecipient(nin);
    }, 450);
    return () => clearTimeout(t);
  }, [formData.recipient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>

          <Card className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t("sendMoney")}</CardTitle>
                  <CardDescription>{t("transferFunds")}</CardDescription>
                </div>
              </div>
            </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipient" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("recipientNIN")}
                  </Label>
                  <Input
                    id="recipient"
                    placeholder="Enter recipient's NIN"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    required
                  />
                  <div className="mt-1 text-sm">
                    {recipientLookupLoading && <span className="text-muted-foreground">Checking recipient...</span>}
                    {!recipientLookupLoading && recipientName && <span className="text-success">Recipient: {recipientName}</span>}
                    {!recipientLookupLoading && recipientNotFound && <span className="text-destructive">Recipient NIN not found</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t("amount")}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Input
                    id="description"
                    placeholder="Enter description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || recipientNotFound}
                >
                  {loading ? t("processing") : t("sendMoney")}
                </Button>
              </form>
                {/* Confirmation dialog for large transfers */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Transfer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>You're about to send <strong>₦{pendingPayload?.amount}</strong> to <strong>{recipientName || pendingPayload?.recipient}</strong>.</p>
                      <p className="text-sm text-muted-foreground">This action cannot be undone. Please confirm you want to proceed.</p>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => { setConfirmOpen(false); setPendingPayload(null); }}>Cancel</Button>
                        <Button onClick={() => pendingPayload && doTransfer(pendingPayload)} disabled={loading || !pendingPayload}>{loading ? 'Processing...' : 'Confirm'}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SendMoney;
