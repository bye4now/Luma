import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useJournal } from '@/hooks/useJournal';

interface Props {
  selectedDate: Date;
  onDateSelect: (date: Date, viewMode: 'active' | 'archived' | 'deleted') => void;
  onClose: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({ selectedDate, onDateSelect, onClose }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [viewMode, setViewMode] = useState<'archived' | 'deleted'>('archived');
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(selectedDate);
  const [isProcessing, setIsProcessing] = useState(false);
  const { entries } = useJournal();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    const startDate = new Date(year, month, 1);
    startDate.setDate(1 - firstDayOfWeek);
    
    const days: Date[] = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(year, month, 1 - firstDayOfWeek + i);
      days.push(date);
    }
    
    return days;
  }, [currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };



  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === tempSelectedDate.toDateString();
  };

  const hasEntriesOnDate = useMemo(() => {
    const cache = new Map<string, { archived: boolean; deleted: boolean }>();
    return (date: Date) => {
      const key = date.toDateString();
      if (!cache.has(key)) {
        const hasArchived = entries.some(entry => {
          if (!entry || !entry.date) return false;
          const entryDate = new Date(entry.date);
          return entryDate.toDateString() === date.toDateString() && entry.isArchivedToCalendar === true && entry.isDeleted !== true;
        });
        
        const hasDeleted = entries.some(entry => {
          if (!entry || !entry.date) return false;
          const entryDate = new Date(entry.date);
          return entryDate.toDateString() === date.toDateString() && entry.isDeleted === true;
        });
        
        cache.set(key, { archived: hasArchived, deleted: hasDeleted });
      }
      return cache.get(key)!;
    };
  }, [entries]);



  const handleDatePress = (date: Date) => {
    setTempSelectedDate(date);
  };

  const handleGoPress = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    console.log('📅 Calendar Go pressed:', {
      date: tempSelectedDate.toISOString(),
      viewMode,
    });
    
    onDateSelect(tempSelectedDate, viewMode);
    setIsProcessing(false);
    onClose();
  };

  const handleClose = () => {
    // Reset to today and active view mode
    const today = new Date();
    onDateSelect(today, 'active');
    onClose();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <ChevronRight size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'archived' && styles.toggleButtonActive]}
          onPress={() => setViewMode('archived')}
        >
          <Text style={[styles.toggleText, viewMode === 'archived' && styles.toggleTextActive]}>Archived</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'deleted' && styles.toggleButtonActive]}
          onPress={() => setViewMode('deleted')}
        >
          <Text style={[styles.toggleText, viewMode === 'deleted' && styles.toggleTextActive]}>Deleted</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysHeader}>
        {DAYS.map(day => (
          <Text key={day} style={styles.dayHeaderText}>
            {day}
          </Text>
        ))}
      </View>

      <ScrollView style={styles.calendarGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.weeksContainer}>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
                const isCurrentMonthDate = isCurrentMonth(date);
                const isTodayDate = isToday(date);
                const isSelectedDate = isSelected(date);

                const entriesInfo = hasEntriesOnDate(date);
                const hasArchivedEntriesDate = entriesInfo.archived;
                const hasDeletedEntriesDate = entriesInfo.deleted;
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayButton,
                      isTodayDate && styles.todayButton,
                      isSelectedDate && styles.selectedButton,
                    ]}
                    onPress={() => handleDatePress(date)}
                  >
                    <Text style={[
                      styles.dayText,
                      !isCurrentMonthDate && styles.otherMonthText,
                      isTodayDate && styles.todayText,
                      isSelectedDate && styles.selectedText,
                    ]}>
                      {date.getDate()}
                    </Text>
                    {isCurrentMonthDate && (
                      <View style={styles.entryIndicators}>
                        {viewMode === 'archived' && hasArchivedEntriesDate && (
                          <View style={[
                            styles.entryDot,
                            styles.archivedDot,
                            isSelectedDate && styles.selectedEntryDot
                          ]} />
                        )}
                        {viewMode === 'deleted' && hasDeletedEntriesDate && (
                          <View style={[
                            styles.entryDot,
                            styles.deletedDot,
                            isSelectedDate && styles.selectedEntryDot
                          ]} />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.goButton, isProcessing && styles.disabledButton]} 
          onPress={handleGoPress}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <Text style={styles.goButtonText}>Go</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    width: '95%',
    maxWidth: 450,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    flex: 1,
    textAlign: 'center' as const,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayHeaderText: {
    width: '13.5%',
    textAlign: 'center' as const,
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
    paddingVertical: 8,
  },
  calendarGrid: {
    maxHeight: 300,
  },
  weeksContainer: {
    gap: 4,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '13.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  todayButton: {
    backgroundColor: 'rgba(184, 221, 160, 0.2)',
  },
  selectedButton: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
  },
  otherMonthText: {
    color: '#6b7280',
  },
  todayText: {
    color: colors.primary,
    fontWeight: '700' as const,
  },
  selectedText: {
    color: colors.background,
    fontWeight: '700' as const,
  },
  entryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  selectedEntryDot: {
    backgroundColor: colors.background,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  goButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  goButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
    alignSelf: 'center',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
  },
  toggleTextActive: {
    color: colors.background,
  },
  entryIndicators: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  archivedDot: {
    backgroundColor: colors.yellow,
  },
  deletedDot: {
    backgroundColor: colors.accent,
  },
  disabledButton: {
    opacity: 0.5,
  },
});