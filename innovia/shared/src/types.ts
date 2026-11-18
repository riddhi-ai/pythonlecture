export type UserRole = 'CREATOR' | 'COLLABORATOR' | 'TEAM_MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarSticker?: string;
  hourlyRate?: number; // stored in cents/paise (minor units)
  workspaceId: string;
  linkedCollaborationIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';
  niche?: string;
  bio?: string;
  inviteCode?: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  workspaceId: string;
  name: string;
  logoUrl?: string;
  contactName?: string;
  contactEmail?: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

export type CollaborationStatus =
  | 'Pitched'
  | 'Negotiating'
  | 'Signed'
  | 'In Production'
  | 'Delivered'
  | 'Paid'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';

export interface DeliverableItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface AssetBrief {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
  uploaderRole: string;
}

export interface CollabComment {
  id: string;
  authorName: string;
  role: UserRole;
  comment: string;
  date: string;
}

export interface Collaboration {
  id: string;
  workspaceId: string;
  brandId?: string;
  brandName: string;
  title: string;
  dealValue: number; // in cents
  currency: string;
  deliverables: DeliverableItem[];
  startDate: string;
  deadlineDate: string;
  status: CollaborationStatus;
  paymentStatus: PaymentStatus;
  collaboratorUserId?: string; // Brand login linkage
  assignedTeamUserIds: string[];
  notes?: string;
  briefs?: AssetBrief[];
  feedbackComments?: CollabComment[];
  createdAt: string;
  updatedAt: string;
}

export type PlatformType =
  | 'YouTube'
  | 'Instagram'
  | 'TikTok'
  | 'Twitter/X'
  | 'LinkedIn'
  | 'Blog'
  | 'Podcast';

export type ContentFormat = 'Reel' | 'Short' | 'Video' | 'Post' | 'Story' | 'Blog';

export type ContentStatus = 'Planned' | 'Filming' | 'Editing' | 'Published';

export interface Content {
  id: string;
  workspaceId: string;
  collaborationId?: string;
  collaborationTitle?: string;
  title: string;
  platform: PlatformType;
  type: ContentFormat;
  publishDate: string;
  status: ContentStatus;
  link?: string;
  estimatedRevenue?: number; // in cents
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceMetric {
  id: string;
  workspaceId: string;
  contentId: string;
  contentTitle?: string;
  platform?: PlatformType;
  type?: ContentFormat;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
  engagementRate: number; // calculated: (likes + comments + shares + saves) / views * 100
  recordedAt: string;
}

export type ExpenseCategory =
  | 'equipment'
  | 'props'
  | 'travel'
  | 'editing'
  | 'ads'
  | 'software'
  | 'team_payment'
  | 'other';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Expense {
  id: string;
  workspaceId: string;
  title: string;
  category: ExpenseCategory;
  amount: number; // in cents
  date: string;
  linkedContentId?: string;
  linkedCollaborationId?: string;
  receiptUrl?: string;
  approvalStatus: ApprovalStatus;
  isRecurring?: boolean;
  submittedByUserId?: string;
  submittedByName?: string;
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  workspaceId: string;
  title: string;
  category: ExpenseCategory;
  amount: number; // in cents
  frequency: 'monthly';
  nextRunDate: string;
  active: boolean;
  createdAt: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  workspaceId: string;
  collaborationId?: string;
  collaborationTitle?: string;
  contentId?: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  workspaceId: string;
  taskId: string;
  taskTitle?: string;
  userId: string;
  userName?: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  isRunning: boolean;
  notes?: string;
  createdAt: string;
}

export type PaymentType = 'TEAM_PAYOUT' | 'BRAND_INFLOW';

export interface Payment {
  id: string;
  workspaceId: string;
  userId?: string;
  recipientName: string;
  amount: number; // in cents
  status: 'Pending' | 'Approved' | 'Paid';
  dueDate?: string;
  paidDate?: string;
  type: PaymentType;
  referenceNote?: string;
  createdAt: string;
}

export type NotificationType =
  | 'DEADLINE'
  | 'PAYMENT'
  | 'DELIVERABLE'
  | 'SYSTEM'
  | 'INSIGHT';

export interface Notification {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export type InsightType = 'HIGH_MARGIN' | 'TIME_SINK' | 'PROFIT_STAR' | 'EFFICIENCY';

export interface Insight {
  id: string;
  workspaceId: string;
  type: InsightType;
  title: string;
  body: string;
  verdictSticker: string;
  createdAt: string;
}

export interface ScrapbookItem {
  id: string;
  workspaceId: string;
  userId: string;
  stickerId: string;
  stickerType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  noteText?: string;
  color?: string;
  zIndex: number;
}

export interface ImportJob {
  id: string;
  workspaceId: string;
  entityType: 'content' | 'expenses';
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: string[];
  createdAt: string;
}

export type WorthItVerdict = 'Totally worth it!' | 'Meh' | 'Not worth it';

export interface FinancialSummary {
  totalRevenue: number; // in cents
  totalExpenses: number; // in cents
  netProfit: number; // in cents
  profitMargin: number; // percentage (e.g. 52.3)
  totalHours: number; // hours (e.g. 34.5)
  profitPerHour: number; // in cents/hour
  averageEngagement: number; // percentage
  worthItScore: number; // 0 to 100
  worthItVerdict: WorthItVerdict;
  worthItSticker: string;
}

export interface CollabFinancialSummary extends FinancialSummary {
  collaborationId: string;
  title: string;
  brandName: string;
  deliverablesCount: number;
  completedDeliverables: number;
}

export interface ContentFinancialSummary extends FinancialSummary {
  contentId: string;
  title: string;
  platform: PlatformType;
  type: ContentFormat;
  views: number;
}

export interface AuthResponse {
  user: User;
  workspace: Workspace;
  accessToken: string;
  refreshToken: string;
}
