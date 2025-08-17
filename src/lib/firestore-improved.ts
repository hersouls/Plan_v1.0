import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  limit,
  setDoc,
  arrayUnion,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  Task, 
  CreateTaskInput, 
  UpdateTaskInput, 
  FamilyGroup, 
  CreateGroupInput, 
  UpdateGroupInput, 
  UserNotification
} from '../types';

// Enhanced helper function to filter undefined values deeply
function sanitizeData(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.filter(item => item !== undefined).map(item => sanitizeData(item));
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = sanitizeData(value);
      }
    }
    return result;
  }
  
  return obj;
}

// Data validation helpers
function validateTaskInput(input: CreateTaskInput | UpdateTaskInput): void {
  if ('title' in input && (!input.title || input.title.trim().length === 0)) {
    throw new Error('Task title is required and cannot be empty');
  }
  
  if ('dueDate' in input && input.dueDate) {
    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new Error('Invalid due date format');
    }
  }
  
  if ('estimatedMinutes' in input && input.estimatedMinutes && input.estimatedMinutes < 0) {
    throw new Error('Estimated minutes cannot be negative');
  }
}

function validateGroupInput(input: CreateGroupInput | UpdateGroupInput): void {
  if ('name' in input && (!input.name || input.name.trim().length === 0)) {
    throw new Error('Group name is required and cannot be empty');
  }
  
  if ('name' in input && input.name && input.name.length > 100) {
    throw new Error('Group name cannot exceed 100 characters');
  }
}

// Enhanced Task Service with better error handling and validation
export const enhancedTaskService = {
  // Create a new task with validation
  async createTask(taskData: CreateTaskInput): Promise<string> {
    validateTaskInput(taskData);
    
    const sanitizedData = sanitizeData({
      ...taskData,
      status: 'pending',
      watchers: taskData.watchers || [],
      mentionedUsers: taskData.mentionedUsers || [],
      attachments: taskData.attachments || [],
      tags: taskData.tags || [],
      reminders: taskData.reminders || [],
      version: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const docRef = await addDoc(collection(db, 'tasks'), sanitizedData);
    
    // Create activity log
    await this.logActivity({
      taskId: docRef.id,
      userId: taskData.userId,
      action: 'created',
      entityType: 'task',
      entityId: docRef.id,
    });
    
    return docRef.id;
  },

  // Update a task with optimistic locking
  async updateTask(taskId: string, updates: UpdateTaskInput, currentVersion?: number): Promise<void> {
    validateTaskInput(updates);
    
    await runTransaction(db, async (transaction) => {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await transaction.get(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }
      
      const currentData = taskDoc.data();
      
      // Optimistic locking check
      if (currentVersion && currentData.version !== currentVersion) {
        throw new Error('Task was modified by another user. Please refresh and try again.');
      }
      
      const sanitizedUpdates = sanitizeData({
        ...updates,
        version: increment(1),
        updatedAt: serverTimestamp(),
      });
      
      transaction.update(taskRef, sanitizedUpdates);
      
      // Log changes for history
      const changes = Object.keys(updates).map(key => ({
        field: key,
        oldValue: currentData[key],
        newValue: updates[key as keyof UpdateTaskInput],
      }));
      
      // Create activity log
      await this.logActivity({
        taskId,
        userId: currentData.userId,
        action: 'updated',
        entityType: 'task',
        entityId: taskId,
        changes,
      });
    });
  },

  // Soft delete a task
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      archivedAt: serverTimestamp(),
      archivedBy: userId,
      updatedAt: serverTimestamp(),
    });
    
    // Log deletion
    await this.logActivity({
      taskId,
      userId,
      action: 'deleted',
      entityType: 'task',
      entityId: taskId,
    });
  },

  // Get a single task with error handling
  async getTask(taskId: string): Promise<Task | null> {
    const docSnap = await getDoc(doc(db, 'tasks', taskId));
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    
    // Filter out archived tasks
    if (data.archivedAt) {
      return null;
    }
    
    return { id: docSnap.id, ...data } as Task;
  },

  // Subscribe to tasks with pagination support
  subscribeToGroupTasks(
    groupId: string, 
    callback: (tasks: Task[]) => void,
    options?: { limit?: number; orderBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' }
  ) {
    const { limit: limitCount = 50, orderBy: orderField = 'updatedAt' } = options || {};
    
    let q = query(
      collection(db, 'tasks'),
      where('groupId', '==', groupId),
      where('archivedAt', '==', null), // Exclude archived tasks
      orderBy(orderField, 'desc')
    );
    
    if (limitCount > 0) {
      q = query(q, limit(limitCount));
    }

    return onSnapshot(q, 
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        callback(tasks);
      },
      (_error) => {
        callback([]);
      }
    );
  },

  // Activity logging
  async logActivity(activityData: {
    taskId?: string;
    groupId?: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: Array<{ field: string; oldValue: unknown; newValue: unknown; }>;
  }): Promise<void> {
    try {
      const sanitizedData = sanitizeData({
        ...activityData,
        createdAt: serverTimestamp(),
      });
      
      await addDoc(collection(db, 'activities'), sanitizedData);
    } catch {
      // Don't throw - activity logging shouldn't break main operations
    }
  },

  // Bulk operations with batch
  async createMultipleTasks(tasks: CreateTaskInput[]): Promise<string[]> {
    try {
      if (tasks.length === 0) {
        return [];
      }
      
      if (tasks.length > 500) {
        throw new Error('Cannot create more than 500 tasks at once');
      }
      
      // Validate all tasks first
      tasks.forEach(validateTaskInput);
      
      const batch = writeBatch(db);
      const taskRefs: unknown[] = [];

      tasks.forEach(taskData => {
        const taskRef = doc(collection(db, 'tasks'));
        taskRefs.push(taskRef);
        
        const sanitizedData = sanitizeData({
          ...taskData,
          status: 'pending',
          watchers: taskData.watchers || [],
          mentionedUsers: taskData.mentionedUsers || [],
          attachments: taskData.attachments || [],
          tags: taskData.tags || [],
          reminders: taskData.reminders || [],
          version: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        
        batch.set(taskRef, sanitizedData);
      });

      await batch.commit();
      return taskRefs.map((ref: { id: string }) => ref.id);
    } catch {
      throw new Error('Failed to create multiple tasks');
    }
  },

  // Toggle task completion with proper state management
  async toggleTaskCompletion(
    taskId: string, 
    completed: boolean, 
    completedBy?: string, 
    completionNotes?: string
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const taskRef = doc(db, 'tasks', taskId);
        const taskDoc = await transaction.get(taskRef);
        
        if (!taskDoc.exists()) {
          throw new Error('Task not found');
        }
        
        const updates: unknown = {
          status: completed ? 'completed' : 'pending',
          version: increment(1),
          updatedAt: serverTimestamp(),
        };

        if (completed) {
          updates.completedAt = serverTimestamp();
          updates.completedBy = completedBy;
          if (completionNotes) {
            updates.completionNotes = completionNotes;
          }
        } else {
          updates.completedAt = null;
          updates.completedBy = null;
          updates.completionNotes = null;
        }

        transaction.update(taskRef, updates);
        
        // Update group statistics
        const taskData = taskDoc.data();
        if (taskData.groupId) {
          const groupRef = doc(db, 'groups', taskData.groupId);
          const statsUpdate = completed 
            ? { 'statistics.completedTasks': increment(1) }
            : { 'statistics.completedTasks': increment(-1) };
          
          transaction.update(groupRef, statsUpdate);
        }
      });
      
      // Log completion activity
      await this.logActivity({
        taskId,
        userId: completedBy || '',
        action: 'completed',
        entityType: 'task',
        entityId: taskId,
      });
    } catch {
      throw new Error('Failed to toggle task completion');
    }
  },
};

// Enhanced Group Service
export const enhancedGroupService = {
  // Create a new group with proper initialization
  async createGroup(groupData: CreateGroupInput & { ownerId: string }): Promise<string> {
    try {
      validateGroupInput(groupData);
      
      const sanitizedData = sanitizeData({
        ...groupData,
        memberIds: [groupData.ownerId],
        memberRoles: { [groupData.ownerId]: 'owner' },
        settings: {
          allowMembersToInvite: false,
          requireApprovalForNewMembers: true,
          defaultRole: 'member' as const,
          taskCategories: ['household', 'work', 'personal', 'shopping', 'other'],
          taskTags: [],
          ...groupData.settings,
        },
        statistics: {
          totalTasks: 0,
          completedTasks: 0,
          activeTasks: 0,
          lastActivityAt: serverTimestamp(),
          activeMembersCount: 1,
        },
        isPublic: false,
        tags: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      const docRef = await addDoc(collection(db, 'groups'), sanitizedData);
      
      // Update user's groupIds
      await this.addUserToGroup(docRef.id, groupData.ownerId);
      
      return docRef.id;
    } catch {
      throw new Error('Failed to create group');
    }
  },

  // Update group with validation
  async updateGroup(groupId: string, updates: UpdateGroupInput): Promise<void> {
    try {
      validateGroupInput(updates);
      
      const sanitizedUpdates = sanitizeData({
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, sanitizedUpdates);
    } catch {
      throw new Error('Failed to update group');
    }
  },

  // Get user's groups with proper error handling
  async getUserGroups(userId: string): Promise<FamilyGroup[]> {
    try {
      const q = query(
        collection(db, 'groups'),
        where('memberIds', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilyGroup[];
    } catch {
      throw new Error('Failed to get user groups');
    }
  },

  // Add user to group with proper validation
  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentGroupIds = userData.groupIds || [];
          
          if (!currentGroupIds.includes(groupId)) {
            transaction.update(userRef, {
              groupIds: arrayUnion(groupId),
              updatedAt: serverTimestamp(),
            });
          }
        }
      });
    } catch {
      throw new Error('Failed to add user to group');
    }
  },

  // Subscribe to a group with error handling
  subscribeToGroup(groupId: string, callback: (group: FamilyGroup | null) => void) {
    return onSnapshot(
      doc(db, 'groups', groupId), 
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() } as FamilyGroup);
        } else {
          callback(null);
        }
      },
      (_error) => {
        callback(null);
      }
    );
  },
};

// Enhanced User Service with consistent field names
export const enhancedUserService = {
  // Create or update user profile with proper data sanitization
  async createOrUpdateUserProfile(userId: string, profileData: unknown): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Deep filter out undefined values to prevent Firestore errors
      const cleanProfileData = sanitizeData(profileData);
      
      // Check if document exists first
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        // Document exists, use updateDoc
        await updateDoc(userRef, {
          ...cleanProfileData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Document doesn't exist, use setDoc
        await setDoc(userRef, {
          ...cleanProfileData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch {
      throw new Error('Failed to create or update user profile');
    }
  },

  // Get user profile with error handling
  async getUserProfile(userId: string): Promise<unknown | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch {
      throw new Error('Failed to get user profile');
    }
  },

  // Update user statistics
  async updateUserStats(userId: string, statsUpdate: Record<string, number>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData: unknown = { updatedAt: serverTimestamp() };
      
      Object.entries(statsUpdate).forEach(([key, value]) => {
        if (typeof value === 'number') {
          updateData[`stats.${key}`] = value;
        }
      });
      
      await updateDoc(userRef, updateData);
    } catch {
      throw new Error('Failed to update user stats');
    }
  },

  // Subscribe to user profile
  subscribeToUserProfile(userId: string, callback: (profile: unknown | null) => void) {
    return onSnapshot(
      doc(db, 'users', userId), 
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        } else {
          callback(null);
        }
      },
      (_error) => {
        callback(null);
      }
    );
  },
};

// Enhanced Notification Service
export const enhancedNotificationService = {
  // Create notification with proper validation
  async createNotification(notificationData: Omit<UserNotification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const sanitizedData = sanitizeData({
        ...notificationData,
        read: false,
        createdAt: serverTimestamp(),
      });
      
      const docRef = await addDoc(collection(db, 'notifications'), sanitizedData);
      return docRef.id;
    } catch {
      throw new Error('Failed to create notification');
    }
  },

  // Mark notification as read
  async markAsRead(_notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Subscribe to user notifications
  subscribeToUserNotifications(userId: string, callback: (notifications: UserNotification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, 
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserNotification[];
        callback(notifications);
      },
      (_error) => {
        callback([]);
      }
    );
  },
};

// Export enhanced services
export const firestoreServices = {
  taskService: enhancedTaskService,
  groupService: enhancedGroupService,
  userService: enhancedUserService,
  notificationService: enhancedNotificationService,
};

export default firestoreServices;