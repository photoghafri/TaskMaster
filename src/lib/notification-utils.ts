import { toast } from 'react-hot-toast';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
  read: boolean;
  userId?: string;
  projectId?: string;
  projectTitle?: string;
  action?: string;
}

// Keep track of notifications in memory
let notifications: Notification[] = [];
const MAX_NOTIFICATIONS = 50;

// Add a new notification
export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const newNotification: Notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    read: false,
    ...notification
  };
  
  // Add to the beginning of the array
  notifications = [newNotification, ...notifications].slice(0, MAX_NOTIFICATIONS);
  
  // Broadcast the notification to all tabs/windows
  try {
    localStorage.setItem('lastNotification', JSON.stringify(newNotification));
    const event = new CustomEvent('new-notification', { detail: newNotification });
    window.dispatchEvent(event);
  } catch (e) {
    console.error('Failed to broadcast notification:', e);
  }
  
  return newNotification;
};

// Get all notifications
export const getNotifications = (userId?: string) => {
  if (userId) {
    return notifications.filter(n => !n.userId || n.userId === userId);
  }
  return notifications;
};

// Mark a notification as read
export const markAsRead = (id: string) => {
  notifications = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  return notifications;
};

// Mark all notifications as read
export const markAllAsRead = (userId?: string) => {
  if (userId) {
    notifications = notifications.map(n => 
      (!n.userId || n.userId === userId) ? { ...n, read: true } : n
    );
  } else {
    notifications = notifications.map(n => ({ ...n, read: true }));
  }
  return notifications;
};

// Count unread notifications
export const countUnread = (userId?: string) => {
  if (userId) {
    return notifications.filter(n => !n.read && (!n.userId || n.userId === userId)).length;
  }
  return notifications.filter(n => !n.read).length;
};

// Helper functions for different notification types
export const notifyProjectUpdate = (projectTitle: string, action: string, userId?: string, projectId?: string) => {
  const notification = addNotification({
    message: `Project "${projectTitle}" ${action}`,
    type: 'info',
    userId,
    projectId,
    projectTitle,
    action
  });
  
  toast.success(`Project "${projectTitle}" ${action}`, {
    position: 'bottom-right',
    duration: 3000,
  });
  
  return notification;
};

export const notifyStatusChange = (projectTitle: string, fromStatus: string, toStatus: string, userId?: string, projectId?: string) => {
  const notification = addNotification({
    message: `Project "${projectTitle}" moved from ${fromStatus} to ${toStatus}`,
    type: 'success',
    userId,
    projectId,
    projectTitle,
    action: 'status-change'
  });
  
  toast.success(`Status changed: ${fromStatus} → ${toStatus}`, {
    position: 'bottom-right',
    duration: 4000,
  });
  
  return notification;
};

export const notifyPriorityChange = (projectTitle: string, userId?: string, projectId?: string) => {
  const notification = addNotification({
    message: `Priority updated for project "${projectTitle}"`,
    type: 'info',
    userId,
    projectId,
    projectTitle,
    action: 'priority-change'
  });
  
  toast.success(`Priority updated for "${projectTitle}"`, {
    position: 'bottom-right',
    duration: 3000,
  });
  
  return notification;
};

export const notifyError = (message: string, userId?: string) => {
  const notification = addNotification({
    message,
    type: 'error',
    userId,
  });
  
  toast.error(message, {
    position: 'bottom-right',
    duration: 5000,
  });
  
  return notification;
}; 