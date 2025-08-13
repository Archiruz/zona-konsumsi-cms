"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  apiCallCount: number;
  averageResponseTime: number;
  lastResponseTime: number;
  totalResponseTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiCallCount: 0,
    averageResponseTime: 0,
    lastResponseTime: 0,
    totalResponseTime: 0,
  });

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") return;

    const originalFetch = window.fetch;
    let callCount = 0;
    let totalTime = 0;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      callCount++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        totalTime += responseTime;
        
        setMetrics(prev => ({
          apiCallCount: callCount,
          averageResponseTime: totalTime / callCount,
          lastResponseTime: responseTime,
          totalResponseTime: totalTime,
        }));
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        totalTime += responseTime;
        
        setMetrics(prev => ({
          apiCallCount: callCount,
          averageResponseTime: totalTime / callCount,
          lastResponseTime: responseTime,
          totalResponseTime: totalTime,
        }));
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>API Calls: {metrics.apiCallCount}</div>
        <div>Last: {metrics.lastResponseTime.toFixed(2)}ms</div>
        <div>Avg: {metrics.averageResponseTime.toFixed(2)}ms</div>
        <div>Total: {metrics.totalResponseTime.toFixed(2)}ms</div>
      </div>
    </div>
  );
}
