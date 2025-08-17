import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// 포인트 내역 인터페이스
export interface PointHistory {
  id: string;
  userId: string;
  groupId: string;
  type:
    | 'earned'
    | 'deducted'
    | 'bonus'
    | 'penalty'
    | 'manual_add'
    | 'manual_deduct';
  amount: number;
  reason: string;
  taskId?: string;
  taskTitle?: string;
  createdAt: Timestamp;
  description?: string;
  isApproved?: boolean; // 승인 상태
  approvedAt?: Timestamp; // 승인 시간
  approvedBy?: string; // 승인자 ID
}

// 포인트 규칙 인터페이스
export interface PointRule {
  id: string;
  groupId: string;
  name: string;
  type:
    | 'task_completion'
    | 'streak_bonus'
    | 'completion_rate'
    | 'manual'
    | 'custom';
  points: number;
  conditions?: {
    minTasks?: number;
    minStreak?: number;
    minCompletionRate?: number;
    categories?: string[];
  };
  description: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 포인트 통계 인터페이스
export interface PointStats {
  userId: string;
  groupId: string;
  totalPoints: number;
  earnedPoints: number;
  deductedPoints: number;
  bonusPoints: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  rank: number;
  totalMembers: number;
  lastUpdated: Timestamp;
}

// 포인트 서비스 클래스
class PointsService {
  // 포인트 내역 추가
  async addPointHistory(
    history: Omit<PointHistory, 'id' | 'createdAt'>
  ): Promise<string> {
    const historyData = {
      ...history,
      createdAt: Timestamp.now(),
      isApproved: false, // 기본적으로 승인되지 않은 상태
    };

    const docRef = await addDoc(collection(db, 'pointHistory'), historyData);

    // 포인트 통계 업데이트 (승인된 경우에만)
    // await this.updatePointStats(history.userId, history.groupId);

    return docRef.id;
  }

  // 포인트 내역 조회
  async getPointHistory(
    userId: string,
    groupId: string,
    limitCount: number = 50
  ): Promise<PointHistory[]> {
    try {
      const q = query(
        collection(db, 'pointHistory'),
        where('userId', '==', userId),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PointHistory[];
      return [];
    }
  }

  // 그룹의 모든 멤버 포인트 내역 조회
  async getGroupPointHistory(groupId: string): Promise<PointHistory[]> {
    try {
      const q = query(
        collection(db, 'pointHistory'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PointHistory[];
      return [];
    }
  }

  // 포인트 규칙 생성
  async createPointRule(
    rule: Omit<PointRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const ruleData = {
      ...rule,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'pointRules'), ruleData);
    return docRef.id;
  }

  // 포인트 규칙 조회
  async getPointRules(groupId: string): Promise<PointRule[]> {
    try {
      const q = query(
        collection(db, 'pointRules'),
        where('groupId', '==', groupId),
        where('isActive', '==', true),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PointRule[];
      return [];
    }
  }

  // 포인트 규칙 업데이트
  async updatePointRule(
    ruleId: string,
    updates: Partial<PointRule>
  ): Promise<void> {
    const ruleRef = doc(db, 'pointRules', ruleId);
    await updateDoc(ruleRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  // 포인트 통계 조회
  async getPointStats(
    userId: string,
    groupId: string
  ): Promise<PointStats | null> {
    try {
      const statsRef = doc(db, 'pointStats', `${userId}_${groupId}`);
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        return statsDoc.data() as PointStats;
      }

      return null;
      return null;
    }
  }

  // 포인트 통계 업데이트
  async updatePointStats(userId: string, groupId: string): Promise<void> {
    // 해당 사용자의 승인된 포인트 내역만 조회
    const history = await this.getApprovedPointHistory(userId, groupId, 1000);

    // 통계 계산 (승인된 포인트만)
    const earned = history
      .filter(h => h.type === 'earned')
      .reduce((sum, h) => sum + h.amount, 0);
    const manualAdd = history
      .filter(h => h.type === 'manual_add')
      .reduce((sum, h) => sum + h.amount, 0);
    const deducted = history
      .filter(
        h =>
          h.type === 'deducted' ||
          h.type === 'penalty' ||
          h.type === 'manual_deduct'
      )
      .reduce((sum, h) => sum + h.amount, 0);
    const bonus = history
      .filter(h => h.type === 'bonus')
      .reduce((sum, h) => sum + h.amount, 0);

    // 스트릭 계산 (임시 - 실제로는 할일 완료 데이터에서 계산)
    const currentStreak = 0; // TODO: 실제 스트릭 계산 로직 구현
    const longestStreak = 0; // TODO: 실제 스트릭 계산 로직 구현

    // 완료율 계산 (임시)
    const completionRate = 0; // TODO: 실제 완료율 계산 로직 구현

    // 순위 계산 (임시)
    const rank = 1; // TODO: 실제 순위 계산 로직 구현
    const totalMembers = 1; // TODO: 실제 멤버 수 계산 로직 구현

    const stats: PointStats = {
      userId,
      groupId,
      totalPoints: earned + manualAdd - deducted,
      earnedPoints: earned + manualAdd,
      deductedPoints: deducted,
      bonusPoints: bonus,
      currentStreak,
      longestStreak,
      completionRate,
      rank,
      totalMembers,
      lastUpdated: Timestamp.now(),
    };

    // Firestore에 저장
    const statsRef = doc(db, 'pointStats', `${userId}_${groupId}`);
    await setDoc(statsRef, stats);
  }

  // 그룹의 모든 멤버 포인트 통계 조회
  async getGroupPointStats(groupId: string): Promise<PointStats[]> {
    try {
      const q = query(
        collection(db, 'pointStats'),
        where('groupId', '==', groupId),
        orderBy('totalPoints', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const stats = querySnapshot.docs.map(doc => doc.data() as PointStats);

      // 순위 업데이트
      const updatedStats = stats.map((stat, index) => ({
        ...stat,
        rank: index + 1,
        totalMembers: stats.length,
      }));

      // 순위 업데이트를 Firestore에 반영
      const batch = writeBatch(db);
      updatedStats.forEach(stat => {
        const statsRef = doc(
          db,
          'pointStats',
          `${stat.userId}_${stat.groupId}`
        );
        batch.update(statsRef, {
          rank: stat.rank,
          totalMembers: stat.totalMembers,
        });
      });
      await batch.commit();

      return updatedStats;
      return [];
    }
  }

  // 할일 완료 시 포인트 지급
  async awardPointsForTaskCompletion(
    userId: string,
    groupId: string,
    taskId: string,
    taskTitle: string
  ): Promise<void> {
    // 기본 포인트 지급 (승인 대기 상태)
    await this.addPointHistory({
      userId,
      groupId,
      type: 'earned',
      amount: 10, // 기본 포인트
      reason: 'task_completion',
      taskId,
      taskTitle,
      description: `할일 완료: ${taskTitle}`,
    });

    // 추가 보너스 포인트 규칙 확인 (승인 대기 상태)
    await this.checkAndAwardBonusPoints(userId, groupId);
  }

  // 보너스 포인트 확인 및 지급
  async checkAndAwardBonusPoints(
    userId: string,
    groupId: string
  ): Promise<void> {
    const rules = await this.getPointRules(groupId);
    const stats = await this.getPointStats(userId, groupId);

    if (!stats) return;

    for (const rule of rules) {
      if (rule.type === 'streak_bonus' && rule.conditions?.minStreak) {
        if (stats.currentStreak >= rule.conditions.minStreak) {
          await this.addPointHistory({
            userId,
            groupId,
            type: 'bonus',
            amount: rule.points,
            reason: 'streak_bonus',
            description: `연속 완료 보너스 (${stats.currentStreak}일)`,
          });
        }
      }

      if (
        rule.type === 'completion_rate' &&
        rule.conditions?.minCompletionRate
      ) {
        if (stats.completionRate >= rule.conditions.minCompletionRate) {
          await this.addPointHistory({
            userId,
            groupId,
            type: 'bonus',
            amount: rule.points,
            reason: 'completion_rate',
            description: `완료율 보너스 (${stats.completionRate}%)`,
          });
        }
      }
    }
  }

  // 수동 포인트 추가/차감
  async manuallyAdjustPoints(
    userId: string,
    groupId: string,
    amount: number,
    reason: string,
    description?: string
  ): Promise<void> {
    const type = amount > 0 ? 'manual_add' : 'manual_deduct';
    const absAmount = Math.abs(amount);

    // 포인트 내역 추가
    const historyId = await this.addPointHistory({
      userId,
      groupId,
      type,
      amount: absAmount,
      reason: reason,
      description: description || reason,
    });

    // 즉시 승인하여 포인트 반영
    await this.approvePointHistory(historyId, userId);

    // 포인트 통계 업데이트
    await this.updatePointStats(userId, groupId);
  }

  // 포인트 내역 승인
  async approvePointHistory(
    historyId: string,
    approvedBy: string
  ): Promise<void> {
    const historyRef = doc(db, 'pointHistory', historyId);

    // 현재 내역 조회
    const historyDoc = await getDoc(historyRef);
    if (!historyDoc.exists()) {
      throw new Error('포인트 내역을 찾을 수 없습니다.');
    }

    const history = historyDoc.data() as PointHistory;
    // 승인 상태 업데이트
    await updateDoc(historyRef, {
      isApproved: true,
      approvedAt: Timestamp.now(),
      approvedBy: approvedBy,
    });

    // 승인된 포인트를 사용자에게 실제로 지급
    const pointAmount =
      history.type === 'manual_add' ||
      history.type === 'earned' ||
      history.type === 'bonus'
        ? history.amount
        : -history.amount;

    // 사용자 프로필의 포인트 업데이트
    await this.updateUserPoints(history.userId, history.groupId, pointAmount);
  }

  // 포인트 내역 승인 취소
  async rejectPointHistory(
    historyId: string,
    rejectedBy: string
  ): Promise<void> {
    const historyRef = doc(db, 'pointHistory', historyId);
    await updateDoc(historyRef, {
      isApproved: false,
      approvedAt: Timestamp.now(),
      approvedBy: rejectedBy,
    });
  }

  // 승인되지 않은 포인트 내역 조회
  async getUnapprovedPointHistory(
    userId: string,
    groupId: string,
    limitCount: number = 50
  ): Promise<PointHistory[]> {
    try {
      const q = query(
        collection(db, 'pointHistory'),
        where('userId', '==', userId),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const allHistory = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PointHistory[];

      // isApproved가 false이거나 undefined인 경우를 미승인으로 처리
      const unapprovedHistory = allHistory.filter(
        history =>
          history.isApproved === false || history.isApproved === undefined
      );

      return unapprovedHistory;
      return [];
    }
  }

  // 승인된 포인트 내역 조회
  async getApprovedPointHistory(
    userId: string,
    groupId: string,
    limitCount: number = 50
  ): Promise<PointHistory[]> {
    try {
      const q = query(
        collection(db, 'pointHistory'),
        where('userId', '==', userId),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const allHistory = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PointHistory[];

      // isApproved가 true인 경우만 승인된 것으로 처리
      const approvedHistory = allHistory.filter(
        history => history.isApproved === true
      );

      return approvedHistory;
      return [];
    }
  }

  // 포인트 내역 금액 수정
  async updatePointHistoryAmount(
    historyId: string,
    newAmount: number
  ): Promise<void> {
    try {
      const historyRef = doc(db, 'pointHistory', historyId);
      await updateDoc(historyRef, {
        amount: newAmount,
        updatedAt: Timestamp.now(),
      });
    } catch {
      throw new Error('Failed to update point history amount');
    }
  }

  // 사용자 포인트 업데이트
  private async updateUserPoints(
    userId: string,
    groupId: string,
    amount: number
  ): Promise<void> {
    try {
      // 사용자 프로필에서 포인트 업데이트
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentPoints = userData.points || 0;
        const newPoints = currentPoints + amount;

        await updateDoc(userRef, {
          points: newPoints,
        });
      }
    } catch {
      throw new Error('Failed to update user points');
    }
  }
}

// 싱글톤 인스턴스 생성
export const pointsService = new PointsService();
