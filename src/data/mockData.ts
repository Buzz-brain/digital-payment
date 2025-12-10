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
