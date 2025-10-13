import { Injectable, signal } from '@angular/core';

export type NotificationType = "success" | "error" | "info" | "warning"

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
 private notificationsSignal = signal<Notification[]>([])
  notifications = this.notificationsSignal.asReadonly()

  /**
   * Show a notification toast
   */
  show(type: NotificationType, message: string, duration = 5000) {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration,
    }

    // Add notification to the list
    this.notificationsSignal.update((notifications) => [...notifications, notification])

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id)
      }, duration)
    }
  }

  /**
   * Show success notification
   */
  success(message: string, duration?: number) {
    this.show("success", message, duration)
  }

  /**
   * Show error notification
   */
  error(message: string, duration?: number) {
    this.show("error", message, duration)
  }

  /**
   * Show info notification
   */
  info(message: string, duration?: number) {
    this.show("info", message, duration)
  }

  /**
   * Show warning notification
   */
  warning(message: string, duration?: number) {
    this.show("warning", message, duration)
  }

  /**
   * Remove a notification by ID
   */
  remove(id: string) {
    this.notificationsSignal.update((notifications) => notifications.filter((n) => n.id !== id))
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notificationsSignal.set([])
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
