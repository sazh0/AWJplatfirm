import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessingStatus } from './ProcessingStatus';
import './NotificationIcon.css';

/**
 * NotificationIcon Component - Bell icon with dropdown for notifications
 */
const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications on component mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    // Function to fetch all notifications (both pending and completed)
    const fetchNotifications = async () => {
      try {
        const processes = await ProcessingStatus.getAllProcesses(userId);

        // Transform processes into notification objects
        const notificationItems = processes.map(process => {
          let title, route, routeParams;

          if (process.type === 'goal-decomposition') {
            title = process.projectName || 'مشروع جديد';
            route = '/goal-decomposing-result';
            routeParams = { project_id: process.result?.project_id };
          } else if (process.type === 'business-model') {
            title = 'نموذج العمل التجاري';
            route = '/business-model-result';
            routeParams = { model_id: process.result?.model_id };
          }

          return {
            id: process.id,
            title,
            status: process.status,
            createdAt: process.createdAt?.toDate ? process.createdAt.toDate() : new Date(process.createdAt),
            completedAt: process.completedAt?.toDate ? process.completedAt.toDate() :
              process.completedAt ? new Date(process.completedAt) : null,
            read: process.read || false,
            route,
            routeParams,
            error: process.error
          };
        });

        // Sort by date (newest first)
        notificationItems.sort((a, b) => {
          const dateA = a.completedAt || a.createdAt;
          const dateB = b.completedAt || b.createdAt;
          return dateB - dateA;
        });

        setNotifications(notificationItems);

        // Count unread notifications
        const unread = notificationItems.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Set up subscription for real-time updates
    const unsubscribe = ProcessingStatus.subscribeToProcessingUpdates(userId, () => {
      fetchNotifications();
    });

    // Clean up subscription
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      // Mark as read
      await ProcessingStatus.markAsRead(notification.id);

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate to the appropriate page if completed
    if (notification.status === 'completed' && notification.route) {
      navigate(notification.route, { state: notification.routeParams });
      setIsOpen(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';

    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'الآن';
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ساعة`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} يوم`;
    }
  };

  // Get status text in Arabic
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'جاري المعالجة';
      case 'completed':
        return 'مكتمل';
      case 'failed':
        return 'فشلت العملية';
      default:
        return status;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    try {
      for (const notification of unreadNotifications) {
        await ProcessingStatus.markAsRead(notification.id);
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <div className="notification-icon-container" ref={dropdownRef}>
      <button
        className="btn-secondary notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="الإشعارات"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                تعيين الكل كمقروء
              </button>
            )}
          </div>

          <div className="notification-dropdown-body">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.status}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.status === 'completed' ? (
                      <i className="fas fa-check-circle"></i>
                    ) : notification.status === 'processing' ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : notification.status === 'failed' ? (
                      <i className="fas fa-exclamation-circle"></i>
                    ) : (
                      <i className="fas fa-clock"></i>
                    )}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">
                      {notification.status === 'completed' ? (
                        'تم الانتهاء من المعالجة بنجاح'
                      ) : notification.status === 'failed' ? (
                        `فشلت المعالجة: ${notification.error || 'خطأ في المعالجة'}`
                      ) : (
                        `حالة العملية: ${getStatusText(notification.status)}`
                      )}
                    </div>
                    <div className="notification-time">
                      {notification.status === 'completed' ? (
                        formatDate(notification.completedAt)
                      ) : (
                        formatDate(notification.createdAt)
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="notification-unread-indicator"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-notifications">
                لا توجد إشعارات
              </div>
            )}
          </div>

          {notifications.length > 5 && (
            <div className="notification-dropdown-footer">
              <button className="view-all-btn">عرض جميع الإشعارات</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;