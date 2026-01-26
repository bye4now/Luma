import React from 'react';
import { Alert } from 'react-native';
import { scheduleDailyReminder8am } from "../../utils/notifications";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  User,
  Bell,
  Palette,
  Download,
  Trash2,
  HelpCircle,
  ChevronRight,
  Crown,
  Cloud,
  AlertCircle,
} from 'lucide-react-native';

import { useJournal } from '@/hooks/useJournal';
import { usePremium } from '@/hooks/usePremium';
import { useSubscription } from '@/hooks/useSubscription';
import { exportEntries } from '@/utils/exportUtils';
import { SubscriptionStatus, TrialBanner } from '@/components/SubscriptionComponents';

type ExportFormat = 'pdf' | 'word';

export default function SettingsScreen() {
  const { clearAllEntries, entries } = useJournal();
  const {
    premiumFeatures,
    syncStatus,
    enableCloudSync,
    syncToCloud,
  } = usePremium();

  // kept (even if not used directly) because you had it
  useSubscription();

  const insets = useSafeAreaInsets();
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

  const handleClearEntries = () => {
    console.log('Clear all entries requested');
    clearAllEntries();
  };

  const handleClearSubscription = async () => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.removeItem('subscription_status');
      console.log('Subscription data cleared - please refresh the app');
      Alert.alert('Done', 'Subscription data cleared! Please refresh the app to start fresh.');
    } catch (error) {
      console.error('Failed to clear subscription:', error);
      Alert.alert('Error', 'Failed to clear subscription data.');
    }
  };

  const handleExport = async (format: ExportFormat) => {
    console.log('📥 Export requested:', format);
    console.log('📥 Premium features:', premiumFeatures);
    console.log('📥 Entries count:', entries.length);

    if (format === 'pdf' && !premiumFeatures.exportToPdf) {
      Alert.alert('Premium required', 'Please upgrade to export to PDF.');
      return;
    }
    if (format === 'word' && !premiumFeatures.exportToWord) {
      Alert.alert('Premium required', 'Please upgrade to export to Word.');
      return;
    }

    if (entries.length === 0) {
      Alert.alert('Nothing to export', 'No journal entries yet. Start journaling first!');
      return;
    }

    try {
      const result = await exportEntries(entries, {
        format,
        includeMoods: true,
        includeTags: true,
      });

      if (result.success) {
        Alert.alert('Export successful', `File: ${result.fileName}`);
      } else {
        Alert.alert('Export failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export error',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  const handleCloudSync = async () => {
    if (!premiumFeatures.cloudBackup) {
      setShowSubscriptionModal(true);
      // (If you later add a modal, you can use this flag)
      Alert.alert('Premium required', 'Please upgrade to enable Cloud Backup.');
      return;
    }

    try {
      if (syncStatus.isEnabled) {
        await syncToCloud(entries);
      } else {
        await enableCloudSync();
      }
    } catch (error) {
      console.error('Cloud sync error:', error);
      Alert.alert('Cloud sync error', 'Something went wrong while syncing.');
    }
  };

  const settingsOptions = [
    {
      icon: User,
      title: 'Profile',
      subtitle: 'Manage your account',
      onPress: () => Alert.alert('Coming soon', 'Profile settings coming soon!'),
    },
{
  icon: Bell,
  title: 'Notifications',
  subtitle: 'Daily reminders and insights',
  onPress: async () => {
    const res = await scheduleDailyReminder8am();

    if (!res.ok) {
      Alert.alert(
        "Notifications Off",
        "Please enable notifications for LUMA in your phone settings, then try again."
      );
      return;
    }

    Alert.alert(
      "Daily Reminder Set",
      "Done — we’ll remind you every day at 8:00am (local time)."
    );
  },
},
{
  icon: Palette,
  title: 'Appearance',
  subtitle: 'Themes and display options',
  onPress: () => Alert.alert('Coming soon', 'Appearance settings coming soon!'),
},

    {
      icon: Download,
      title: 'Export Data (PDF)',
      subtitle: 'Download your journal entries',
      onPress: () => handleExport('pdf'),
      isPremium: !premiumFeatures.exportToPdf,
    },
    {
      icon: Cloud,
      title: 'Cloud Backup',
      subtitle: syncStatus.isEnabled
        ? `Last sync: ${syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleDateString() : 'Never'}`
        : 'Backup your entries to the cloud',
      onPress: handleCloudSync,
      isPremium: !premiumFeatures.cloudBackup,
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and send feedback',
      onPress: () => router.push('/faq'),
    },
    {
      icon: AlertCircle,
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      onPress: () => router.push('/privacy'),
    },
  ] as const;

  return (
    <LinearGradient
      colors={['#025067', '#0B9FBD', '#6C0E42']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your journaling experience</Text>
        </View>

        <View style={styles.content}>
          <TrialBanner />
          <SubscriptionStatus />

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Journey</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{entries.length}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {new Set(entries.map(e => new Date(e.date).toDateString())).size}
                </Text>
                <Text style={styles.statLabel}>Days Journaled</Text>
              </View>
            </View>
          </View>

          <View style={styles.settingsSection}>
            {settingsOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={option.title}
                  style={[
                    styles.settingItem,
                    index === settingsOptions.length - 1 && styles.lastSettingItem,
                  ]}
                  onPress={option.onPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.settingIcon}>
                    <Icon size={20} color="#B31B6F" />
                  </View>

                  <View style={styles.settingContent}>
                    <View style={styles.settingTitleRow}>
                      <Text style={styles.settingTitle}>{option.title}</Text>

                      {!!option.isPremium && (
                        <View style={styles.premiumBadge}>
                          <Crown size={12} color="#0B9FBD" />
                          <Text style={styles.premiumBadgeText}>PRO</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                  </View>

                  <ChevronRight size={20} color="#025067" />
                </TouchableOpacity>
              );
            })}
          </View>

          {entries.length > 0 && (
            <TouchableOpacity style={styles.dangerButton} onPress={handleClearEntries}>
              <Trash2 size={20} color="#6C0E42" />
              <Text style={styles.dangerButtonText}>Clear All Entries</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.dangerButton,
              {
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                borderColor: 'rgba(255, 165, 0, 0.3)',
              },
            ]}
            onPress={handleClearSubscription}
          >
            <AlertCircle size={20} color="#FFA500" />
            <Text style={[styles.dangerButtonText, { color: '#FFA500' }]}>
              Reset Subscription (Debug)
            </Text>
          </TouchableOpacity>

          {/* Placeholder (so your unused state doesn't feel weird) */}
          {showSubscriptionModal ? null : null}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    minHeight: 500,
  },
  statsCard: {
    backgroundColor: 'rgba(2, 80, 103, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#025067',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#B31B6F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#025067',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#025067',
    marginHorizontal: 20,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(2, 80, 103, 0.1)',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(179, 27, 111, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#025067',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#025067',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 159, 189, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0B9FBD',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(108, 14, 66, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 14, 66, 0.3)',
    marginBottom: 40,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C0E42',
    marginLeft: 8,
  },
});
