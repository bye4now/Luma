import { useState, useEffect, useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';

export type MoodType = 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful' | 'frustrated' | 'content' | 'energetic' | 'peaceful';

export interface JournalEntry {
  id: string;
  text: string;
  date: Date;
  createdAt: Date;
  mood?: MoodType;
  tags?: string[];
  isArchivedToCalendar?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
}

const STORAGE_KEY = 'journal_entries';

export const [JournalProvider, useJournal] = createContextHook(() => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    try {
      console.log('🔵 [useJournal] Loading entries from AsyncStorage...');
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('🔵 [useJournal] Raw stored data:', stored ? stored.substring(0, 100) : 'null');
      
      if (stored) {
        const parsedEntries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt),
          deletedAt: entry.deletedAt ? new Date(entry.deletedAt) : undefined,
        }));
        console.log('🟢 [useJournal] Loaded', parsedEntries.length, 'entries from storage');
        console.log('🟢 [useJournal] First entry:', parsedEntries[0] ? {
          id: parsedEntries[0].id,
          text: parsedEntries[0].text.substring(0, 30),
          date: parsedEntries[0].date.toISOString(),
          isDeleted: parsedEntries[0].isDeleted,
          isArchivedToCalendar: parsedEntries[0].isArchivedToCalendar,
        } : 'none');
        setEntries(parsedEntries);
      } else {
        console.log('🟡 [useJournal] No stored entries found');
      }
    } catch (error) {
      console.error('🔴 [useJournal] Failed to load entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntries = useCallback(async (newEntries: JournalEntry[]) => {
    if (!newEntries || !Array.isArray(newEntries)) {
      console.log('🔴 [useJournal] saveEntries: invalid entries array');
      return;
    }
    try {
      console.log('🔵 [useJournal] Saving', newEntries.length, 'entries to AsyncStorage...');
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const serialized = JSON.stringify(newEntries);
      await AsyncStorage.setItem(STORAGE_KEY, serialized);
      console.log('🟢 [useJournal] Successfully saved entries to storage');
      
      // Verify the save
      const verification = await AsyncStorage.getItem(STORAGE_KEY);
      if (verification) {
        const verifiedCount = JSON.parse(verification).length;
        console.log('🟢 [useJournal] Verification: storage now contains', verifiedCount, 'entries');
      }
    } catch (error) {
      console.error('🔴 [useJournal] Failed to save entries:', error);
    }
  }, []);

  const getTodaysEntries = useCallback((date: Date = new Date()) => {
    if (!date || !(date instanceof Date)) return [];
    const targetDateString = date.toDateString();

    return entries.filter(entry => {
      if (!entry || !entry.date) return false;
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === targetDateString;
    });
  }, [entries]);

  const addEntry = useCallback(async (text: string, mood?: MoodType, tags?: string[], checkLimit?: (count: number) => boolean) => {
    console.log('🔵 [useJournal] addEntry called with text:', text?.substring(0, 50));
    console.log('🔵 [useJournal] Current entries count:', entries.length);
    
    if (!text?.trim()) {
      console.log('🔴 [useJournal] No text provided, returning false');
      return false;
    }
    
    // Check entry limit if provided
    if (checkLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= today && entryDate < tomorrow;
      });
      
      console.log('🔵 [useJournal] Today\'s entries count:', todaysEntries.length);
      
      if (!checkLimit(todaysEntries.length)) {
        console.log('🔴 [useJournal] Entry limit reached for today');
        return false;
      }
    }
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text: text.trim(),
      date: new Date(),
      createdAt: new Date(),
      mood,
      tags,
    };

    console.log('🟢 [useJournal] Creating new entry:', newEntry.id);
    console.log('🟢 [useJournal] Entry date:', newEntry.date.toISOString());
    console.log('🟢 [useJournal] Entry mood:', newEntry.mood);

    const updatedEntries = [newEntry, ...entries];
    console.log('🟢 [useJournal] Updated entries count:', updatedEntries.length);
    
    await saveEntries(updatedEntries);
    setEntries(updatedEntries);
    
    console.log('🟢 [useJournal] Entry added successfully');
    return true;
  }, [entries, saveEntries]);

  const deleteEntry = useCallback((id: string, permanent: boolean = false) => {
    if (!id) return;
    setEntries(prev => {
      let updatedEntries;
      if (permanent) {
        // Permanent delete - remove from array
        updatedEntries = prev.filter(entry => entry.id !== id);
      } else {
        // Soft delete - mark as deleted
        updatedEntries = prev.map(entry => 
          entry.id === id 
            ? { ...entry, isDeleted: true, deletedAt: new Date() }
            : entry
        );
      }
      saveEntries(updatedEntries);
      return updatedEntries;
    });
  }, [saveEntries]);

  const getEntriesByDate = useCallback((date: Date) => {
    if (!date || !(date instanceof Date)) return [];
    const targetDateString = date.toDateString();

    return entries.filter(entry => {
      if (!entry || !entry.date) return false;
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === targetDateString;
    });
  }, [entries]);

  const getEntriesByMonth = useCallback((year: number, month: number) => {
    return entries.filter(entry => {
      if (!entry || !entry.date) return false;
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });
  }, [entries]);

  const getDatesWithEntries = useCallback((year: number, month: number) => {
    const entriesInMonth = getEntriesByMonth(year, month);
    const datesWithEntries = new Set<string>();
    
    entriesInMonth.forEach(entry => {
      const date = new Date(entry.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      datesWithEntries.add(dateKey);
    });
    
    return datesWithEntries;
  }, [getEntriesByMonth]);

  const archiveToCalendar = useCallback((id: string) => {
    if (!id) return;
    setEntries(prev => {
      const updatedEntries = prev.map(entry => 
        entry.id === id 
          ? { ...entry, isArchivedToCalendar: true }
          : entry
      );
      saveEntries(updatedEntries);
      return updatedEntries;
    });
  }, [saveEntries]);

  const getActiveEntries = useCallback((date: Date) => {
    if (!date || !(date instanceof Date)) return [];
    const targetDateString = date.toDateString();

    return entries.filter(entry => {
      if (!entry || !entry.date || entry.isArchivedToCalendar || entry.isDeleted) return false;
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === targetDateString;
    });
  }, [entries]);

  const getArchivedEntries = useCallback((date: Date) => {
    if (!date || !(date instanceof Date)) return [];
    const targetDate = new Date(date);
    targetDate.setHours(23, 59, 59, 999);

    return entries.filter(entry => {
      if (!entry || !entry.date) return false;
      const entryDate = new Date(entry.date);
      const isUpToDate = entryDate <= targetDate;
      const isArchived = entry.isArchivedToCalendar === true;
      const isNotDeleted = entry.isDeleted !== true;
      return isUpToDate && isArchived && isNotDeleted;
    });
  }, [entries]);

  const restoreEntry = useCallback((id: string) => {
    if (!id) return;
    setEntries(prev => {
      const updatedEntries = prev.map(entry => 
        entry.id === id 
          ? { ...entry, isDeleted: false, deletedAt: undefined }
          : entry
      );
      saveEntries(updatedEntries);
      return updatedEntries;
    });
  }, [saveEntries]);

  const getDeletedEntries = useCallback((date: Date) => {
    if (!date || !(date instanceof Date)) return [];
    const targetDate = new Date(date);
    targetDate.setHours(23, 59, 59, 999);

    return entries.filter(entry => {
      if (!entry || !entry.date) return false;
      const entryDate = new Date(entry.date);
      const isUpToDate = entryDate <= targetDate;
      const isDeleted = entry.isDeleted === true;
      return isUpToDate && isDeleted;
    });
  }, [entries]);

  const clearAllEntries = useCallback(() => {
    setEntries([]);
    saveEntries([]);
  }, [saveEntries]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const contextValue = useMemo(() => ({
    entries,
    isLoading,
    addEntry,
    deleteEntry,
    restoreEntry,
    archiveToCalendar,
    getTodaysEntries,
    getEntriesByDate,
    getActiveEntries,
    getArchivedEntries,
    getDeletedEntries,
    getEntriesByMonth,
    getDatesWithEntries,
    clearAllEntries,
  }), [entries, isLoading, addEntry, deleteEntry, restoreEntry, archiveToCalendar, getTodaysEntries, getEntriesByDate, getActiveEntries, getArchivedEntries, getDeletedEntries, getEntriesByMonth, getDatesWithEntries, clearAllEntries]);

  return contextValue;
});