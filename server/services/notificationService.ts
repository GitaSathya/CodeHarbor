
import { storage } from "../storage";

export interface Notification {
  id: string;
  userId?: string;
  type: 'processing_complete' | 'high_similarity_match' | 'processing_started' | 'analysis_failed';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      read: false,
      createdAt: new Date(),
    };

    const userId = notification.userId || 'default';
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    this.notifications.get(userId)!.unshift(newNotification);
    
    // Keep only last 50 notifications per user
    if (this.notifications.get(userId)!.length > 50) {
      this.notifications.get(userId)!.splice(50);
    }

    return newNotification;
  }

  async getNotifications(userId: string = 'default'): Promise<Notification[]> {
    return this.notifications.get(userId) || [];
  }

  async markAsRead(notificationId: string, userId: string = 'default'): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    return true;
  }

  async markAllAsRead(userId: string = 'default'): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach(notification => {
        notification.read = true;
      });
    }
  }

  async deleteNotification(notificationId: string, userId: string = 'default'): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const index = userNotifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;

    userNotifications.splice(index, 1);
    return true;
  }

  // Helper methods for common notification types
  async notifyProcessingComplete(jobTitle: string, matchCount: number, userId?: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'processing_complete',
      title: 'Analysis Complete',
      message: `Analysis for "${jobTitle}" completed with ${matchCount} matches found.`,
      data: { jobTitle, matchCount },
    });
  }

  async notifyHighSimilarityMatch(jobTitle: string, matches: any[], userId?: string): Promise<Notification> {
    const highSimilarityCount = matches.filter(m => m.overallScore >= 80).length;
    return this.createNotification({
      userId,
      type: 'high_similarity_match',
      title: 'High Similarity Matches Found!',
      message: `Found ${highSimilarityCount} candidate(s) with 80%+ similarity for "${jobTitle}".`,
      data: { jobTitle, matches: matches.filter(m => m.overallScore >= 80) },
    });
  }

  async notifyProcessingStarted(jobTitle: string, userId?: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'processing_started',
      title: 'Analysis Started',
      message: `Processing analysis for "${jobTitle}".`,
      data: { jobTitle },
    });
  }

  async notifyAnalysisFailed(jobTitle: string, userId?: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'analysis_failed',
      title: 'Analysis Failed',
      message: `Analysis for "${jobTitle}" failed to complete.`,
      data: { jobTitle },
    });
  }

  async notifyReverseMatchComplete(userEmail: string, result: any): Promise<void> {
    // Create a notification for reverse match completion
    await this.createNotification({
      userId: 'default',
      type: 'processing_complete',
      title: 'Reverse Match Complete',
      message: `Resume analysis completed with ${result.matches.length} job recommendations found.`,
      data: { 
        type: 'reverse_match',
        candidateSummary: result.candidateSummary,
        matchCount: result.matches.length,
        topMatch: result.matches[0]?.jobTitle || 'Unknown'
      },
    });
  }
}

export const notificationService = new NotificationService();
