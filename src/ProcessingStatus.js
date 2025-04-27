import { db } from './firebase';
import {
  collection, addDoc, updateDoc, doc,
  query, where, getDocs, onSnapshot, serverTimestamp
} from 'firebase/firestore';

/**
 * Utils for tracking asynchronous processing status
 */
export const ProcessingStatus = {
  // Status constants
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',

  /**
   * Create a new processing record
   * @param {Object} data - Processing data including type, userId, etc.
   * @returns {Promise<string>} - Returns the processing ID
   */
  createProcessingRecord: async (data) => {
    try {
      const processingCollection = collection(db, 'Processing');
      const docRef = await addDoc(processingCollection, {
        status: ProcessingStatus.PENDING,
        createdAt: serverTimestamp(),
        read: false, // Add read status
        ...data
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating processing record:', error);
      throw error;
    }
  },

  /**
   * Update the status of a processing record
   * @param {string} processingId - The ID of the processing record
   * @param {string} status - The new status
   * @param {Object} additionalData - Any additional data to update
   */
  updateStatus: async (processingId, status, additionalData = {}) => {
    try {
      const processingRef = doc(db, 'Processing', processingId);
      await updateDoc(processingRef, {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });
    } catch (error) {
      console.error('Error updating processing status:', error);
      throw error;
    }
  },

  /**
   * Get all pending processing records for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of processing records
   */
  getPendingProcesses: async (userId) => {
    try {
      const processingCollection = collection(db, 'Processing');
      const q = query(
        processingCollection,
        where('userId', '==', userId),
        where('status', 'in', [ProcessingStatus.PENDING, ProcessingStatus.PROCESSING])
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting pending processes:', error);
      throw error;
    }
  },

  /**
   * Get all processing records for a user (both pending and completed)
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of all processing records
   */
  getAllProcesses: async (userId) => {
    try {
      const processingCollection = collection(db, 'Processing');
      const q = query(
        processingCollection,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all processes:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} processingId - The ID of the processing record
   * @returns {Promise<void>}
   */
  markAsRead: async (processingId) => {
    try {
      const processingRef = doc(db, 'Processing', processingId);
      await updateDoc(processingRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Subscribe to processing updates for a user
   * @param {string} userId - The user ID
   * @param {function} callback - Callback function for updates
   * @returns {function} - Unsubscribe function
   */
  subscribeToProcessingUpdates: (userId, callback) => {
    const processingCollection = collection(db, 'Processing');
    const q = query(
      processingCollection,
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const processes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(processes);
    });
  }
};

export default ProcessingStatus;