import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Moon, Star, Sun, Lock, Crown } from 'lucide-react-native';
import { useHoroscope } from '@/hooks/useHoroscope';
import { usePremium } from '@/hooks/usePremium';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { HoroscopeCard } from '@/components/HoroscopeCard';
import { NumerologyCard } from '@/components/NumerologyCard';
import { WeeklySummaryCard } from '@/components/WeeklySummaryCard';
import { MoonPhaseCard } from '@/components/MoonPhaseCard';
import { BirthChartCard } from '@/components/BirthChartCard';

export default function HoroscopeScreen() {
  const insets = useSafeAreaInsets();
  const { horoscope, numerology, weeklySummary, moonPhase, birthChart, hasBirthDate } = useHoroscope();
  const { isPremium } = usePremium();

  const PremiumUpgrade = () => (
    <View style={styles.upgradeCard}>
      <View style={styles.upgradeHeader}>
        <Crown size={32} color={colors.accent} />
        <Text style={styles.upgradeTitle}>Unlock Cosmic Insights</Text>
      </View>
      <Text style={styles.upgradeDescription}>
        Get personalized daily horoscopes, advanced numerology readings, and weekly cosmic forecasts.
      </Text>
      <TouchableOpacity 
        style={styles.upgradeButton}
        onPress={() => router.push('/subscription')}
      >
        <LinearGradient
          colors={[colors.accent, colors.surface]}
          style={styles.upgradeButtonGradient}
        >
          <Sparkles size={20} color={colors.white} />
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const BirthDatePrompt = () => (
    <View style={styles.birthDateCard}>
      <View style={styles.birthDateHeader}>
        <Moon size={32} color={colors.accent} />
        <Text style={styles.birthDateTitle}>Set Your Birth Date</Text>
      </View>
      <Text style={styles.birthDateDescription}>
        Unlock personalized horoscope readings based on your zodiac sign and birth chart.
      </Text>
      <TouchableOpacity 
        style={styles.birthDateButton}
        onPress={() => router.push('/(tabs)/settings')}
      >
        <Text style={styles.birthDateButtonText}>Set Birth Date</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Sparkles size={28} color={colors.accent} />
            <Text style={styles.title}>Cosmic Insights</Text>
          </View>
          <Text style={styles.subtitle}>
            {isPremium 
              ? 'Your personalized cosmic guidance' 
              : 'Unlock your cosmic potential'
            }
          </Text>
        </View>

        {!hasBirthDate && <BirthDatePrompt />}
        {!isPremium && <PremiumUpgrade />}

        {/* Daily Insights */}
        {isPremium && hasBirthDate && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sun size={24} color={colors.accent} />
                <Text style={styles.sectionTitle}>Today&apos;s Guidance</Text>
              </View>
              <View style={styles.cardsColumn}>
                <HoroscopeCard horoscope={horoscope} />
                <NumerologyCard numerology={numerology} />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Star size={24} color={colors.accent} />
                <Text style={styles.sectionTitle}>Weekly Overview</Text>
              </View>
              <WeeklySummaryCard weeklySummary={weeklySummary} />
            </View>

            {/* Moon Phase */}
            {moonPhase && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Moon size={24} color="#8b5cf6" />
                  <Text style={styles.sectionTitle}>Lunar Guidance</Text>
                </View>
                <MoonPhaseCard moonPhase={moonPhase} />
              </View>
            )}

            {/* Birth Chart */}
            {birthChart && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Star size={24} color="#f59e0b" />
                  <Text style={styles.sectionTitle}>Your Birth Chart</Text>
                </View>
                <BirthChartCard birthChart={birthChart} />
              </View>
            )}
          </>
        )}

        {/* Free User Preview */}
        {!isPremium && hasBirthDate && (
          <View style={styles.previewSection}>
            <View style={styles.sectionHeader}>
              <Sun size={24} color="#B31B6F" />
              <Text style={styles.sectionTitle}>Preview</Text>
            </View>
            
            {/* Show actual horoscope preview */}
            <View style={styles.previewCard}>
              <HoroscopeCard horoscope={horoscope} />
              <View style={styles.previewOverlay}>
                <Lock size={24} color={colors.accent} />
                <Text style={styles.previewOverlayText}>Upgrade for full access</Text>
              </View>
            </View>
            
            {/* Locked numerology and weekly summary */}
            <View style={styles.lockedGrid}>
              <View style={styles.lockedCard}>
                <Lock size={20} color={colors.accent} />
                <Text style={styles.lockedCardTitle}>Numerology</Text>
                <Text style={styles.lockedCardDescription}>
                  Daily number insights
                </Text>
              </View>
              <View style={styles.lockedCard}>
                <Lock size={20} color={colors.accent} />
                <Text style={styles.lockedCardTitle}>Weekly Forecast</Text>
                <Text style={styles.lockedCardDescription}>
                  7-day cosmic overview
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.upgradeFromPreviewButton}
              onPress={() => router.push('/subscription')}
            >
              <LinearGradient
                colors={[colors.accent, colors.surface]}
                style={styles.upgradeFromPreviewGradient}
              >
                <Crown size={18} color={colors.white} />
                <Text style={styles.upgradeFromPreviewText}>Unlock All Features</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: `${colors.accent}CC`,
    lineHeight: 22,
  },
  upgradeCard: {
    backgroundColor: `${colors.accent}1A`,
    borderWidth: 1,
    borderColor: `${colors.accent}4D`,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  upgradeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 12,
  },
  upgradeDescription: {
    fontSize: 16,
    color: `${colors.accent}CC`,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  upgradeButton: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  birthDateCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  birthDateHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  birthDateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 12,
  },
  birthDateDescription: {
    fontSize: 16,
    color: `${colors.accent}CC`,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  birthDateButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  birthDateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginLeft: 8,
  },
  cardsColumn: {
    gap: 16,
  },
  comingSoonGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  comingSoonCard: {
    flex: 1,
    backgroundColor: `${colors.accent}0D`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 8,
    marginBottom: 8,
  },
  comingSoonDescription: {
    fontSize: 12,
    color: `${colors.accent}B3`,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  comingSoonBadge: {
    backgroundColor: `${colors.accent}33`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    position: 'relative',
    marginBottom: 16,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 15, 35, 0.95)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewOverlayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  lockedGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  lockedCard: {
    flex: 1,
    backgroundColor: `${colors.accent}0D`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  lockedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 8,
    marginBottom: 4,
  },
  lockedCardDescription: {
    fontSize: 11,
    color: `${colors.accent}B3`,
    textAlign: 'center',
    lineHeight: 14,
  },
  upgradeFromPreviewButton: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeFromPreviewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  upgradeFromPreviewText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});