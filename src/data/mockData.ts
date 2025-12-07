export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'disbursement' | 'update' | 'maintenance' | 'general';
  date?: string;
  priority: 'high' | 'medium' | 'low';
  createdBy?: string;
  published?: boolean;
  publishedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  date: string;
  read: boolean;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    type: 'credit',
    amount: 5000,
    description: 'Government Disbursement - March 2025',
    date: '2025-03-15T10:30:00',
    status: 'completed',
    reference: 'DPI-GOV-2025-001',
  },
  {
    id: 'TXN002',
    type: 'debit',
    amount: 1500,
    description: 'Withdrawal to Bank Account',
    date: '2025-03-14T14:20:00',
    status: 'completed',
    reference: 'DPI-WDR-2025-002',
  },
  {
    id: 'TXN003',
    type: 'credit',
    amount: 3000,
    description: 'Transfer from Fatima Ibrahim',
    date: '2025-03-12T09:15:00',
    status: 'completed',
    reference: 'DPI-TRF-2025-003',
  },
  {
    id: 'TXN004',
    type: 'debit',
    amount: 500,
    description: 'Bill Payment - Electricity',
    date: '2025-03-10T16:45:00',
    status: 'completed',
    reference: 'DPI-BILL-2025-004',
  },
  {
    id: 'TXN005',
    type: 'credit',
    amount: 10000,
    description: 'Government Disbursement - February 2025',
    date: '2025-02-15T11:00:00',
    status: 'completed',
    reference: 'DPI-GOV-2025-005',
  },
  {
    id: 'TXN006',
    type: 'debit',
    amount: 2000,
    description: 'Transfer to Chukwudi Okonkwo',
    date: '2025-02-10T13:30:00',
    status: 'completed',
    reference: 'DPI-TRF-2025-006',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'NOT001',
    title: 'Disbursement Received',
    message: 'You have received ₦5,000 from Government Disbursement - March 2025',
    type: 'success',
    date: '2025-03-15T10:30:00',
    read: false,
  },
  {
    id: 'NOT002',
    title: 'Profile Update Required',
    message: 'Please update your profile information to ensure smooth disbursement processing.',
    type: 'warning',
    date: '2025-03-14T09:00:00',
    read: false,
  },
  {
    id: 'NOT003',
    title: 'Transaction Successful',
    message: 'Your withdrawal of ₦1,500 has been processed successfully.',
    type: 'success',
    date: '2025-03-14T14:20:00',
    read: true,
  },
  {
    id: 'NOT004',
    title: 'New Announcement',
    message: 'Check out the latest announcement about March 2025 disbursement schedule.',
    type: 'info',
    date: '2025-03-01T09:05:00',
    read: true,
  },
];
