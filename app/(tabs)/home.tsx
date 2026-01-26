import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Calendar as CalendarIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useJournal } from '@/hooks/useJournal';
import { useHoroscope } from '@/hooks/useHoroscope';
import { usePremium } from '@/hooks/usePremium';
import { JournalEntry } from '@/components/JournalEntry';
import { BirthDateSetup } from '@/components/BirthDateSetup';
import { Calendar } from '@/components/Calendar';
import { TrialBanner } from '@/components/SubscriptionComponents';
import { formatDate, formatDateShort, isToday } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';

// ✅ Use the image you added to assets/images
import LumaLogo from '@/assets/images/LUMA_App_Icon_512px.png';

export default function JournalScreen() {
  const {
    entries,
    getActiveEntries,
    getArchivedEntries,
    getDeletedEntries,
    isLoading: journalLoading,
  } = useJournal();

  const { canAddEntry, getEntryLimit, isLoading: premiumLoading } = usePremium();
  const insets = useSafeAreaInsets();
  const { hasBirthDate } = useHoroscope();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedViewMode, setSelectedViewMode] = useState<
    'active' | 'archived' | 'deleted'
  >('active');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBirthDateSetup, setShowBirthDateSetup] = useState(false);

  // ✅ Helper: compare days (ignoring time)
  const isSameDay = (a: Date, b: Date) => {
    const d1 = new Date(a);
    const d2 = new Date(b);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() === d2.getTime();
  };

  // ✅ All active entries (not archived, not deleted), newest first
  const allActiveEntries = useMemo(() => {
    if (journalLoading || !entries) return [];

    return entries
      .filter((entry) => {
        if (!entry || !entry.date) return false;
        const isActive = !entry.isArchivedToCalendar && !entry.isDeleted;
        return isActive;
      })
      .sort((a, b) => {
        const aTime = a?.date ? new Date(a.date).getTime() : 0;
        const bTime = b?.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime; // newest first
      });
  }, [entries, journalLoading]);

  // ✅ FIX: selectedEntries logic
  const selectedEntries = useMemo(() => {
    if (journalLoading || !entries) {
      console.log('🔵 [Home] selectedEntries: loading or no entries');
      return [];
    }

    // Archived/Deleted behave the same as before
    if (selectedViewMode === 'archived') {
      return getArchivedEntries(selectedDate);
    }

    if (selectedViewMode === 'deleted') {
      return getDeletedEntries(selectedDate);
    }

    // ✅ Active view behavior:
    // If looking at today -> show ALL active entries (so they don't "disappear" tomorrow)
    if (isToday(selectedDate)) {
      return allActiveEntries;
    }

    // If looking at another day -> show active entries for that day only
    return allActiveEntries.filter((entry) => {
      if (!entry?.date) return false;
      return isSameDay(new Date(entry.date), selectedDate);
    });
  }, [
    entries,
    selectedDate,
    selectedViewMode,
    journalLoading,
    getArchivedEntries,
    getDeletedEntries,
    allActiveEntries,
  ]);

  const todaysEntries = useMemo(() => {
    if (journalLoading || !entries) {
      console.log('🔵 [Home] todaysEntries: loading or no entries');
      return [];
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = entries.filter((entry) => {
      if (!entry || !entry.date) return false;
      const entryDate = new Date(entry.date);
      const isTodayHit = entryDate >= today && entryDate < tomorrow;
      const isActive = !entry.isArchivedToCalendar && !entry.isDeleted;
      return isTodayHit && isActive;
    });

    console.log('🔵 [Home] todaysEntries calculated:', result.length);
    console.log('🔵 [Home] Total entries in state:', entries.length);
    console.log("🔵 [Home] Today's active entries:", result.length);
    return result;
  }, [entries, journalLoading]);

  const entryLimit = useMemo(() => {
    if (premiumLoading) return null;
    return getEntryLimit();
  }, [getEntryLimit, premiumLoading]);

  const canAddMoreEntries = useMemo(() => {
    if (premiumLoading || journalLoading) return true;
    return canAddEntry(todaysEntries.length);
  }, [canAddEntry, todaysEntries.length, premiumLoading, journalLoading]);

  const handleVoiceRecord = () => {
    if (!canAddMoreEntries) {
      console.log('Entry limit reached - upgrade needed');
      return;
    }
    router.push('/record');
  };

  const handleDateChange = () => {
    console.log('📅 Calendar button pressed');
    console.warn('📅 CALENDAR BUTTON PRESSED');
    const today = new Date();
    setSelectedDate(today);
    setSelectedViewMode('active');
    setShowCalendar(true);
  };

  const handleDateSelect = (
    date: Date,
    viewMode: 'active' | 'archived' | 'deleted'
  ) => {
    console.warn('🔴 DATE SELECT CALLED');
    console.warn('🔴 Date:', date.toDateString());
    console.warn('🔴 View mode:', viewMode);
    console.log('📚 [Journal] handleDateSelect called');
    console.log('📚 [Journal] Date:', date.toDateString());
    console.log('📚 [Journal] View mode:', viewMode);
    setSelectedDate(date);
    setSelectedViewMode(viewMode);
  };

  const handleCalendarClose = () => {
    setShowCalendar(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 12,
        }}
      >
        {/* ✅ Logo is now INSIDE the ScrollView, so it scrolls */}
        <View style={styles.logoContainer}>
          <Image source={LumaLogo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dateSection}>
            <Text style={styles.dateDisplayText}>
              {isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.calendarButton}
            onPress={handleDateChange}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CalendarIcon size={28} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Recording Section */}
        <View style={styles.recordingSection}>
          <Text style={styles.recordingTitle}>Voice Journal</Text>
          <Text style={styles.recordingSubtitle}>
            {canAddMoreEntries
              ? 'Tap to record your daily thoughts and reflections'
              : 'Daily limit reached - upgrade for unlimited entries'}
          </Text>

          <TouchableOpacity
            style={[
              styles.recordButton,
              !canAddMoreEntries && styles.recordButtonDisabled,
            ]}
            onPress={handleVoiceRecord}
            disabled={!canAddMoreEntries}
          >
            <LinearGradient
              colors={
                canAddMoreEntries
                  ? [colors.accent, colors.surface, colors.secondary]
                  : ['#4a4a4a', '#2a2a2a']
              }
              style={styles.recordButtonGradient}
            >
              <Mic size={32} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {isToday(selectedDate) && entryLimit && (
            <Text style={styles.entryLimitText}>
              {todaysEntries.length}/{entryLimit} entries today
            </Text>
          )}
        </View>

        {/* Trial Banner */}
        <TrialBanner />

        {/* Birth Date Setup Prompt */}
        {!hasBirthDate && (
          <View style={styles.setupPrompt}>
            <Text style={styles.setupTitle}>Get Personalized Insights</Text>
            <Text style={styles.setupSubtitle}>
              Set your birth date to receive accurate horoscope readings
            </Text>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => setShowBirthDateSetup(true)}
            >
              <Text style={styles.setupButtonText}>Set Birth Date</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Journal Entries */}
        <View style={styles.entriesSection}>
          <View style={styles.entriesHeader}>
            <Text style={styles.sectionTitle}>
              {isToday(selectedDate) && selectedViewMode === 'active'
                ? "Today's Reflections"
                : selectedViewMode === 'active'
                ? `${formatDate(selectedDate)} Entries`
                : `${selectedViewMode.charAt(0).toUpperCase() + selectedViewMode.slice(1)} up to ${formatDate(selectedDate)}`}
            </Text>

            <Text style={styles.entryCount}>
              {isToday(selectedDate) && selectedViewMode === 'active' ? (
                <>
                  {selectedEntries.length} active{' '}
                  {selectedEntries.length === 1 ? 'entry' : 'entries'}
                  {entryLimit && (
                    <Text style={styles.limitText}>
                      {' '}
                      ({todaysEntries.length}/{entryLimit})
                    </Text>
                  )}
                </>
              ) : (
                `${selectedEntries.length} ${
                  selectedEntries.length === 1 ? 'entry' : 'entries'
                }`
              )}
            </Text>
          </View>

          {!premiumLoading &&
            !journalLoading &&
            entryLimit &&
            isToday(selectedDate) &&
            todaysEntries.length >= entryLimit && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>
                  Daily limit reached. Upgrade for unlimited entries.
                </Text>
              </View>
            )}

          {selectedEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptySubtitle}>
                {isToday(selectedDate) && selectedViewMode === 'active'
                  ? canAddMoreEntries
                    ? 'Your reflections will appear here'
                    : 'Daily limit reached - upgrade for unlimited entries'
                  : selectedViewMode === 'active'
                  ? `No entries for ${formatDate(selectedDate)}`
                  : `No ${selectedViewMode} entries up to ${formatDateShort(
                      selectedDate
                    )}`}
              </Text>
            </View>
          ) : (
            <View style={styles.entriesList}>
              {selectedEntries.map((entry) => {
                const isDeleted = entry.isDeleted === true;
                const isArchived = entry.isArchivedToCalendar === true;

                return (
                  <View
                    key={entry.id}
                    style={[
                      isDeleted && styles.deletedEntryContainer,
                      isArchived && styles.archivedEntryContainer,
                    ]}
                  >
                    <JournalEntry entry={entry} showRestore={isDeleted} />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onClose={handleCalendarClose}
          />
        </View>
      </Modal>

      <BirthDateSetup
        visible={showBirthDateSetup}
        onClose={() => setShowBirthDateSetup(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  logo: {
    width: 120,
    height: 120,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  dateSection: {
    flex: 1,
  },

  dateDisplayText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },

  calendarButton: {
    backgroundColor: `${colors.accent}33`,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${colors.accent}66`,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  recordingSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 24,
  },

  recordingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
    textAlign: 'center',
  },

  recordingSubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  recordButton: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
  },

  recordButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${colors.accent}4D`,
  },

  entryLimitText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 16,
  },

  entriesSection: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    minHeight: 400,
    borderTopWidth: 1,
    borderTopColor: `${colors.accent}33`,
  },

  entriesHeader: {
    marginBottom: 20,
  },

  entryCount: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 4,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  entriesList: {
    gap: 16,
    paddingBottom: 40,
  },

  setupPrompt: {
    backgroundColor: `${colors.accent}1A`,
    borderWidth: 1,
    borderColor: `${colors.accent}4D`,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },

  setupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
    textAlign: 'center',
  },

  setupSubtitle: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },

  setupButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },

  setupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.button.text,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  recordButtonDisabled: {
    opacity: 0.7,
  },

  limitText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
  },

  limitWarning: {
    backgroundColor: `${colors.accent}1A`,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  limitWarningText: {
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '500',
  },

  archivedEntryContainer: {
    opacity: 0.7,
    marginBottom: 16,
  },

  deletedEntryContainer: {
    opacity: 0.5,
    marginBottom: 16,
  },
});
