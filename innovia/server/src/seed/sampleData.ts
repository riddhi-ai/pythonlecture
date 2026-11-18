import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.js';
import { WorkspaceModel } from '../models/Workspace.js';
import { BrandModel } from '../models/Brand.js';
import { CollaborationModel } from '../models/Collaboration.js';
import { ContentModel } from '../models/Content.js';
import { PerformanceMetricModel } from '../models/PerformanceMetric.js';
import { ExpenseModel } from '../models/Expense.js';
import { RecurringExpenseModel } from '../models/RecurringExpense.js';
import { TaskModel } from '../models/Task.js';
import { TimeLogModel } from '../models/TimeLog.js';
import { PaymentModel } from '../models/Payment.js';
import { NotificationModel } from '../models/Notification.js';
import { ScrapbookItemModel } from '../models/ScrapbookItem.js';
import { InsightEngine } from '../services/insightEngine.js';

export async function seedWorkspaceData(workspaceIdStr: string, creatorUserIdStr: string) {
  const wsId = new mongoose.Types.ObjectId(workspaceIdStr);
  const creatorId = new mongoose.Types.ObjectId(creatorUserIdStr);

  // 1. Create Team Member (Editor) and Collaborator (Brand Partner)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  let editor = await UserModel.findOne({ email: 'editor@innovia.io' });
  if (!editor) {
    editor = await UserModel.create({
      name: 'Marcus Vance',
      email: 'editor@innovia.io',
      passwordHash,
      role: 'TEAM_MEMBER',
      avatarSticker: 'clapperboard',
      hourlyRate: 3500, // $35/hr
      workspaceId: wsId,
    });
  }

  let brandSponsor = await UserModel.findOne({ email: 'sponsor@innovia.io' });
  if (!brandSponsor) {
    brandSponsor = await UserModel.create({
      name: 'Sarah Chen (GlowTech)',
      email: 'sponsor@innovia.io',
      passwordHash,
      role: 'COLLABORATOR',
      avatarSticker: 'handshake',
      workspaceId: wsId,
    });
  }

  // Clear existing items in this workspace to re-seed cleanly
  await BrandModel.deleteMany({ workspaceId: wsId });
  await CollaborationModel.deleteMany({ workspaceId: wsId });
  await ContentModel.deleteMany({ workspaceId: wsId });
  await PerformanceMetricModel.deleteMany({ workspaceId: wsId });
  await ExpenseModel.deleteMany({ workspaceId: wsId });
  await RecurringExpenseModel.deleteMany({ workspaceId: wsId });
  await TaskModel.deleteMany({ workspaceId: wsId });
  await TimeLogModel.deleteMany({ workspaceId: wsId });
  await PaymentModel.deleteMany({ workspaceId: wsId });
  await NotificationModel.deleteMany({ workspaceId: wsId });
  await ScrapbookItemModel.deleteMany({ workspaceId: wsId });

  // 2. Brands
  const glowTech = await BrandModel.create({
    workspaceId: wsId,
    name: 'GlowTech Audio',
    contactName: 'Sarah Chen',
    contactEmail: 'sponsor@innovia.io',
    category: 'Consumer Audio',
    notes: 'Premium wireless acoustics and noise-cancelling lifestyle accessories.',
  });

  const apexPeak = await BrandModel.create({
    workspaceId: wsId,
    name: 'Apex Peak Gear',
    contactName: 'Dave Miller',
    contactEmail: 'dave@apexpeak.example.com',
    category: 'Travel & Camera Gear',
    notes: 'Rugged modular backpacks for outdoor videographers.',
  });

  const lumina = await BrandModel.create({
    workspaceId: wsId,
    name: 'Lumina Studio Lighting',
    contactName: 'Elena Rostova',
    contactEmail: 'elena@lumina.example.com',
    category: 'Studio Hardware',
    notes: 'Bi-color smart RGB LED panel and key-light setups.',
  });

  // 3. Collaborations
  const collab1 = await CollaborationModel.create({
    workspaceId: wsId,
    brandId: glowTech._id,
    brandName: 'GlowTech Audio',
    title: 'GlowTech Pro Wireless Earbuds Launch',
    dealValue: 450000, // $4,500.00
    currency: 'USD',
    startDate: '2026-10-15',
    deadlineDate: '2026-11-20',
    status: 'In Production',
    paymentStatus: 'Partial',
    collaboratorUserId: brandSponsor._id,
    assignedTeamUserIds: [editor._id],
    deliverables: [
      { id: 'del-1', title: '60s Dedicated YouTube Integration', completed: true, dueDate: '2026-11-10' },
      { id: 'del-2', title: '1x Instagram Reel / TikTok Short', completed: false, dueDate: '2026-11-18' },
      { id: 'del-3', title: '3x Story Swipe-Up Frames with Discount Code', completed: false, dueDate: '2026-11-20' },
    ],
    briefs: [
      {
        id: 'b1',
        title: 'Q4 Brand Guidelines & Talking Points.pdf',
        url: 'https://assets.innovia.local/glowtech-brief.pdf',
        uploadedAt: '2026-10-16T10:00:00Z',
        uploaderRole: 'COLLABORATOR',
      },
    ],
    feedbackComments: [
      {
        id: 'c1',
        authorName: 'Sarah Chen (GlowTech)',
        role: 'COLLABORATOR',
        comment: 'We loved the rough audio demo! Please emphasize the active noise cancellation around minute 0:30.',
        date: '2026-10-25T14:30:00Z',
      },
      {
        id: 'c2',
        authorName: 'Alex Rivera',
        role: 'CREATOR',
        comment: 'Will do! Marcus has revised the audio cue and added the visual EQ graphic overlay.',
        date: '2026-10-26T09:15:00Z',
      },
    ],
    notes: 'Primary sponsorship for Q4 holiday guide. $2,250 deposit received.',
  });

  // Link collab to sponsor user
  brandSponsor.linkedCollaborationIds = [collab1._id as any];
  await brandSponsor.save();

  const collab2 = await CollaborationModel.create({
    workspaceId: wsId,
    brandId: apexPeak._id,
    brandName: 'Apex Peak Gear',
    title: 'Apex Peak Modular Camera Pack Showcase',
    dealValue: 320000, // $3,200.00
    currency: 'USD',
    startDate: '2026-09-01',
    deadlineDate: '2026-10-10',
    status: 'Delivered',
    paymentStatus: 'Paid',
    assignedTeamUserIds: [editor._id],
    deliverables: [
      { id: 'del-4', title: 'What is in My Camera Bag 2026 Video', completed: true, dueDate: '2026-10-01' },
      { id: 'del-5', title: '2x High-Res Photography Carousel Posts', completed: true, dueDate: '2026-10-05' },
    ],
    notes: 'Completed ahead of schedule. Highly satisfied client.',
  });

  const collab3 = await CollaborationModel.create({
    workspaceId: wsId,
    brandId: lumina._id,
    brandName: 'Lumina Studio Lighting',
    title: 'Lumina Smart RGB Keylight Studio Overhaul',
    dealValue: 280000, // $2,800.00
    currency: 'USD',
    startDate: '2026-08-15',
    deadlineDate: '2026-09-20',
    status: 'Paid',
    paymentStatus: 'Paid',
    assignedTeamUserIds: [editor._id],
    deliverables: [
      { id: 'del-6', title: 'Studio Lighting Setup Masterclass Reel', completed: true, dueDate: '2026-09-12' },
      { id: 'del-7', title: 'Twitter / X Thread on Lighting Angles', completed: true, dueDate: '2026-09-15' },
    ],
    notes: 'All fees paid in full with 15% affiliate performance kicker.',
  });

  // 4. Content Items & Performance Metrics
  const c1 = await ContentModel.create({
    workspaceId: wsId,
    collaborationId: collab1._id,
    title: 'My Dream Desk & Audio Setup for 2026 (Feat. GlowTech)',
    platform: 'YouTube',
    type: 'Video',
    publishDate: '2026-10-28',
    status: 'Published',
    link: 'https://youtube.com/watch?v=demo123',
    estimatedRevenue: 450000,
  });

  await PerformanceMetricModel.create({
    workspaceId: wsId,
    contentId: c1._id,
    views: 86400,
    likes: 6420,
    comments: 485,
    shares: 390,
    saves: 920,
    followersGained: 420,
  });

  const c2 = await ContentModel.create({
    workspaceId: wsId,
    collaborationId: collab3._id,
    title: '3 Lighting Hacks That Instantly Make Your Reels Cinematic',
    platform: 'Instagram',
    type: 'Reel',
    publishDate: '2026-09-14',
    status: 'Published',
    link: 'https://instagram.com/reel/demo456',
    estimatedRevenue: 280000,
  });

  await PerformanceMetricModel.create({
    workspaceId: wsId,
    contentId: c2._id,
    views: 148500,
    likes: 12400,
    comments: 890,
    shares: 1650,
    saves: 4200,
    followersGained: 1250,
  });

  const c3 = await ContentModel.create({
    workspaceId: wsId,
    collaborationId: collab2._id,
    title: 'Why I Stopped Buying Heavy Camera Bags (Apex Peak Review)',
    platform: 'TikTok',
    type: 'Short',
    publishDate: '2026-10-04',
    status: 'Published',
    link: 'https://tiktok.com/@creator/video/demo789',
    estimatedRevenue: 320000,
  });

  await PerformanceMetricModel.create({
    workspaceId: wsId,
    contentId: c3._id,
    views: 74200,
    likes: 5800,
    comments: 310,
    shares: 620,
    saves: 1100,
    followersGained: 340,
  });

  const c4 = await ContentModel.create({
    workspaceId: wsId,
    title: 'How I Organize 5 Client Deliverables Without Burning Out',
    platform: 'Instagram',
    type: 'Post',
    publishDate: '2026-11-01',
    status: 'Published',
    link: 'https://instagram.com/p/demo999',
    estimatedRevenue: 0,
  });

  await PerformanceMetricModel.create({
    workspaceId: wsId,
    contentId: c4._id,
    views: 29500,
    likes: 2150,
    comments: 180,
    shares: 240,
    saves: 890,
    followersGained: 140,
  });

  // 5. Production Expenses
  await ExpenseModel.create([
    {
      workspaceId: wsId,
      title: 'Sony FX3 Cage Rig & HDMI Clamp',
      category: 'equipment',
      amount: 48000, // $480.00
      date: '2026-09-05',
      approvalStatus: 'Approved',
      receiptUrl: 'https://assets.innovia.local/receipts/fx3-cage.pdf',
    },
    {
      workspaceId: wsId,
      title: 'Macro Lens Extension Tube for Product Closeups',
      category: 'equipment',
      amount: 12500, // $125.00
      date: '2026-10-18',
      linkedCollaborationId: collab1._id,
      approvalStatus: 'Approved',
    },
    {
      workspaceId: wsId,
      title: 'Studio Walnut Wood Planks & Props for Desk B-Roll',
      category: 'props',
      amount: 19500, // $195.00
      date: '2026-10-20',
      linkedCollaborationId: collab1._id,
      approvalStatus: 'Approved',
    },
    {
      workspaceId: wsId,
      title: 'NYC Tech Creator Meetup Travel & Cab',
      category: 'travel',
      amount: 38000, // $380.00
      date: '2026-09-28',
      approvalStatus: 'Approved',
    },
    {
      workspaceId: wsId,
      title: 'Adobe Creative Cloud All Apps',
      category: 'software',
      amount: 8500, // $85.00
      date: '2026-10-01',
      approvalStatus: 'Approved',
      isRecurring: true,
    },
    {
      workspaceId: wsId,
      title: 'Epidemic Sound Commercial License',
      category: 'software',
      amount: 3500, // $35.00
      date: '2026-10-01',
      approvalStatus: 'Approved',
      isRecurring: true,
    },
  ]);

  // 6. Recurring Expense Definitions
  await RecurringExpenseModel.create([
    {
      workspaceId: wsId,
      title: 'Adobe Creative Cloud',
      category: 'software',
      amount: 8500,
      frequency: 'monthly',
      nextRunDate: '2026-12-01',
      active: true,
    },
    {
      workspaceId: wsId,
      title: 'Epidemic Sound Licensing',
      category: 'software',
      amount: 3500,
      frequency: 'monthly',
      nextRunDate: '2026-12-01',
      active: true,
    },
  ]);

  // 7. Tasks & Time Logs
  const task1 = await TaskModel.create({
    workspaceId: wsId,
    collaborationId: collab1._id,
    contentId: c1._id,
    title: 'Edit 60s GlowTech Earbuds integration rough cut',
    description: 'Sync multi-cam A-roll and grade product close-up b-roll.',
    assigneeId: editor._id,
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-11-12',
    estimatedHours: 4,
    actualHours: 3.5,
  });

  const task2 = await TaskModel.create({
    workspaceId: wsId,
    collaborationId: collab1._id,
    title: 'Film macro turntable rotation of earbuds and charging case',
    description: 'Use 90mm macro at f/5.6 with subtle warm backlight.',
    assigneeId: creatorId,
    status: 'Done',
    priority: 'Medium',
    dueDate: '2026-10-22',
    estimatedHours: 2.5,
    actualHours: 2.0,
  });

  const task3 = await TaskModel.create({
    workspaceId: wsId,
    collaborationId: collab2._id,
    title: 'Outdoor camera bag hiking b-roll shoot',
    description: 'Capture weather-resistance demo in rain simulator.',
    assigneeId: creatorId,
    status: 'Done',
    priority: 'High',
    dueDate: '2026-09-25',
    estimatedHours: 5,
    actualHours: 4.5,
  });

  const task4 = await TaskModel.create({
    workspaceId: wsId,
    collaborationId: collab1._id,
    title: 'Export 9:16 vertical teaser reel for Instagram',
    description: 'Punchy 15s teaser showcasing active noise cancellation.',
    assigneeId: editor._id,
    status: 'To Do',
    priority: 'Urgent',
    dueDate: '2026-11-15',
    estimatedHours: 2,
    actualHours: 0,
  });

  // Time Logs
  await TimeLogModel.create([
    {
      workspaceId: wsId,
      taskId: task1._id,
      userId: editor._id,
      startTime: '2026-11-05T10:00:00Z',
      endTime: '2026-11-05T13:30:00Z',
      durationMinutes: 210, // 3.5 hrs
      isRunning: false,
      notes: 'Color graded A-roll and synced wireless lapel audio.',
    },
    {
      workspaceId: wsId,
      taskId: task2._id,
      userId: creatorId,
      startTime: '2026-10-22T14:00:00Z',
      endTime: '2026-10-22T16:00:00Z',
      durationMinutes: 120, // 2 hrs
      isRunning: false,
      notes: 'Studio lighting turntable setup.',
    },
    {
      workspaceId: wsId,
      taskId: task3._id,
      userId: creatorId,
      startTime: '2026-09-25T09:00:00Z',
      endTime: '2026-09-25T13:30:00Z',
      durationMinutes: 270, // 4.5 hrs
      isRunning: false,
      notes: 'Hiking trail footage and rain testing.',
    },
  ]);

  // 8. Payments
  await PaymentModel.create([
    {
      workspaceId: wsId,
      userId: editor._id,
      recipientName: 'Marcus Vance',
      amount: 45000, // $450.00
      status: 'Paid',
      dueDate: '2026-10-15',
      paidDate: '2026-10-14',
      type: 'TEAM_PAYOUT',
      referenceNote: 'Editing & grading for Lumina Lighting Reel',
    },
    {
      workspaceId: wsId,
      userId: editor._id,
      recipientName: 'Marcus Vance',
      amount: 35000, // $350.00
      status: 'Approved',
      dueDate: '2026-11-15',
      type: 'TEAM_PAYOUT',
      referenceNote: 'Batch 10 hours for GlowTech Earbuds review cut',
    },
  ]);

  // 9. Scrapbook Stickers on Personal Board
  await ScrapbookItemModel.create([
    {
      workspaceId: wsId,
      userId: creatorId,
      stickerId: 'camera',
      stickerType: 'camera',
      x: 80,
      y: 100,
      width: 90,
      height: 90,
      rotation: -3,
      noteText: 'Favorite gear: Sony FX3!',
      color: '#FFF3B8',
      zIndex: 1,
    },
    {
      workspaceId: wsId,
      userId: creatorId,
      stickerId: 'trophy',
      stickerType: 'trophy',
      x: 280,
      y: 80,
      width: 95,
      height: 95,
      rotation: 2,
      noteText: 'Hit 86k views on desk tour!',
      color: '#D4F5E4',
      zIndex: 2,
    },
    {
      workspaceId: wsId,
      userId: creatorId,
      stickerId: 'money_bag',
      stickerType: 'money_bag',
      x: 180,
      y: 280,
      width: 85,
      height: 85,
      rotation: -1,
      noteText: 'Q4 revenue target: $15,000',
      color: '#FFD6E0',
      zIndex: 3,
    },
    {
      workspaceId: wsId,
      userId: creatorId,
      stickerId: 'flame',
      stickerType: 'flame',
      x: 420,
      y: 240,
      width: 80,
      height: 80,
      rotation: 4,
      noteText: 'Reels engagement up +38%',
      color: '#FFE0CC',
      zIndex: 4,
    },
    {
      workspaceId: wsId,
      userId: creatorId,
      stickerId: 'clapperboard',
      stickerType: 'clapperboard',
      x: 360,
      y: 380,
      width: 90,
      height: 90,
      rotation: -2,
      noteText: 'Marcus crushing the edits',
      color: '#D6EBFF',
      zIndex: 5,
    },
  ]);

  // 10. Generate initial insights
  await InsightEngine.generateInsights(workspaceIdStr);

  return {
    creatorEmail: 'creator@innovia.io',
    sponsorEmail: 'sponsor@innovia.io',
    editorEmail: 'editor@innovia.io',
    password: 'Password123!',
    collaborationsSeeded: 3,
    contentSeeded: 4,
    tasksSeeded: 4,
  };
}
