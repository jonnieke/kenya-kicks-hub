// Performance Monitoring Utility
// Tracks Core Web Vitals and other performance metrics

export interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  tti: number;
  speedIndex: number;
}

export interface PerformanceReport {
  timestamp: number;
  url: string;
  metrics: PerformanceMetrics;
  userAgent: string;
  connection: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe LCP (Largest Contentful Paint)
      this.observeLCP();
      
      // Observe FID (First Input Delay)
      this.observeFID();
      
      // Observe CLS (Cumulative Layout Shift)
      this.observeCLS();
      
      // Observe FCP (First Contentful Paint)
      this.observeFCP();
      
      // Observe TTFB (Time to First Byte)
      this.observeTTFB();
      
      this.isInitialized = true;
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        this.metrics.lcp = lastEntry.startTime;
        this.logMetric('LCP', this.metrics.lcp);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Failed to observe LCP:', error);
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Cast to PerformanceEventTiming to access processingStart
          const eventEntry = entry as PerformanceEventTiming;
          if (eventEntry.processingStart) {
            this.metrics.fid = eventEntry.processingStart - entry.startTime;
            this.logMetric('FID', this.metrics.fid);
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Failed to observe FID:', error);
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
            this.logMetric('CLS', this.metrics.cls);
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Failed to observe CLS:', error);
    }
  }

  private observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0] as PerformanceEntry;
        this.metrics.fcp = firstEntry.startTime;
        this.logMetric('FCP', this.metrics.fcp);
      });
      
      observer.observe({ entryTypes: ['first-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Failed to observe FCP:', error);
    }
  }

  private observeTTFB() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const navigationEntry = entries.find(
          (entry) => entry.entryType === 'navigation'
        ) as PerformanceNavigationTiming;
        
        if (navigationEntry) {
          this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          this.logMetric('TTFB', this.metrics.ttfb);
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Failed to observe TTFB:', error);
    }
  }

  private logMetric(name: string, value: number) {
    console.log(`📊 ${name}: ${value.toFixed(2)}ms`);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        page_location: window.location.href
      });
    }
  }

  // Get current performance metrics
  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Get performance report
  public getReport(): PerformanceReport {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: {
        lcp: this.metrics.lcp || 0,
        fid: this.metrics.fid || 0,
        cls: this.metrics.cls || 0,
        fcp: this.metrics.fcp || 0,
        ttfb: this.metrics.ttfb || 0,
        tti: this.calculateTTI(),
        speedIndex: this.calculateSpeedIndex()
      },
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency
    };
  }

  private calculateTTI(): number {
    // Estimate TTI based on available metrics
    const fcp = this.metrics.fcp || 0;
    const lcp = this.metrics.lcp || 0;
    
    // TTI is typically between FCP and LCP
    return fcp + (lcp - fcp) * 0.7;
  }

  private calculateSpeedIndex(): number {
    // Estimate Speed Index based on FCP and LCP
    const fcp = this.metrics.fcp || 0;
    const lcp = this.metrics.lcp || 0;
    
    // Speed Index is typically between FCP and LCP
    return fcp + (lcp - fcp) * 0.5;
  }

  private getConnectionInfo(): string {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      return `${conn.effectiveType || 'unknown'} (${conn.downlink || 'unknown'}Mbps)`;
    }
    return 'unknown';
  }

  // Check if metrics meet performance targets
  public checkPerformanceTargets(): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    const targets = {
      lcp: 2500, // 2.5s
      fid: 100,  // 100ms
      cls: 0.1,  // 0.1
      fcp: 1800, // 1.8s
      ttfb: 600  // 600ms
    };

    if (this.metrics.lcp && this.metrics.lcp > targets.lcp) {
      issues.push(`LCP (${this.metrics.lcp.toFixed(0)}ms) exceeds target (${targets.lcp}ms)`);
    }

    if (this.metrics.fid && this.metrics.fid > targets.fid) {
      issues.push(`FID (${this.metrics.fid.toFixed(0)}ms) exceeds target (${targets.fid}ms)`);
    }

    if (this.metrics.cls && this.metrics.cls > targets.cls) {
      issues.push(`CLS (${this.metrics.cls.toFixed(3)}) exceeds target (${targets.cls})`);
    }

    if (this.metrics.fcp && this.metrics.fcp > targets.fcp) {
      issues.push(`FCP (${this.metrics.fcp.toFixed(0)}ms) exceeds target (${targets.fcp}ms)`);
    }

    if (this.metrics.ttfb && this.metrics.ttfb > targets.ttfb) {
      issues.push(`TTFB (${this.metrics.ttfb.toFixed(0)}ms) exceeds target (${targets.ttfb}ms)`);
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  // Cleanup observers
  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utility functions
export const getPerformanceMetrics = () => performanceMonitor.getMetrics();
export const getPerformanceReport = () => performanceMonitor.getReport();
export const checkPerformanceTargets = () => performanceMonitor.checkPerformanceTargets();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.destroy();
  });
}
