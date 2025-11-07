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
  date: string;
  priority: 'high' | 'medium' | 'low';
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

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ANN001',
    title: 'March 2025 Disbursement Schedule',
    content: 'The government disbursement for eligible citizens will be processed on March 15th, 2025. Funds will be credited directly to your DPI wallet. Please ensure your profile information is up to date.',
    category: 'disbursement',
    date: '2025-03-01T09:00:00',
    priority: 'high',
  },
  {
    id: 'ANN002',
    title: 'System Maintenance Notice',
    content: 'DPI services will undergo scheduled maintenance on March 20th from 2:00 AM to 4:00 AM. Services may be temporarily unavailable during this period.',
    category: 'maintenance',
    date: '2025-03-10T14:00:00',
    priority: 'medium',
  },
  {
    id: 'ANN003',
    title: 'New Features: Language Support',
    content: 'We are excited to announce support for Hausa, Yoruba, and Igbo languages! You can now access DPI in your preferred language through Settings.',
    category: 'update',
    date: '2025-03-05T10:30:00',
    priority: 'medium',
  },
  {
    id: 'ANN004',
    title: 'Enhanced Security Features',
    content: 'Your security is our priority. We have implemented additional security measures including two-factor authentication and biometric login options.',
    category: 'update',
    date: '2025-02-28T11:00:00',
    priority: 'high',
  },
  {
    id: 'ANN005',
    title: 'Community Feedback Initiative',
    content: 'Your voice matters! Share your experience and suggestions to help us improve DPI services. Access the feedback form in your dashboard.',
    category: 'general',
    date: '2025-02-20T15:00:00',
    priority: 'low',
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
