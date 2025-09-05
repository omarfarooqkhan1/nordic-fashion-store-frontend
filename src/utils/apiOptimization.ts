// API Optimization utilities to reduce network dependency chains

interface ApiCall {
  key: string;
  fn: () => Promise<any>;
  dependencies?: string[];
  priority?: 'high' | 'medium' | 'low';
}

class ApiOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingCalls = new Map<string, Promise<any>>();
  private callQueue: ApiCall[] = [];
  private isProcessing = false;

  // Set cache with TTL
  setCache(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get from cache
  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Batch API calls to reduce network requests
  async batchCall<T>(key: string, fn: () => Promise<T>, ttl: number = 5 * 60 * 1000): Promise<T> {
    // Check cache first
    const cached = this.getCache(key);
    if (cached) {
      return cached;
    }

    // Check if call is already pending
    if (this.pendingCalls.has(key)) {
      return this.pendingCalls.get(key)!;
    }

    // Create new call
    const callPromise = fn().then(data => {
      this.setCache(key, data, ttl);
      this.pendingCalls.delete(key);
      return data;
    }).catch(error => {
      this.pendingCalls.delete(key);
      throw error;
    });

    this.pendingCalls.set(key, callPromise);
    return callPromise;
  }

  // Queue API calls with dependencies
  queueCall(call: ApiCall) {
    this.callQueue.push(call);
    this.processQueue();
  }

  // Process queued calls
  private async processQueue() {
    if (this.isProcessing || this.callQueue.length === 0) return;

    this.isProcessing = true;

    while (this.callQueue.length > 0) {
      // Sort by priority
      this.callQueue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium']);
      });

      const call = this.callQueue.shift();
      if (!call) break;

      // Check dependencies
      const dependenciesMet = !call.dependencies || 
        call.dependencies.every(dep => this.getCache(dep) !== null);

      if (dependenciesMet) {
        try {
          await this.batchCall(call.key, call.fn);
        } catch (error) {
        }
      } else {
        // Re-queue if dependencies not met
        this.callQueue.push(call);
        break;
      }
    }

    this.isProcessing = false;
  }

  // Preload critical data
  async preloadCriticalData() {
    const criticalCalls: ApiCall[] = [
      {
        key: 'products',
        fn: () => import('@/api/products').then(module => module.fetchProducts()),
        priority: 'high',
        ttl: 10 * 60 * 1000 // 10 minutes
      },
      {
        key: 'categories',
        fn: () => import('@/api/categories').then(module => module.fetchCategories()),
        priority: 'high',
        ttl: 30 * 60 * 1000 // 30 minutes
      }
    ];

    criticalCalls.forEach(call => this.queueCall(call));
  }

  // Optimize cart operations
  async optimizeCartOperations() {
    // Debounce cart updates
    let cartUpdateTimeout: NodeJS.Timeout;
    
    return {
      debouncedUpdate: (updateFn: () => Promise<void>, delay: number = 500) => {
        clearTimeout(cartUpdateTimeout);
        cartUpdateTimeout = setTimeout(updateFn, delay);
      },
      
      batchCartUpdates: async (updates: (() => Promise<void>)[]) => {
        try {
          await Promise.all(updates.map(update => update()));
        } catch (error) {
        }
      }
    };
  }

  // Clear cache
  clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      pendingCalls: this.pendingCalls.size,
      queuedCalls: this.callQueue.length
    };
  }
}

// Singleton instance
export const apiOptimizer = new ApiOptimizer();

// Hook for React components
export const useApiOptimization = () => {
  return {
    batchCall: apiOptimizer.batchCall.bind(apiOptimizer),
    queueCall: apiOptimizer.queueCall.bind(apiOptimizer),
    preloadCriticalData: apiOptimizer.preloadCriticalData.bind(apiOptimizer),
    optimizeCartOperations: apiOptimizer.optimizeCartOperations.bind(apiOptimizer),
    clearCache: apiOptimizer.clearCache.bind(apiOptimizer),
    getCacheStats: apiOptimizer.getCacheStats.bind(apiOptimizer)
  };
};


