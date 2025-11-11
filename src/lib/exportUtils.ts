import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export const exportToCSV = (data: any[], filename: string, columns?: ExportColumn[]) => {
  const csvData = columns 
    ? data.map(row => {
        const obj: any = {};
        columns.forEach(col => {
          obj[col.header] = row[col.key];
        });
        return obj;
      })
    : data;

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const exportToPDF = (
  data: any[], 
  filename: string, 
  columns: ExportColumn[],
  title?: string,
  subtitle?: string
) => {
  const doc = new jsPDF();
  
  // Add title
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }
  
  // Add subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, 14, title ? 22 : 15);
  }
  
  // Prepare table data
  const tableData = data.map(row => 
    columns.map(col => row[col.key] || '')
  );
  
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: tableData,
    startY: title && subtitle ? 28 : title ? 20 : 10,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 68, 204] },
    columnStyles: columns.reduce((acc, col, idx) => {
      if (col.width) acc[idx] = { cellWidth: col.width };
      return acc;
    }, {} as any),
  });
  
  doc.save(`${filename}.pdf`);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
