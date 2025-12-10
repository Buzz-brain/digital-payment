import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, DollarSign, Calendar, CheckCircle, Clock, XCircle, Download, Filter } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF, formatCurrency, formatDate } from '@/lib/exportUtils';
import { apiPost, apiGet } from '@/lib/api';

export default function Disbursements() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    state: 'all',
    occupation: 'all',
    minBalance: '',
  });

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableOccupations, setAvailableOccupations] = useState<string[]>([]);

  // Disbursement form state
  const [disbursementForm, setDisbursementForm] = useState({
    batchName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setShowPreview(false);
  };

  // Fetch available filter values from backend
  useEffect(() => {
    let mounted = true;
    apiGet('/api/disbursements/filters')
      .then((res: any) => {
        if (!mounted) return;
        setAvailableStates(res.states || []);
        setAvailableOccupations(res.occupations || []);
      })
      .catch(() => {})
      .finally(() => {});
    return () => { mounted = false; };
  }, []);

  // Calculate preview count based on filters
  const calculatePreview = () => {
    setShowPreview(false);
    setPreviewCount(0);
    // Call backend to get exact count for given filters
    const normalizeFilters = (f: typeof filters) => {
      const out: any = {};
      if (f.status && f.status !== 'all') out.status = f.status;
      if (f.state && f.state !== 'all') out.state = f.state;
      if (f.occupation && f.occupation !== 'all') out.occupation = f.occupation;
      if (f.minBalance !== undefined && f.minBalance !== null && f.minBalance !== '') {
        const n = Number(f.minBalance);
        if (!Number.isNaN(n)) out.minBalance = n;
      }
      return Object.keys(out).length ? out : undefined;
    };

    const payload = { filters: normalizeFilters(filters) };
    setIsProcessing(true);
    apiPost('/api/disbursements/preview', payload)
      .then((res: any) => {
        setPreviewCount(res.count || 0);
        setShowPreview(true);
      })
      .catch((err: any) => {
        const serverMessage = err?.body?.message || err?.message || 'Failed to fetch preview';
        const parsed = parseValidationMessage(serverMessage);
        if (Object.keys(parsed).length > 0) setFieldErrors(parsed);
        toast({ title: 'Preview Error', description: serverMessage, variant: 'destructive' });
      })
      .finally(() => setIsProcessing(false));
  };

  const parseValidationMessage = (message: string) => {
    // Joi messages usually look like: '"batchName" is required' or '"filters.minBalance" must be a number'
    // We'll extract the quoted field token and return a mapping to an inline error.
    const fieldMatch = message && message.match(/"([^\"]+)"/);
    const result: Record<string, string> = {};
    if (fieldMatch && fieldMatch[1]) {
      const token = fieldMatch[1];
      // Normalize common names (filters.minBalance -> minBalance)
      const parts = token.split('.');
      const key = parts.length > 1 ? parts[parts.length - 1] : token;
      result[key] = message.replace(/^"[^"]+"\s*/, '');
    } else if (message) {
      // fallback: attach to general key
      result['general'] = message;
    }
    return result;
  };

  const handleDisburse = async () => {
    // Validate required fields according to backend schema
    if (!disbursementForm.batchName || !disbursementForm.batchName.trim()) {
      setFieldErrors({ batchName: 'Batch name is required' });
      toast({ title: 'Validation Error', description: 'Batch name is required', variant: 'destructive' });
      return;
    }
    if (!disbursementForm.amount || Number.isNaN(Number(disbursementForm.amount)) || Number(disbursementForm.amount) <= 0) {
      setFieldErrors({ amount: 'Enter a valid amount greater than 0' });
      toast({ title: 'Validation Error', description: 'Enter a valid amount greater than 0', variant: 'destructive' });
      return;
    }
    if (!disbursementForm.date) {
      setFieldErrors({ disbursementDate: 'Disbursement date is required' });
      toast({ title: 'Validation Error', description: 'Disbursement date is required', variant: 'destructive' });
      return;
    }

    if (!showPreview) {
      toast({ title: 'Preview Required', description: 'Please preview beneficiaries before disbursing', variant: 'destructive' });
      return;
    }

    // clear previous field errors
    setFieldErrors({});
    setIsProcessing(true);
    try {
      const normalizeFilters = (f: typeof filters) => {
        const out: any = {};
        if (f.status && f.status !== 'all') out.status = f.status;
        if (f.state && f.state !== 'all') out.state = f.state;
        if (f.occupation && f.occupation !== 'all') out.occupation = f.occupation;
        if (f.minBalance !== undefined && f.minBalance !== null && f.minBalance !== '') {
          const n = Number(f.minBalance);
          if (!Number.isNaN(n)) out.minBalance = n;
        }
        return Object.keys(out).length ? out : undefined;
      };

      const response: any = await apiPost('/api/disbursements', {
        batchName: disbursementForm.batchName,
        amount: Number(disbursementForm.amount),
        disbursementDate: disbursementForm.date,
        filters: normalizeFilters(filters),
        description: `Disbursement for ${previewCount} beneficiaries`
      });

      toast({ title: 'Success', description: `Disbursement processed for ${previewCount} beneficiaries` });

      // Reset form
      setDisbursementForm({ batchName: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setFilters({ status: 'all', state: 'all', occupation: 'all', minBalance: '' });
      setShowPreview(false);

      // Refetch history so UI updates immediately
      fetchHistory();
    } catch (err: any) {
      const serverMessage = err?.body?.message || err?.message || 'Failed to process disbursement';
      const parsed = parseValidationMessage(serverMessage);
      if (Object.keys(parsed).length > 0) setFieldErrors(parsed);
      toast({ title: 'Error', description: serverMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success hover:bg-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      default:
        return 'bg-muted';
    }
  };

  const handleExportCSV = () => {
    exportToCSV(
      history,
      `disbursements_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'Batch Name', key: 'batchName' },
        { header: 'Beneficiaries', key: 'beneficiaryCount' },
        { header: 'Total Amount', key: 'totalAmount' },
        { header: 'Date', key: 'disbursementDate' },
        { header: 'Status', key: 'status' },
      ]
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      history.map(d => ({
        ...d,
        totalAmount: formatCurrency(d.totalAmount),
        disbursementDate: formatDate(d.disbursementDate),
      })),
      `disbursements_${new Date().toISOString().split('T')[0]}`,
      [
        { header: 'Batch Name', key: 'batchName', width: 60 },
        { header: 'Beneficiaries', key: 'beneficiaryCount', width: 30 },
        { header: 'Total Amount', key: 'totalAmount', width: 35 },
        { header: 'Date', key: 'disbursementDate', width: 30 },
        { header: 'Status', key: 'status', width: 25 },
      ],
      'Disbursements Report',
      `Generated on ${new Date().toLocaleDateString()}`
    );
  };

  // Load disbursement history from backend
  const fetchHistory = () => {
    setHistoryLoading(true);
    apiGet('/api/disbursements')
      .then((res: any) => {
        // If API returns array directly use it, otherwise check res.disbursements
        const list = Array.isArray(res) ? res : (res.disbursements || []);
        setHistory(list);
      })
      .catch((err: any) => {
        toast({ title: 'Load Error', description: err?.message || 'Failed to load disbursement history', variant: 'destructive' });
      })
      .finally(() => { setHistoryLoading(false); });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <main className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Segment & Disburse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {fieldErrors.general && (
                  <p className="text-sm text-destructive">{fieldErrors.general}</p>
                )}
                {/* Step 1: Batch Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Step 1: Batch Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="batchName">Batch Name *</Label>
                      <Input
                        id="batchName"
                        placeholder="e.g., April 2025 Rural Support"
                        value={disbursementForm.batchName}
                        onChange={(e) => {
                          setDisbursementForm({ ...disbursementForm, batchName: e.target.value });
                          setFieldErrors(prev => { const copy = { ...prev }; delete copy.batchName; delete copy.general; return copy; });
                        }}
                      />
                      {fieldErrors.batchName && (
                        <p className="text-sm text-destructive mt-1">{fieldErrors.batchName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Disbursement Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          className="pl-10"
                          value={disbursementForm.date}
                          onChange={(e) => {
                            setDisbursementForm({ ...disbursementForm, date: e.target.value });
                            setFieldErrors(prev => { const copy = { ...prev }; delete copy.disbursementDate; delete copy.general; return copy; });
                          }}
                        />
                      </div>
                      {fieldErrors.disbursementDate && (
                        <p className="text-sm text-destructive mt-1">{fieldErrors.disbursementDate}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Region</Label>
                      <Select value={filters.state} onValueChange={(v) => handleFilterChange('state', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          {availableStates.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Select value={filters.occupation} onValueChange={(v) => handleFilterChange('occupation', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Occupations</SelectItem>
                          {availableOccupations.map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minBalance">Min. Balance (Optional)</Label>
                      <Input
                        id="minBalance"
                        type="number"
                        placeholder="e.g., 1000"
                        value={filters.minBalance}
                          onChange={(e) => { handleFilterChange('minBalance', e.target.value); setFieldErrors(prev => { const copy = { ...prev }; delete copy.minBalance; delete copy.general; return copy; }); }}
                      />
                      {fieldErrors.minBalance && (
                        <p className="text-sm text-destructive mt-1">{fieldErrors.minBalance}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" onClick={calculatePreview} className="w-full gap-2">
                    <Users className="w-4 h-4" />
                    Preview Recipients
                  </Button>
                </div>

                {/* Step 3: Amount & Preview */}
                {showPreview && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-semibold text-foreground">Step 3: Disbursement Amount</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Recipients Preview</span>
                        <Badge variant="secondary">{previewCount.toLocaleString()} beneficiaries</Badge>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-200 mb-3">
                        These users match your selected filters and will receive the disbursement.
                      </p>
                      {/* Summary of filters applied */}
                      <div className="flex flex-wrap gap-2">
                        {filters.status !== 'all' && <Badge variant="outline" className="text-xs">{filters.status}</Badge>}
                        {filters.state !== 'all' && <Badge variant="outline" className="text-xs">{filters.state}</Badge>}
                        {filters.occupation !== 'all' && <Badge variant="outline" className="text-xs">{filters.occupation}</Badge>}
                        {filters.minBalance && <Badge variant="outline" className="text-xs">Min Balance: ₦{filters.minBalance}</Badge>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount per Beneficiary (₦) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          placeholder="e.g., 10000"
                          className="pl-10"
                          value={disbursementForm.amount}
                          onChange={(e) => { setDisbursementForm({ ...disbursementForm, amount: e.target.value }); setFieldErrors(prev => { const copy = { ...prev }; delete copy.amount; delete copy.general; return copy; }); }}
                        />
                        {fieldErrors.amount && (
                          <p className="text-sm text-destructive mt-1">{fieldErrors.amount}</p>
                        )}
                      </div>
                    </div>

                    {/* Total calculation */}
                    {disbursementForm.amount && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Recipients</p>
                            <p className="text-lg font-semibold">{previewCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Per Person</p>
                            <p className="text-lg font-semibold">₦{parseFloat(disbursementForm.amount).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                            <p className="text-lg font-semibold text-primary">
                              ₦{(previewCount * parseFloat(disbursementForm.amount)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleDisburse} disabled={isProcessing} className="flex-1 gap-2">
                        <Send className="w-4 h-4" />
                        {isProcessing ? 'Processing...' : 'Confirm & Disburse'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Disbursement History</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historyLoading ? (
                    <p className="text-sm text-muted-foreground">Loading history...</p>
                  ) : history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No disbursements found.</p>
                  ) : (
                    history.map((disbursement) => (
                      <div
                        key={disbursement._id || disbursement.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(disbursement.status)}
                          <div>
                            <h4 className="font-medium">{disbursement.batchName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {disbursement.beneficiaryCount} beneficiaries •{' '}
                              {disbursement.disbursementDate ? new Date(disbursement.disbursementDate).toLocaleDateString() : new Date(disbursement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">
                              ₦{(disbursement.totalAmount || (disbursement.amount * (disbursement.beneficiaryCount || 0))).toLocaleString()}
                            </p>
                            <Badge className={getStatusColor(disbursement.status)}>
                              {disbursement.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
