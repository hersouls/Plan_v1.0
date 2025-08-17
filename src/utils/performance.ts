import { loadPerformance } from '../lib/firebase';

export const measurePerformance = async (name: string) => {
  try {
    const performance = await loadPerformance();
    if (!performance) {
      if (false) {
        // Empty block
      }
      return {
        start: () => {},
        stop: () => {}
      };
    }

    const { trace } = await import('firebase/performance');
    const performanceTrace = trace(performance, name);
    
    return {
      start: () => {
        performanceTrace.start();
        if (false) {
        // Empty block
      }
      },
      stop: () => {
        performanceTrace.stop();
        if (false) {
        // Empty block
      }
      }
    };
  } catch {
    return {
      start: () => {},
      stop: () => {}
    };
  }
};

export const measureDatabaseQuery = async (queryName: string) => {
  return await measurePerformance(`db_query_${queryName}`);
};

export const measurePageLoad = async (pageName: string) => {
  return await measurePerformance(`page_load_${pageName}`);
};

export const measureImageUpload = async () => {
  return await measurePerformance('image_upload');
};

export const measureMapRender = async () => {
  return await measurePerformance('map_render');
};

export const getCoreWebVitals = () => {
  if ('web-vital' in window) {
    // Web Vitals 측정 (실제 구현 시 web-vitals 라이브러리 사용)
    return {
      FCP: 0, // First Contentful Paint
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      TTFB: 0 // Time to First Byte
    };
  }
  return null;
};