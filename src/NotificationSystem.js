import React, { useEffect } from 'react';
import './NotificationSystem.css';

/**
 * NotificationSystem Component
 * 
 * A reusable notification component that displays various types of notifications
 * with automatic dismissal and optional actions.
 * 
 * @param {Object} props
 * @param {Array} props.notifications - Array of notification objects
 * @param {Function} props.removeNotification - Function to remove a notification
 */
const NotificationSystem = ({ notifications = [], removeNotification }) => {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          removeNotification={removeNotification}
        />
      ))}
    </div>
  );
};

/**
 * Individual Notification Component
 */
const Notification = ({ notification, removeNotification }) => {
  const { id, type, message, duration = 5000, action } = notification;

  // Auto-dismiss notification after duration
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        removeNotification(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, removeNotification]);

  // Get appropriate icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle"></i>;
      case 'info':
      default:
        return <i className="fas fa-info-circle"></i>;
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        <p>{message}</p>
        {action && (
          <button
            className="notification-action"
            onClick={() => {
              action.onClick();
              if (action.dismissOnClick) {
                removeNotification(id);
              }
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        className="notification-close"
        onClick={() => removeNotification(id)}
        aria-label="Close notification"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default NotificationSystem;