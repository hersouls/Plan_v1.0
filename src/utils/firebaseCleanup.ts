import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// 특정 컬렉션의 모든 문서 삭제
export const deleteAllDocumentsInCollection = async (collectionName: string) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = snapshot.docs.map(document => 
      deleteDoc(doc(db, collectionName, document.id))
    );
    
    await Promise.all(deletePromises);
    
    return { success: true, deletedCount: snapshot.docs.length };
  } catch (_error) {
    return { success: false, error };
  }
};

// 특정 사용자의 데이터만 삭제
export const deleteUserData = async (userId: string) => {
  try {
    // trips 컬렉션에서 해당 사용자 데이터 삭제
    const tripsQuery = query(collection(db, 'trips'), where('user_id', '==', userId));
    const tripsSnapshot = await getDocs(tripsQuery);
    
    const tripDeletePromises = tripsSnapshot.docs.map(document => 
      deleteDoc(doc(db, 'trips', document.id))
    );
    await Promise.all(tripDeletePromises);
    
    // plans 컬렉션에서 해당 사용자의 여행과 연관된 데이터 삭제
    // 먼저 해당 사용자의 trip_id 목록을 가져와야 함
    const tripIds = tripsSnapshot.docs.map(doc => doc.id);
    
    if (tripIds.length > 0) {
      // 각 trip_id별로 plans 삭제
      for (const tripId of tripIds) {
        const plansQuery = query(collection(db, 'plans'), where('trip_id', '==', tripId));
        const plansSnapshot = await getDocs(plansQuery);
        
        const planDeletePromises = plansSnapshot.docs.map(document =>
          deleteDoc(doc(db, 'plans', document.id))
        );
        await Promise.all(planDeletePromises);
      }
    }
    
    return { 
      success: true, 
      deletedTrips: tripsSnapshot.docs.length,
      deletedPlans: tripIds.length 
    };
  } catch (_error) {
    return { success: false, error };
  }
};

// Firebase 전체 데이터 초기화
export const cleanupAllFirebaseData = async () => {
  try {
    const collections = ['trips', 'plans'];
    const results = [];
    
    for (const collectionName of collections) {
      const result = await deleteAllDocumentsInCollection(collectionName);
      results.push({ collection: collectionName, ...result });
    }
    
    return { success: true, results };
    
  } catch (_error) {
    return { success: false, error };
  }
};

// 현재 로그인된 사용자의 데이터만 초기화
export const cleanupCurrentUserData = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error('로그인된 사용자가 없습니다');
    }
    
    const result = await deleteUserData(auth.currentUser.uid);
    
    if (result.success) {
      // Success message
    }
    
    return result;
  } catch (_error) {
    return { success: false, error };
  }
};