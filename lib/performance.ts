/**
 * Performance Monitoring Utilities
 * Track page load times, interactions, and web vitals
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Track page load performance
 */
export function trackPageLoad(): PerformanceMetric[] {
  if (typeof window === 'undefined') return [];

  const metrics: PerformanceMetric[] = [];

  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigationEntry) {
      // Time to First Byte (TTFB)
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      metrics.push({
        name: 'TTFB',
        value: ttfb,
        rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      });

      // DOM Content Loaded
      const dcl = navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart;
      metrics.push({
        name: 'DCL',
        value: dcl,
        rating: dcl < 1500 ? 'good' : dcl < 2500 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      });

      // Load Complete
      const loadComplete = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
      metrics.push({
        name: 'Load',
        value: loadComplete,
        rating: loadComplete < 2500 ? 'good' : loadComplete < 4000 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error tracking page load:', error);
  }

  return metrics;
}

/**
 * Track user interaction performance
 */
export function trackInteraction(action: string, startTime?: number): void {
  if (typeof window === 'undefined') return;

  const duration = startTime ? performance.now() - startTime : 0;

  const metric: PerformanceMetric = {
    name: `interaction:${action}`,
    value: duration,
    rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
    timestamp: Date.now(),
  };

  console.log('[Performance]', metric);

  // Send to analytics if configured
  if (window.gtag) {
    window.gtag('event', 'interaction', {
      action,
      duration,
      rating: metric.rating,
    });
  }
}

/**
 * Report Web Vitals (CLS, FID, LCP, FCP, TTFB)
 */
export function reportWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
}): void {
  const { name, value, id } = metric;

  // Determine rating based on web vitals thresholds
  let rating: 'good' | 'needs-improvement' | 'poor' = 'good';

  switch (name) {
    case 'CLS':
      rating = value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
      break;
    case 'FID':
      rating = value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
      break;
    case 'LCP':
      rating = value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      break;
    case 'FCP':
      rating = value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
      break;
    case 'TTFB':
      rating = value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor';
      break;
    case 'INP':
      rating = value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
      break;
  }

  console.log(`[Web Vital] ${name}:`, {
    value: Math.round(value),
    rating,
    id,
  });

  // Send to analytics
  if (window.gtag) {
    window.gtag('event', name, {
      value: Math.round(value),
      metric_id: id,
      metric_value: value,
      metric_rating: rating,
    });
  }

  // Store in localStorage for debugging
  try {
    const vitals = JSON.parse(localStorage.getItem('web-vitals') || '[]');
    vitals.push({
      name,
      value: Math.round(value),
      rating,
      timestamp: Date.now(),
    });

    // Keep only last 50 metrics
    if (vitals.length > 50) {
      vitals.shift();
    }

    localStorage.setItem('web-vitals', JSON.stringify(vitals));
  } catch (error) {
    // Ignore localStorage errors
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  navigation?: PerformanceNavigationTiming;
  resources?: PerformanceResourceTiming[];
  vitals?: PerformanceMetric[];
} {
  if (typeof window === 'undefined') return {};

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  // Get stored vitals
  let vitals: PerformanceMetric[] = [];
  try {
    vitals = JSON.parse(localStorage.getItem('web-vitals') || '[]');
  } catch (error) {
    // Ignore errors
  }

  return {
    navigation,
    resources,
    vitals,
  };
}

/**
 * Format duration to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Check if connection is slow
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) return false;

  // Check effective type
  const effectiveType = connection.effectiveType;
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return true;
  }

  // Check downlink speed (Mbps)
  if (connection.downlink < 1) {
    return true;
  }

  return false;
}

/**
 * Get connection info
 */
export function getConnectionInfo(): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} | null {
  if (typeof navigator === 'undefined') return null;

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Monitor long tasks
 */
export function monitorLongTasks(callback: (entry: PerformanceEntry) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback(entry);
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  } catch (error) {
    console.error('Long task monitoring not supported');
    return () => {};
  }
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics(): void {
  const summary = getPerformanceSummary();

  console.group('Performance Metrics');

  if (summary.navigation) {
    console.log('Navigation:', {
      'DNS Lookup': formatDuration(summary.navigation.domainLookupEnd - summary.navigation.domainLookupStart),
      'TCP Connection': formatDuration(summary.navigation.connectEnd - summary.navigation.connectStart),
      'Request': formatDuration(summary.navigation.responseStart - summary.navigation.requestStart),
      'Response': formatDuration(summary.navigation.responseEnd - summary.navigation.responseStart),
      'DOM Processing': formatDuration(summary.navigation.domComplete - (summary.navigation as any).domLoading),
      'Total': formatDuration(summary.navigation.loadEventEnd - summary.navigation.fetchStart),
    });
  }

  if (summary.resources && summary.resources.length > 0) {
    const totalSize = summary.resources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
    console.log('Resources:', {
      'Count': summary.resources.length,
      'Total Size': `${Math.round(totalSize / 1024)}KB`,
      'Average Duration': formatDuration(
        summary.resources.reduce((acc, r) => acc + r.duration, 0) / summary.resources.length
      ),
    });
  }

  if (summary.vitals && summary.vitals.length > 0) {
    console.log('Web Vitals:', summary.vitals);
  }

  const connection = getConnectionInfo();
  if (connection) {
    console.log('Connection:', connection);
  }

  console.groupEnd();
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}
