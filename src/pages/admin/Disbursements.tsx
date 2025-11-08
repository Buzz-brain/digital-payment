import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNavbar } from '@/components/admin/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockDisbursements } from '@/data/mockAdminData';
import { toast } from '@/hooks/use-toast';

export default function Disbursements() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: 'Upload Successful',
            description: `${file.name} has been processed successfully`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
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
                <CardTitle>New Disbursement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchName">Batch Name</Label>
                    <Input id="batchName" placeholder="e.g., April 2025 Rural Support" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Disbursement Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="date" type="date" className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csvFile">Upload CSV File</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Button disabled={isUploading}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground">
                        Processing... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">CSV Format Required</p>
                    <p className="text-muted-foreground">
                      Columns: NIN, Full Name, Amount, Phone Number
                    </p>
                  </div>
                </div>
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
                <CardTitle>Disbursement History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDisbursements.map((disbursement) => (
                    <div
                      key={disbursement.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(disbursement.status)}
                        <div>
                          <h4 className="font-medium">{disbursement.batchName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {disbursement.beneficiaryCount} beneficiaries •{' '}
                            {new Date(disbursement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            ₦{disbursement.totalAmount.toLocaleString()}
                          </p>
                          <Badge className={getStatusColor(disbursement.status)}>
                            {disbursement.status}
                          </Badge>
                        </div>
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
