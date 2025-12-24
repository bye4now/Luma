import { useState, useEffect, useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useSubscription } from './useSubscription';

export interface PremiumFeatures {
  cloudBackup: boolean;
  multiDeviceSync: boolean;
  exportToPdf: boolean;
  exportToWord: boolean;
  unlimitedEntries: boolean;
  advancedAnalytics: boolean;
  customThemes: boolean;
  prioritySupport: boolean;
}

export interface CloudSyncStatus {
  isEnabled: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  syncError: string | null;
}

const PREMIUM_STORAGE_KEY = 'premium_status';
const SYNC_STATUS_KEY = 'cloud_sync_status';

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const subscription = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isEnabled: false,
    lastSync: null,
    isSyncing: false,
    syncError: null,
  });

  const premiumFeatures: PremiumFeatures = useMemo(() => ({
    cloudBackup: subscription.isPremium,
    multiDeviceSync: subscription.isPremium,
    exportToPdf: subscription.isPremium,
    exportToWord: subscription.isPremium,
    unlimitedEntries: subscription.isPremium,
    advancedAnalytics: subscription.isPremium,
    customThemes: subscription.isPremium,
    prioritySupport: subscription.isPremium,
  }), [subscription.isPremium]);

  const loadPremiumStatus = useCallback(async () => {
    // Premium status is now managed by subscription hook
    setIsLoading(false);
  }, []);

  const loadSyncStatus = useCallback(async () => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSyncStatus({
          ...parsed,
          lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
        });
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }, []);

  useEffect(() => {
    loadPremiumStatus();
    loadSyncStatus();
  }, [loadPremiumStatus, loadSyncStatus]);

  const savePremiumStatus = useCallback(async (status: boolean) => {
    // Premium status is now managed by subscription hook
    console.log('Premium status managed by subscription system:', status);
  }, []);

  const saveSyncStatus = useCallback(async (status: CloudSyncStatus) => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  }, []);

  const upgradeToPremium = useCallback(async () => {
    console.log('Upgrading to premium via subscription...');
    // This now triggers the subscription modal instead
    throw new Error('Use subscription system for upgrades');
  }, []);

  const enableCloudSync = useCallback(async () => {
    if (!subscription.isPremium) {
      throw new Error('Premium subscription required for cloud sync');
    }

    const newStatus: CloudSyncStatus = {
      isEnabled: true,
      lastSync: null,
      isSyncing: false,
      syncError: null,
    };

    setSyncStatus(newStatus);
    await saveSyncStatus(newStatus);
    console.log('Cloud sync enabled');
  }, [subscription.isPremium, saveSyncStatus]);

  const disableCloudSync = useCallback(async () => {
    const newStatus: CloudSyncStatus = {
      isEnabled: false,
      lastSync: syncStatus.lastSync,
      isSyncing: false,
      syncError: null,
    };

    setSyncStatus(newStatus);
    await saveSyncStatus(newStatus);
    console.log('Cloud sync disabled');
  }, [syncStatus.lastSync, saveSyncStatus]);

  const syncToCloud = useCallback(async (entries: any[]) => {
    if (!subscription.isPremium || !syncStatus.isEnabled) {
      throw new Error('Cloud sync not available');
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Syncing entries to cloud:', entries.length);
      
      const newStatus: CloudSyncStatus = {
        ...syncStatus,
        lastSync: new Date(),
        isSyncing: false,
        syncError: null,
      };

      setSyncStatus(newStatus);
      await saveSyncStatus(newStatus);
      
      return { success: true, syncedCount: entries.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      const newStatus: CloudSyncStatus = {
        ...syncStatus,
        isSyncing: false,
        syncError: errorMessage,
      };

      setSyncStatus(newStatus);
      await saveSyncStatus(newStatus);
      
      throw error;
    }
  }, [subscription.isPremium, syncStatus, saveSyncStatus]);

  const getEntryLimit = useCallback(() => {
    return subscription.isPremium ? null : 10;
  }, [subscription.isPremium]);

  const canAddEntry = useCallback((todaysEntryCount: number) => {
    if (isLoading || subscription.isLoading) return true;
    const limit = getEntryLimit();
    return limit === null || todaysEntryCount < limit;
  }, [getEntryLimit, isLoading, subscription.isLoading]);

  return useMemo(() => ({
    isPremium: subscription.isPremium,
    isLoading: isLoading || subscription.isLoading,
    premiumFeatures,
    syncStatus,
    upgradeToPremium,
    enableCloudSync,
    disableCloudSync,
    syncToCloud,
    getEntryLimit,
    canAddEntry,
    subscription, // Expose subscription details
  }), [
    subscription.isPremium,
    subscription.isLoading,
    isLoading,
    premiumFeatures,
    syncStatus,
    upgradeToPremium,
    enableCloudSync,
    disableCloudSync,
    syncToCloud,
    getEntryLimit,
    canAddEntry,
    subscription,
  ]);
});