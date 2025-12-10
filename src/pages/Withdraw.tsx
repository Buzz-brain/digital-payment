import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from '@/i18n/config';
import { speakText } from '@/utils/speakText';
import { ArrowLeft, Wallet, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiPost } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Withdraw = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    method: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    description: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const LARGE_WITHDRAW_THRESHOLD = 100000; // ₦100,000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const amountNum = Number(formData.amount);
    if (!amountNum || amountNum <= 0) {
      setLoading(false);
      toast.error(t('enterValidAmount'));
      return;
    }

    const payload: any = { amount: amountNum, note: formData.description };

    // attach bankInfo when method is bank
    if (formData.method === 'bank') {
      payload.bankInfo = {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
      };
    } else if (formData.method) {
      // include method in note for other methods
      payload.note = (payload.note ? payload.note + ' - ' : '') + `method:${formData.method}`;
    }

    if (amountNum >= LARGE_WITHDRAW_THRESHOLD) {
      setPendingPayload(payload);
      setConfirmOpen(true);
      setLoading(false);
      return;
    }

    await doWithdraw(payload);
  };

  const doWithdraw = async (payload: any) => {
    setLoading(true);
    try {
      const res: any = await apiPost('/api/withdrawals', payload);
      setLoading(false);
      setConfirmOpen(false);
      setPendingPayload(null);
      const msg = res?.message || t('withdrawalRequestSuccess', { amount: payload.amount });
      toast.success(msg);
      speakText(msg, i18n.language);
      navigate('/dashboard');
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || t('withdrawalFailed'));
      const msg = err?.message || t('withdrawalFailed');
      toast.error(msg);
      speakText(msg, i18n.language);
    }
  };

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
                <div className="p-3 rounded-full bg-success/10">
                  <Wallet className="h-6 w-6 text-success" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t("withdraw")}</CardTitle>
                  <CardDescription>{t("withdrawFunds")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("amount")}</Label>
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
                  <Label htmlFor="method">{t("withdrawalMethod")}</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => setFormData({ ...formData, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="agent">Agent Withdrawal</SelectItem>
                      <SelectItem value="atm">ATM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.method === "bank" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input
                        id="accountName"
                        placeholder="Account holder name"
                        value={formData.accountName}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {t("bankName")}
                      </Label>
                      <Input
                        id="bankName"
                        placeholder="Enter bank name"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">{t("accountNumber")}</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Enter account number"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        required
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
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
                  disabled={loading}
                >
                  {loading ? t("processing") : t("withdraw")}
                </Button>
              </form>
            </CardContent>
          </Card>
            <Dialog open={confirmOpen} onOpenChange={(open) => setConfirmOpen(open)}>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('confirmWithdrawalTitle')}</DialogTitle>
                </DialogHeader>
                <div className="mt-2">
                  <p className="mb-4">{t('confirmWithdrawalDesc', { amount: pendingPayload?.amount })}</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => { setConfirmOpen(false); setPendingPayload(null); }}>{t('cancel')}</Button>
                    <Button onClick={async () => { if (pendingPayload) await doWithdraw(pendingPayload); }} disabled={!pendingPayload || loading}>{loading ? t('processing') : t('confirm')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </motion.div>
      </div>
    </div>
  );
};

export default Withdraw;
