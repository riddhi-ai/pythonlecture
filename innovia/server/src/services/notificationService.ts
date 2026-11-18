import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';
import { NotificationModel } from '../models/Notification.js';
import { NotificationType } from '@innovia/shared';
import mongoose from 'mongoose';
import { sseManager } from './sseService.js';

let transporter: nodemailer.Transporter | null = null;

if (ENV.SMTP_USER && ENV.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
}

export class NotificationService {
  static async notify({
    workspaceId,
    userId,
    title,
    message,
    type,
    sendEmail = false,
    userEmail,
  }: {
    workspaceId: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    sendEmail?: boolean;
    userEmail?: string;
  }) {
    // 1. Create in-app notification
    const notification = await NotificationModel.create({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      userId: new mongoose.Types.ObjectId(userId),
      title,
      message,
      type,
      isRead: false,
    });

    // 2. Broadcast via SSE
    sseManager.broadcastToWorkspace(workspaceId, 'NOTIFICATION_CREATED', notification);

    // 3. Send email if enabled or simulated in dev
    if (sendEmail && userEmail && transporter) {
      try {
        await transporter.sendMail({
          from: ENV.SMTP_FROM,
          to: userEmail,
          subject: `[Creator Innovia] ${title}`,
          text: message,
          html: `<div style="font-family: sans-serif; background: #FFF8F0; padding: 24px; border-radius: 8px;">
            <h2 style="color: #4A4458;">📔 Creator Innovia Journal Alert</h2>
            <h3 style="color: #166534;">${title}</h3>
            <p style="color: #4A4458; font-size: 15px;">${message}</p>
            <p style="font-size: 12px; color: #8E879E;">Sent automatically from your Creator Innovia workspace.</p>
          </div>`,
        });
      } catch (err: any) {
        console.warn(`[Notification] Email transport failed (${err.message}). In-app alert created successfully.`);
      }
    }

    return notification;
  }
}
