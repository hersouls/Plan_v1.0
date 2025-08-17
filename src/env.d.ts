/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_APP_ENV: 'development' | 'production';
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FCM_VAPID_KEY: string;
  readonly VITE_CLAUDE_API_KEY?: string;
  readonly CLAUDE_API_KEY?: string;
  readonly VITE_CLAUDE_MODEL?: string;
  readonly VITE_CLAUDE_MAX_TOKENS?: string;
  readonly VITE_ENABLE_CLAUDE_AI?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly PROD: boolean;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}