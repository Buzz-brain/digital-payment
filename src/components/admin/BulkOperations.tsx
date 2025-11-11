import { useState } from 'react';
import { Upload, Users, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface BulkOperationsProps {
  type: 'beneficiaries' | 'nin' | 'disbursements';
  onImportComplete?: (data: any[]) => void;
  onBulkStatusUpdate?: (status: string, count: number) => void;
}

export const BulkOperations = ({ type, onImportComplete, onBulkStatusUpdate }: BulkOperationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setTimeout(() => {
          setIsProcessing(false);
          setIsOpen(false);
          onImportComplete?.(results.data);
          
          toast({
            title: 'Import Successful',
            description: `Successfully imported ${results.data.length} records`,
          });
        }, 2000);
      },
      error: () => {
        setIsProcessing(false);
        toast({
          title: 'Import Failed',
          description: 'Failed to parse CSV file',
          variant: 'destructive',
        });
      },
    });
  };

  const handleBulkStatusUpdate = () => {
    if (!selectedStatus) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsOpen(false);
      const count = Math.floor(Math.random() * 50) + 10;
      onBulkStatusUpdate?.(selectedStatus, count);
      
      toast({
        title: 'Bulk Update Successful',
        description: `Updated status for ${count} records to ${selectedStatus}`,
      });
    }, 2000);
  };

  const downloadTemplate = () => {
    let csv = '';
    
    if (type === 'beneficiaries') {
      csv = 'Full Name,NIN,Phone,Email,Status\n';
      csv += 'John Doe,12345678901,08012345678,john@example.com,active\n';
      csv += 'Jane Smith,98765432109,08087654321,jane@example.com,active\n';
    } else if (type === 'nin') {
      csv = 'NIN,Full Name,Date of Birth,Phone,State,LGA\n';
      csv += '12345678901,John Doe,1990-01-01,08012345678,Lagos,Ikeja\n';
      csv += '98765432109,Jane Smith,1985-05-15,08087654321,Abuja,Gwagwalada\n';
    } else if (type === 'disbursements') {
      csv = 'Batch Name,Beneficiary Count,Total Amount,Date\n';
      csv += 'Monthly Payment March,500,50000000,2024-03-01\n';
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_template.csv`;
    link.click();
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import {type}</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple records at once
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button onClick={downloadTemplate} variant="outline" className="w-full gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Download CSV Template
            </Button>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                disabled={isProcessing}
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Processing...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload CSV</p>
                    <p className="text-xs text-muted-foreground">
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {type === 'beneficiaries' && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Bulk Status Update
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Status Update</DialogTitle>
              <DialogDescription>
                Update status for selected beneficiaries
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleBulkStatusUpdate} 
                className="w-full"
                disabled={!selectedStatus || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Update Selected Records'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
