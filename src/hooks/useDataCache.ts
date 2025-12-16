import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface DataCache {
  projects?: CacheItem<any[]>;
  services?: CacheItem<any[]>;
  websiteContact?: CacheItem<any>;
}

const CACHE_TTL = {
  projects: 5 * 60 * 1000, // 5 minutes
  services: 10 * 60 * 1000, // 10 minutes
  websiteContact: 15 * 60 * 1000, // 15 minutes
};

const cache: DataCache = {};

const isCacheValid = <T>(cacheItem: CacheItem<T> | undefined): boolean => {
  if (!cacheItem) return false;
  return Date.now() - cacheItem.timestamp < cacheItem.ttl;
};

const setCacheItem = <T>(key: keyof DataCache, data: T): void => {
  cache[key] = {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL[key]
  };
};

const getCacheItem = <T>(key: keyof DataCache): T | null => {
  const cacheItem = cache[key];
  if (isCacheValid(cacheItem)) {
    return cacheItem?.data || null;
  }
  return null;
};

export const invalidateCache = (key: keyof DataCache): void => {
  delete cache[key];
};

export const invalidateAllCache = (): void => {
  Object.keys(cache).forEach(key => delete cache[key]);
};

export const useDataCache = () => {
  const [cacheStatus, setCacheStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const getCachedProjects = useCallback(async () => {
    const cached = getCacheItem<any[]>('projects');
    if (cached) {
      console.log('Using cached projects data');
      return cached;
    }

    console.log('Fetching fresh projects data');
    setCacheStatus(prev => ({ ...prev, projects: 'loading' }));
    
    try {
      const { api } = await import('@/lib/api');
      const data = await api.getProjects();
      setCacheItem('projects', data);
      setCacheStatus(prev => ({ ...prev, projects: 'success' }));
      return data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setCacheStatus(prev => ({ ...prev, projects: 'error' }));
      throw error;
    }
  }, []);

  const getCachedServices = useCallback(async () => {
    const cached = getCacheItem<any[]>('services');
    if (cached) {
      console.log('Using cached services data');
      return cached;
    }

    console.log('Fetching fresh services data');
    setCacheStatus(prev => ({ ...prev, services: 'loading' }));
    
    try {
      const { api } = await import('@/lib/api');
      const data = await api.getServices();
      setCacheItem('services', data);
      setCacheStatus(prev => ({ ...prev, services: 'success' }));
      return data;
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setCacheStatus(prev => ({ ...prev, services: 'error' }));
      throw error;
    }
  }, []);

  const getCachedWebsiteContact = useCallback(async () => {
    const cached = getCacheItem<any>('websiteContact');
    if (cached) {
      console.log('Using cached website contact data');
      return cached;
    }

    console.log('Fetching fresh website contact data');
    setCacheStatus(prev => ({ ...prev, websiteContact: 'loading' }));
    
    try {
      const { api } = await import('@/lib/api');
      const data = await api.getWebsiteContact();
      setCacheItem('websiteContact', data);
      setCacheStatus(prev => ({ ...prev, websiteContact: 'success' }));
      return data;
    } catch (error) {
      console.error('Failed to fetch website contact:', error);
      setCacheStatus(prev => ({ ...prev, websiteContact: 'error' }));
      throw error;
    }
  }, []);

  return {
    getCachedProjects,
    getCachedServices,
    getCachedWebsiteContact,
    invalidateCache,
    invalidateAllCache,
    cacheStatus
  };
};
