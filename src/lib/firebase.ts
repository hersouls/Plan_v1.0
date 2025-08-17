// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Analytics, Performance, and Messaging will be loaded dynamically to reduce bundle size

// 환경 변수에서 Firebase 설정 가져오기
const getFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  // 잘못된 플레이스홀더 값들 검증 및 수정
  const invalidValues = [
    "your-api-key", "your-auth-domain", "your-project-id", 
    "your-storage-bucket", "your-messaging-sender-id", 
    "your-app-id", "your-measurement-id"
  ];

  // 환경 변수가 설정되지 않았거나 잘못된 값인 경우 기본값 사용
  if (!config.apiKey || invalidValues.includes(config.apiKey)) {
    config.apiKey = "AIzaSyDw5QKUOCHBewF8tS2poDyZL9jRUtOveMw";
  }
  if (!config.authDomain || invalidValues.includes(config.authDomain)) {
    config.authDomain = "plan-e7bc6.firebaseapp.com";
  }
  if (!config.projectId || invalidValues.includes(config.projectId)) {
    config.projectId = "plan-e7bc6";
  }
  if (!config.storageBucket || invalidValues.includes(config.storageBucket)) {
    config.storageBucket = "plan-e7bc6.firebasestorage.app";
  }
  if (!config.messagingSenderId || invalidValues.includes(config.messagingSenderId)) {
    config.messagingSenderId = "507060914612";
  }
  if (!config.appId || invalidValues.includes(config.appId)) {
    config.appId = "1:507060914612:web:45ee29e84cf59df82b4ae1";
  }
  if (!config.measurementId || invalidValues.includes(config.measurementId)) {
    config.measurementId = "G-8EM7E3RPR6";
  }

  return config;
};

// Your web app's Firebase configuration
const firebaseConfig = getFirebaseConfig();

// 디버깅: 환경 변수 확인

// 설정 유효성 검사 (사용하지 않음)

// Initialize Firebase
let app;

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth 객체가 제대로 초기화되었는지 확인하는 함수
export const isAuthInitialized = () => {
  return auth !== null && auth !== undefined;
};

// Analytics, Performance, Messaging 초기화 (브라우저 환경에서만) - Dynamic Loading
export let analytics: unknown | null = null;
export let performance: unknown | null = null;
export let messaging: unknown | null = null;

// Analytics 활성화 체크
const shouldEnableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true' && 
                             !import.meta.env.DEV && 
                             firebaseConfig.measurementId && 
                             !firebaseConfig.measurementId.includes('your-');

// Dynamic loading functions for optional Firebase services
export const loadAnalytics = async () => {
  if (analytics) return analytics;
  
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    
    if (supported && firebaseConfig.measurementId && shouldEnableAnalytics) {
      analytics = getAnalytics(app);
      return analytics;
    }
  } catch {
    // Handle error silently
  }
  return null;
};

export const loadPerformance = async () => {
  if (performance) return performance;
  
  try {
    const { getPerformance } = await import('firebase/performance');
    
    if (shouldEnableAnalytics) {
      performance = getPerformance(app);
      return performance;
    }
  } catch {
    // Handle error silently
  }
  return null;
};

export const loadMessaging = async () => {
  if (messaging) return messaging;
  
  try {
    const { getMessaging, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    }
  } catch {
    // Handle error silently
  }
  return null;
};


export default app;