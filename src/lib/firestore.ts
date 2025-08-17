import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type {
  Comment,
  CreateGroupInput,
  CreateTaskInput,
  FamilyGroup,
  GroupMember,
  GroupStats,
  Task,
  UpdateGroupInput,
  UpdateTaskInput,
  User,
} from '../types';
import { db } from './firebase';

// 안전한 실시간 구독을 위한 헬퍼 함수 - 재시도 로직 포함
function createSafeSnapshot<T>(
  _queryOrDoc: unknown,
  onNext: (data: T) => void,
  onError?: (error: Error) => void,
  retryCount: number = 0
): Unsubscribe {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  try {
    return onSnapshot(queryOrDoc, {
      next: snapshot => {
        try {
          // Check if it's a QuerySnapshot (has 'empty' property)
          if ('empty' in snapshot && 'docs' in snapshot) {
            if (snapshot.empty) {
              onNext([] as T);
              return;
            }

            // QuerySnapshot
            const data = snapshot.docs.map((_doc: unknown) => ({
              id: doc.id,
              ...doc.data(),
            })) as T;
            onNext(data);
          } else {
            // DocumentSnapshot
            if (snapshot.exists()) {
              const data = {
                id: snapshot.id,
                ...snapshot.data(),
              } as T;
              onNext(data);
            } else {
              onNext(null as T);
            }
          }
        }
      },
      error: error => {
        // 재시도 로직 - assertion 에러나 네트워크 에러의 경우
        if (
          retryCount < MAX_RETRIES &&
          (error.message.includes('INTERNAL ASSERTION FAILED') ||
            error.message.includes('Unexpected state'))
        ) {

          setTimeout(() => {
            try {
              createSafeSnapshot(queryOrDoc, onNext, onError, retryCount + 1);
            } catch (retryError) {
              if (onError) onError(retryError as Error);
            }
          }, RETRY_DELAY * (retryCount + 1));
        } else {
          if (onError) onError(error);
        }
      },
    });
    // 빈 unsubscribe 함수 반환
    return () => {};
  }
}

// Task-related Firestore operations
export const taskService = {
  // Create a new task
  async createTask(taskData: CreateTaskInput): Promise<string> {
    try {
      // Filter out undefined values to prevent Firestore errors
      const sanitizedData = filterUndefinedValues({
        ...taskData,
        status: 'pending',
        watchers: taskData.watchers || [],
        mentionedUsers: taskData.mentionedUsers || [],
        attachments: taskData.attachments || [],
        tags: taskData.tags || [],
        reminders: taskData.reminders || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Additional check for undefined values
      const finalData = Object.fromEntries(
        Object.entries(sanitizedData).filter(
          ([_, value]) => value !== undefined
        )
      );

      // 디버깅용 로그
      const docRef = await addDoc(collection(db, 'tasks'), finalData);
      return docRef.id;
    }
  },

  // Update a task
  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<void> {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      // Filter out undefined values to prevent Firestore errors
      const sanitizedUpdates = filterUndefinedValues({
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(taskRef, sanitizedUpdates);
    }
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', taskId));
    
  },

  // Get a single task
  async getTask(taskId: string): Promise<Task | null> {
    try {
      const docSnap = await getDoc(doc(db, 'tasks', taskId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Task;
      }
      return null;
    }
  },

  // Subscribe to tasks for a specific group
  subscribeToGroupTasks(
    groupId: string,
    callback: (tasks: Task[]) => void,
    onError?: (error: Error) => void
  ) {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      return createSafeSnapshot<Task[]>(q, callback, onError);
      return () => {};
    }
  },

  // Subscribe to tasks for a specific user
  subscribeToUserTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    onError?: (error: Error) => void
  ) {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('assigneeId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      return createSafeSnapshot<Task[]>(q, callback, onError);
      return () => {};
    }
  },

  // Subscribe to personal tasks for a specific user
  subscribeToPersonalTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    onError?: (error: Error) => void
  ) {
    try {
      // 개인 할일은 groupId가 'personal'이거나 없는 할일
      const q = query(
        collection(db, 'tasks'),
        where('assigneeId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      return createSafeSnapshot<Task[]>(
        q,
        allTasks => {
          // 클라이언트 사이드에서 개인 할일만 필터링
          const personalTasks = allTasks.filter(
            task => !task.groupId || task.groupId === 'personal'
          );
          callback(personalTasks);
        },
        onError
      );
      return () => {};
    }
  },

  // Get tasks for a group (one-time)
  async getGroupTasks(_groupId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
    }
  },

  // Get tasks for a user (one-time)
  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('assigneeId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }
  },
};

// Group-related Firestore operations
export const groupService = {
  // Create a new group
  async createGroup(groupData: CreateGroupInput): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'groups'), {
        ...groupData,
        memberIds: [groupData.ownerId],
        memberRoles: { [groupData.ownerId]: 'owner' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    }
  },

  // Update a group
  async updateGroup(groupId: string, updates: UpdateGroupInput): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }
  },

  // Get a single group
  async getGroup(
    groupId: string | null | undefined
  ): Promise<FamilyGroup | null> {
    try {
      // groupId가 null이거나 undefined이면 null 반환
      if (!groupId) {
        return null;
      }

      const docSnap = await getDoc(doc(db, 'groups', groupId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FamilyGroup;
      }
      return null;
    }
  },

  // Subscribe to a group
  subscribeToGroup(
    groupId: string | null | undefined,
    callback: (group: FamilyGroup | null) => void,
    onError?: (error: Error) => void
  ) {
    try {
      // groupId가 null이거나 undefined이면 구독하지 않음
      if (!groupId) {
        callback(null);
        return () => {};
      }

      const groupRef = doc(db, 'groups', groupId);
      return createSafeSnapshot<FamilyGroup | null>(
        groupRef,
        callback,
        onError
      );
      return () => {};
    }
  },

  // Add member to group
  async addMemberToGroup(
    groupId: string,
    userId: string,
    role: string = 'member'
  ) {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        memberIds: arrayUnion(userId),
        [`memberRoles.${userId}`]: role,
        updatedAt: serverTimestamp(),
      });
    }
  },

  // Remove member from group
  async removeMemberFromGroup(groupId: string, userId: string) {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const batch = writeBatch(db);

      // Remove from memberIds array
      batch.update(groupRef, {
        memberIds: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });

      // Remove from memberRoles
      const groupDoc = await getDoc(groupRef);
      if (groupDoc.exists()) {
        const data = groupDoc.data();
        const memberRoles = data.memberRoles || {};
        delete memberRoles[userId];
        batch.update(groupRef, { memberRoles });
      }

      await batch.commit();
    }
  },

  // Get user's groups
  async getUserGroups(userId: string): Promise<FamilyGroup[]> {
    try {
      const q = query(
        collection(db, 'groups'),
        where('memberIds', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }
  },

  // Subscribe to user's groups
  subscribeToUserGroups(
    userId: string,
    callback: (groups: FamilyGroup[]) => void,
    onError?: (error: Error) => void
  ) {
    try {
      const q = query(
        collection(db, 'groups'),
        where('memberIds', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );

      return createSafeSnapshot<FamilyGroup[]>(q, callback, onError);
      return () => {};
    }
  },

  // Get group members with details
    try {
      // groupId가 null이거나 undefined이면 빈 배열 반환
      if (!groupId) {
        return [];
      }

      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) {
        // 그룹이 존재하지 않는 경우 빈 배열 반환
        return [];
      }

      const groupData = groupDoc.data();
      const memberIds = groupData.memberIds || [];
      const memberRoles = groupData.memberRoles || {};

      // Get user details for each member
      const memberPromises = memberIds.map(async (memberId: string) => {
        const userDoc = await getDoc(doc(db, 'users', memberId));
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Handle role properly - extract string value if it's an object
        let role = memberRoles[memberId] || 'member';
        if (typeof role === 'object' && role !== null) {
          // If role is stored as an object (e.g., {isDeputyGroupLeader: true}),
          // convert it to appropriate string
          if (role.isDeputyGroupLeader) {
            role = 'admin'; // or 'deputyGroupLeader' if that's a valid role
          } else {
            role = 'member';
          }
        }

        return {
          userId: memberId,
          displayName: userData.displayName || userData.email || 'Unknown User',
          userName: userData.displayName || userData.email || 'Unknown User', // 호환성을 위해 유지
          email: userData.email || '',
          avatar: userData.photoURL || null,
          role: role,
          joinedAt: userData.createdAt || null,
          isOnline: userData.isOnline || false,
          // 기본값 설정 (실제 데이터는 getGroupStats에서 계산됨)
          tasksCreated: 0,
          tasksAssigned: 0,
          tasksCompleted: 0,
          points: userData.points || 0,
        };
      });

      return await Promise.all(memberPromises);
    }
  },

  // Get group statistics
    try {
      // groupId가 null이거나 undefined이면 빈 통계 반환
      if (!groupId) {
        return {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0,
          completionRate: 0,
          memberStats: [],
        };
      }

      // 먼저 그룹이 존재하는지 확인
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) {
        return {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0,
          completionRate: 0,
          memberStats: [],
        };
      }

      // Get all tasks for the group
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('groupId', '==', groupId)
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),

      // Calculate stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(
        return dueDate < new Date();
      }).length;

      // Get member stats with detailed calculations
      const members = await this.getGroupMembers(groupId);
      const memberStats = members.map(member => {
        // 해당 멤버가 생성한 할일
        const createdTasks = tasks.filter(
        );

        // 해당 멤버에게 할당된 할일
        const assignedTasks = tasks.filter(
        );

        // 해당 멤버가 완료한 할일
        const completedTasks = tasks.filter(
        );

        return {
          userId: member.userId,
          userName: member.userName,
          tasksCreated: createdTasks.length,
          tasksAssigned: assignedTasks.length,
          tasksCompleted: completedTasks.length,
          points: member.points || 0,
        };
      });

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        memberStats,
      };
    }
  },

  // Delete a group
  async deleteGroup(groupId: string, requestingUserId: string): Promise<void> {
    try {
      // Verify the requesting user is the owner
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupDoc.data();
      if (groupData.ownerId !== requestingUserId) {
        throw new Error('Only the group owner can delete the group');
      }

      // Delete all tasks for this group
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('groupId', '==', groupId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);

      const batch = writeBatch(db);
      tasksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete the group
      batch.delete(doc(db, 'groups', groupId));

      await batch.commit();
    }
  },

  // Invite member by email
  async inviteMemberByEmail(
    groupId: string,
    email: string,
    role: string = 'member'
  ): Promise<void> {
    try {
      // In a real app, this would send an email invitation
      // For now, we'll create an invitation document
      await addDoc(collection(db, 'invitations'), {
        groupId,
        email,
        role,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }
  },

  // Change member role
  async changeMemberRole(
    groupId: string,
    userId: string,
    newRole: string
  ): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        [`memberRoles.${userId}`]: newRole,
        updatedAt: serverTimestamp(),
      });
    }
  },

  // Generate invite code
  async generateInviteCode(_groupId: string): Promise<string> {
    try {
      // Generate a random 6-character code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Update the group with the new invite code
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        inviteCode: code,
        inviteCodeExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        updatedAt: serverTimestamp(),
      });

      return code;
    }
  },

  // Join group by invite code
  async joinGroupByCode(inviteCode: string, userId: string): Promise<string> {
    try {
      // Find group with this invite code
      const q = query(
        collection(db, 'groups'),
        where('inviteCode', '==', inviteCode)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('Invalid invite code');
      }

      const groupDoc = querySnapshot.docs[0];
      const groupId = groupDoc.id;
      const groupData = groupDoc.data();

      // Check if invite code is expired
      if (
        groupData.inviteCodeExpiresAt &&
        groupData.inviteCodeExpiresAt.toDate() < new Date()
      ) {
        throw new Error('Invite code has expired');
      }

      // Add user to group
      await this.addMemberToGroup(groupId, userId, 'member');

      return groupId;
    }
  },
};

// Comment-related Firestore operations
export const commentService = {
  // Add a comment to a task
  async addComment(taskId: string, _commentData: unknown) {
    try {
      // 데이터 검증 및 정리
      const cleanData = { ..._commentData };

      // undefined 값 제거
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined || cleanData[key] === null) {
          delete cleanData[key];
        }
      });

      // 필수 필드 검증
      if (!cleanData.userId || !cleanData.content) {
        throw new Error('필수 필드가 누락되었습니다.');
      }

      // attachments 배열 내부의 undefined 값 제거
      const cleanAttachments = Array.isArray(cleanData.attachments)
        ? cleanData.attachments.filter(att => att !== undefined && att !== null)
        : [];

      // attachments 배열 내부의 객체들도 검증
      const validatedAttachments = cleanAttachments.map((att: unknown) => {
        if (typeof att === 'object' && att !== null) {
          const cleanAtt: Record<string, unknown> = {};
          Object.keys(att as Record<string, unknown>).forEach(key => {
            if ((att as Record<string, unknown>)[key] !== undefined && (att as Record<string, unknown>)[key] !== null) {
              cleanAtt[key] = (att as Record<string, unknown>)[key];
            }
          });
          return cleanAtt;
        }
        return att;
      });

      // 최종 데이터 구조 검증
      const finalData = {
        taskId: cleanData.taskId || taskId,
        userId: cleanData.userId,
        userName: cleanData.userName || '익명',
        userAvatar: cleanData.userAvatar || null,
        content: cleanData.content,
        attachments: validatedAttachments,
        reactions: cleanData.reactions || {},
      };

      // undefined 값이 있는지 최종 확인 (재귀적 검사)
      const hasUndefined = checkForUndefined(finalData);
      if (hasUndefined) {
        throw new Error('데이터에 undefined 값이 포함되어 있습니다.');
      }

      const docRef = await addDoc(collection(db, 'tasks', taskId, 'comments'), {
        ...(finalData as Record<string, unknown>),
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    }
  },

  // Delete a comment
  async deleteComment(taskId: string, commentId: string) {
    await deleteDoc(doc(db, 'tasks', taskId, 'comments', commentId));
    
  },

  // Subscribe to comments for a task
  subscribeToTaskComments(
    taskId: string,
    callback: (comments: Comment[]) => void,
    onError?: (error: Error) => void
  ) {
    try {
      const q = query(
        collection(db, 'tasks', taskId, 'comments'),
        orderBy('createdAt', 'asc')
      );
      return () => {};
    }
  },

  // Add reaction to comment
  async addReaction(
    taskId: string,
    commentId: string,
    userId: string,
    emoji: string
  ) {
    try {
      const commentRef = doc(db, 'tasks', taskId, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (commentSnap.exists()) {
        const commentData = commentSnap.data();
        const reactions = commentData.reactions || {};

        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }

        if (!reactions[emoji].includes(userId)) {
          reactions[emoji].push(userId);
          await updateDoc(commentRef, { reactions });
        }
      }
    }
  },

  // Add file attachment to comment
  async addFileAttachment(
    taskId: string,
    commentId: string,
    _fileAttachment: unknown) {
    try {
      const commentRef = doc(db, 'tasks', taskId, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (commentSnap.exists()) {
        const commentData = commentSnap.data();
        const attachments = commentData.attachments || [];
        attachments.push(_fileAttachment);

        await updateDoc(commentRef, {
          attachments,
          updatedAt: serverTimestamp(),
        });
      }
    }
  },

  // Remove file attachment from comment
  async removeFileAttachment(
    taskId: string,
    commentId: string,
    fileId: string
  ) {
    try {
      const commentRef = doc(db, 'tasks', taskId, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);

      if (commentSnap.exists()) {
        const commentData = commentSnap.data();
        const attachments = commentData.attachments || [];
        const updatedAttachments = attachments.filter(
        );

        await updateDoc(commentRef, {
          attachments: updatedAttachments,
          updatedAt: serverTimestamp(),
        });
      }
    }
  },
};

// Helper function to deep filter undefined values
function filterUndefinedValues(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj === undefined ? null : obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item: unknown) => item !== undefined)
      .map((item: unknown) => filterUndefinedValues(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== undefined) {
      if (value === null || typeof value !== 'object') {
        result[key] = value;
      } else {
        result[key] = filterUndefinedValues(value);
      }
    }
  }
  return result;
}

// Helper function to check for undefined values recursively
function checkForUndefined(obj: unknown): boolean {
  if (obj === undefined) {
    return true;
  }

  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some((item: unknown) => checkForUndefined(item));
  }

  return Object.values(obj as Record<string, unknown>).some((value: unknown) => checkForUndefined(value));
}

// User-related Firestore operations
export const userService = {
  // Create or update user profile
  async createOrUpdateUserProfile(
    userId: string,
    userData: Partial<User>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          ...(userData as Record<string, unknown>),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    }
  },

  // Subscribe to user profile
  subscribeToUserProfile(
    userId: string,
    callback: (profile: User | null) => void,
    onError?: (error: Error) => void
  ) {
    try {
      const userRef = doc(db, 'users', userId);
      return createSafeSnapshot<User | null>(userRef, callback, onError);in
      return () => {};
    }
  },
};

// Batch operations
export const batchService = {
  // Create multiple tasks at once
  async createMultipleTasks(tasks: unknown[]) {
    const batch = writeBatch(db);
    const taskRefs: unknown[] = [];

    tasks.forEach(taskData => {
      const taskRef = doc(collection(db, 'tasks'));
      taskRefs.push(taskRef);
      batch.set(taskRef, {
        ...(taskData as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  },

  // Update multiple tasks
  async updateMultipleTasks(updates: Array<{ id: string; data: unknown }>) {
    const batch = writeBatch(db);

    updates.forEach(({ id, data }) => {
      const taskRef = doc(db, 'tasks', id);
      batch.update(taskRef, {
        ...(data as Record<string, unknown>),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  },
};

// Default export for easier importing
export default {
  taskService,
  groupService,
  commentService,
  userService,
  batchService,
};
