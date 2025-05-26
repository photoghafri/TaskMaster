import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { getNotifications, markAsRead, markAllAsRead, countUnread, Notification } from '@/lib/notification-utils';

export default function NotificationCenter() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial load
    const userId = session?.user?.id;
    const allNotifications = getNotifications(userId);
    setNotifications(allNotifications);
    setUnreadCount(countUnread(userId));

    // Listen for new notifications
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      const userNotifications = getNotifications(userId);
      setNotifications(userNotifications);
      setUnreadCount(countUnread(userId));
    };

    // Listen for notifications from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'lastNotification') {
        const userNotifications = getNotifications(userId);
        setNotifications(userNotifications);
        setUnreadCount(countUnread(userId));
      }
    };

    // Add event listeners
    window.addEventListener('new-notification', handleNewNotification as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Check for outside clicks to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up
    return () => {
      window.removeEventListener('new-notification', handleNewNotification as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [session]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    const userId = session?.user?.id;
    const updatedNotifications = getNotifications(userId);
    setNotifications(updatedNotifications);
    setUnreadCount(countUnread(userId));
  };

  const handleMarkAllAsRead = () => {
    const userId = session?.user?.id;
    markAllAsRead(userId);
    const updatedNotifications = getNotifications(userId);
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Format as date
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-700 focus:outline-none transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <BellAlertIcon className="h-5 w-5" />
            <span className="absolute top-0 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <BellIcon className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-medium text-slate-900 dark:text-white">Notifications</h3>
            <div className="flex space-x-1">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="p-1 rounded text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 flex items-center space-x-1"
                  title="Mark all as read"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
                title="Close"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-start space-x-3 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                      {notification.projectTitle && (
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                          {notification.projectTitle}
                        </p>
                      )}
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex-shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700"
                        title="Mark as read"
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="rounded-full bg-slate-100 dark:bg-slate-700 p-3 mb-3">
                  <BellIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No notifications yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Notifications about your projects will appear here
                </p>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex justify-center">
            <button
              onClick={() => {
                const userId = session?.user?.id;
                const refreshed = getNotifications(userId);
                setNotifications(refreshed);
                setUnreadCount(countUnread(userId));
              }}
              className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1"
            >
              <ArrowPathIcon className="h-3 w-3" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 