import { z } from 'zod';

export const userRoleEnum = z.enum(['CREATOR', 'COLLABORATOR', 'TEAM_MEMBER']);

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: userRoleEnum.default('CREATOR'),
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters').optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']).default('USD'),
  niche: z.string().optional(),
  avatarSticker: z.string().default('camera'),
  hourlyRate: z.number().nonnegative().optional(), // in cents
  inviteCode: z.string().optional(),
});

export const collaborationStatusEnum = z.enum([
  'Pitched',
  'Negotiating',
  'Signed',
  'In Production',
  'Delivered',
  'Paid',
  'Cancelled',
]);

export const paymentStatusEnum = z.enum(['Unpaid', 'Partial', 'Paid']);

export const deliverableItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  title: z.string().min(1, 'Deliverable title is required'),
  completed: z.boolean().default(false),
  dueDate: z.string().optional(),
});

export const collaborationSchema = z.object({
  brandId: z.string().optional(),
  brandName: z.string().min(1, 'Brand name is required'),
  title: z.string().min(2, 'Collaboration title is required'),
  dealValue: z.number().int().nonnegative('Deal value must be positive (in cents)'),
  currency: z.string().default('USD'),
  deliverables: z.array(deliverableItemSchema).default([]),
  startDate: z.string().min(1, 'Start date is required'),
  deadlineDate: z.string().min(1, 'Deadline date is required'),
  status: collaborationStatusEnum.default('Pitched'),
  paymentStatus: paymentStatusEnum.default('Unpaid'),
  collaboratorUserId: z.string().optional(),
  assignedTeamUserIds: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const platformEnum = z.enum([
  'YouTube',
  'Instagram',
  'TikTok',
  'Twitter/X',
  'LinkedIn',
  'Blog',
  'Podcast',
]);

export const contentFormatEnum = z.enum([
  'Reel',
  'Short',
  'Video',
  'Post',
  'Story',
  'Blog',
]);

export const contentStatusEnum = z.enum([
  'Planned',
  'Filming',
  'Editing',
  'Published',
]);

export const contentSchema = z.object({
  collaborationId: z.string().optional(),
  title: z.string().min(2, 'Content title is required'),
  platform: platformEnum.default('Instagram'),
  type: contentFormatEnum.default('Reel'),
  publishDate: z.string().min(1, 'Publish date is required'),
  status: contentStatusEnum.default('Planned'),
  link: z.string().url().optional().or(z.literal('')),
  estimatedRevenue: z.number().int().nonnegative().optional().default(0),
  notes: z.string().optional(),
});

export const performanceMetricSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  views: z.number().int().nonnegative().default(0),
  likes: z.number().int().nonnegative().default(0),
  comments: z.number().int().nonnegative().default(0),
  shares: z.number().int().nonnegative().default(0),
  saves: z.number().int().nonnegative().default(0),
  followersGained: z.number().int().default(0),
});

export const expenseCategoryEnum = z.enum([
  'equipment',
  'props',
  'travel',
  'editing',
  'ads',
  'software',
  'team_payment',
  'other',
]);

export const expenseSchema = z.object({
  title: z.string().min(2, 'Expense title is required'),
  category: expenseCategoryEnum.default('other'),
  amount: z.number().int().positive('Amount must be positive (in cents)'),
  date: z.string().min(1, 'Date is required'),
  linkedContentId: z.string().optional(),
  linkedCollaborationId: z.string().optional(),
  receiptUrl: z.string().optional(),
  approvalStatus: z.enum(['Pending', 'Approved', 'Rejected']).default('Approved'),
  isRecurring: z.boolean().default(false),
});

export const taskStatusEnum = z.enum(['To Do', 'In Progress', 'Review', 'Done']);
export const taskPriorityEnum = z.enum(['Low', 'Medium', 'High', 'Urgent']);

export const taskSchema = z.object({
  collaborationId: z.string().optional(),
  contentId: z.string().optional(),
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  status: taskStatusEnum.default('To Do'),
  priority: taskPriorityEnum.default('Medium'),
  dueDate: z.string().min(1, 'Due date is required'),
  estimatedHours: z.number().nonnegative().default(1),
  actualHours: z.number().nonnegative().default(0),
});

export const timeLogSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  durationMinutes: z.number().nonnegative().default(0),
  isRunning: z.boolean().default(false),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  userId: z.string().optional(),
  recipientName: z.string().min(1, 'Recipient name is required'),
  amount: z.number().int().positive('Amount must be positive (in cents)'),
  status: z.enum(['Pending', 'Approved', 'Paid']).default('Pending'),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
  type: z.enum(['TEAM_PAYOUT', 'BRAND_INFLOW']).default('TEAM_PAYOUT'),
  referenceNote: z.string().optional(),
});

export const scrapbookItemSchema = z.object({
  stickerId: z.string(),
  stickerType: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().default(80),
  height: z.number().default(80),
  rotation: z.number().default(0),
  noteText: z.string().optional(),
  color: z.string().optional(),
  zIndex: z.number().default(1),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: userRoleEnum,
  collaborationIds: z.array(z.string()).optional(),
  hourlyRate: z.number().nonnegative().optional(),
});
