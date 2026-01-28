import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lambsbook_feedback_usage';
const AUTH_TOKEN_KEYS = ['hub_access_token', 'supabase_access_token'];
const MAX_FREE_USES = 3;

interface UsageData {
  count: number;
  lastUsed: string;
}

function checkAuthStatus(): boolean {
  try {
    return AUTH_TOKEN_KEYS.some(key => !!localStorage.getItem(key));
  } catch {
    return false;
  }
}

export function useFeedbackUsage() {
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const updateAuthAndUsage = () => {
      const authStatus = checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        setUsageCount(0);
        setIsLoading(false);
        return;
      }

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: UsageData = JSON.parse(stored);
          setUsageCount(data.count);
        }
      } catch (e) {
        console.error('Error reading usage data:', e);
      }
      setIsLoading(false);
    };

    updateAuthAndUsage();

    const handleStorageChange = (e: StorageEvent) => {
      if (AUTH_TOKEN_KEYS.includes(e.key || '')) {
        updateAuthAndUsage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const incrementUsage = useCallback(() => {
    if (isAuthenticated) return;

    const newCount = usageCount + 1;
    setUsageCount(newCount);
    
    try {
      const data: UsageData = {
        count: newCount,
        lastUsed: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving usage data:', e);
    }
  }, [usageCount, isAuthenticated]);

  const refreshAuth = useCallback(() => {
    const authStatus = checkAuthStatus();
    setIsAuthenticated(authStatus);
    return authStatus;
  }, []);

  const remainingUses = isAuthenticated ? Infinity : Math.max(0, MAX_FREE_USES - usageCount);
  const hasReachedLimit = !isAuthenticated && usageCount >= MAX_FREE_USES;
  const canUse = isAuthenticated || usageCount < MAX_FREE_USES;

  return {
    usageCount,
    remainingUses,
    hasReachedLimit,
    canUse,
    incrementUsage,
    refreshAuth,
    isLoading,
    maxFreeUses: MAX_FREE_USES,
    isAuthenticated,
  };
}
