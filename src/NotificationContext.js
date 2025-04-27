import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationSystem from './NotificationSystem';

// Create the notification context
const NotificationContext = createContext();

/**
 * NotificationProvider component
 * Provides notification functionality to the entire app
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, ...notification }]);
    return id;
  }, []);

  // Remove a notification by id
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Helper methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({ type: 'error', message, ...options });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);

  // Create value object with all notification methods
  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationSystem 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;