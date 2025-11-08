export interface Beneficiary {
  id: string;
  nin: string;
  fullName: string;
  phone: string;
  email: string;
  balance: number;
  status: 'active' | 'inactive' | 'suspended';
  registeredDate: string;
  lastLogin: string;
  totalReceived: number;
  totalWithdrawn: number;
}

export interface DisbursementRecord {
  id: string;
  batchName: string;
  totalAmount: number;
  beneficiaryCount: number;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  date: string;
  uploadedBy: string;
}

export interface AdminFeedback {
  id: string;
  userId: string;
  userName: string;
  category: string;
  message: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
  priority: 'high' | 'medium' | 'low';
}

export const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'BEN001',
    nin: '12345678901',
    fullName: 'Adebayo Johnson',
    phone: '+234 801 234 5678',
    email: 'adebayo@example.com',
    balance: 15000,
    status: 'active',
    registeredDate: '2024-01-15',
    lastLogin: '2025-03-15T14:30:00',
    totalReceived: 50000,
    totalWithdrawn: 35000,
  },
  {
    id: 'BEN002',
    nin: '98765432109',
    fullName: 'Fatima Ibrahim',
    phone: '+234 802 345 6789',
    email: 'fatima@example.com',
    balance: 8500,
    status: 'active',
    registeredDate: '2024-02-20',
    lastLogin: '2025-03-14T10:15:00',
    totalReceived: 30000,
    totalWithdrawn: 21500,
  },
  {
    id: 'BEN003',
    nin: '11223344556',
    fullName: 'Chukwudi Okonkwo',
    phone: '+234 803 456 7890',
    email: 'chukwudi@example.com',
    balance: 12000,
    status: 'active',
    registeredDate: '2024-01-10',
    lastLogin: '2025-03-13T16:45:00',
    totalReceived: 45000,
    totalWithdrawn: 33000,
  },
  {
    id: 'BEN004',
    nin: '55667788990',
    fullName: 'Blessing Udoh',
    phone: '+234 804 567 8901',
    email: 'blessing@example.com',
    balance: 5000,
    status: 'inactive',
    registeredDate: '2024-03-05',
    lastLogin: '2025-02-28T09:20:00',
    totalReceived: 20000,
    totalWithdrawn: 15000,
  },
  {
    id: 'BEN005',
    nin: '66778899001',
    fullName: 'Yusuf Mohammed',
    phone: '+234 805 678 9012',
    email: 'yusuf@example.com',
    balance: 0,
    status: 'suspended',
    registeredDate: '2024-02-14',
    lastLogin: '2025-03-01T11:30:00',
    totalReceived: 25000,
    totalWithdrawn: 25000,
  },
];

export const mockDisbursements: DisbursementRecord[] = [
  {
    id: 'DIS001',
    batchName: 'March 2025 Rural Support',
    totalAmount: 5000000,
    beneficiaryCount: 1000,
    status: 'completed',
    date: '2025-03-15T10:00:00',
    uploadedBy: 'Admin User',
  },
  {
    id: 'DIS002',
    batchName: 'February 2025 Agricultural Aid',
    totalAmount: 3500000,
    beneficiaryCount: 700,
    status: 'completed',
    date: '2025-02-15T10:00:00',
    uploadedBy: 'Admin User',
  },
  {
    id: 'DIS003',
    batchName: 'April 2025 Education Grant',
    totalAmount: 2000000,
    beneficiaryCount: 400,
    status: 'pending',
    date: '2025-04-15T10:00:00',
    uploadedBy: 'Admin User',
  },
];

export const mockAdminFeedback: AdminFeedback[] = [
  {
    id: 'FB001',
    userId: 'BEN001',
    userName: 'Adebayo Johnson',
    category: 'technical',
    message: 'I am unable to withdraw funds. The system shows an error when I try.',
    date: '2025-03-14T14:30:00',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'FB002',
    userId: 'BEN002',
    userName: 'Fatima Ibrahim',
    category: 'suggestion',
    message: 'It would be great to have mobile app support for easier access.',
    date: '2025-03-13T10:15:00',
    status: 'reviewed',
    priority: 'medium',
  },
  {
    id: 'FB003',
    userId: 'BEN003',
    userName: 'Chukwudi Okonkwo',
    category: 'complaint',
    message: 'Disbursement was delayed this month. Please improve the timeline.',
    date: '2025-03-12T16:45:00',
    status: 'resolved',
    priority: 'medium',
  },
  {
    id: 'FB004',
    userId: 'BEN004',
    userName: 'Blessing Udoh',
    category: 'inquiry',
    message: 'How can I update my phone number on my profile?',
    date: '2025-03-11T09:20:00',
    status: 'resolved',
    priority: 'low',
  },
];

export const mockAdminStats = {
  totalUsers: 15432,
  activeUsers: 12890,
  totalDisbursed: 125000000,
  pendingDisbursements: 3,
  monthlyGrowth: 12.5,
  transactionVolume: 45678,
};

export const mockAnalyticsData = {
  userGrowth: [
    { month: 'Jan', users: 8500 },
    { month: 'Feb', users: 10200 },
    { month: 'Mar', users: 12890 },
    { month: 'Apr', users: 15432 },
  ],
  disbursementTrends: [
    { month: 'Jan', amount: 28000000 },
    { month: 'Feb', amount: 35000000 },
    { month: 'Mar', amount: 42000000 },
    { month: 'Apr', amount: 50000000 },
  ],
  transactionTypes: [
    { name: 'Government Disbursement', value: 60 },
    { name: 'P2P Transfer', value: 25 },
    { name: 'Withdrawals', value: 15 },
  ],
  statusDistribution: [
    { status: 'Active', count: 12890 },
    { status: 'Inactive', count: 2000 },
    { status: 'Suspended', count: 542 },
  ],
};
