import { useEffect } from 'react';

interface PerformanceMonitorProps {
  enabled?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ enabled = true }) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    const measureWebVitals = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          });

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      }

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 1000) { // Log slow resources
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    };

    // Monitor memory usage
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        // Memory monitoring can be implemented here if needed
      }
    };

    // Monitor network performance
    const measureNetwork = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        // Network monitoring can be implemented here if needed
      }
    };

    // Run measurements
    measureWebVitals();
    measureMemory();
    measureNetwork();

    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(measureMemory, 30000);

    // Monitor network changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', measureNetwork);
    }

    return () => {
      clearInterval(memoryInterval);
    };
  }, [enabled]);

  return null;
};

export default PerformanceMonitor;

