import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Calendar } from 'lucide-react-native';
import { MoonPhase } from '@/hooks/useHoroscope';
import { colors } from '@/constants/colors';

interface Props {
  moonPhase: MoonPhase;
}

export function MoonPhaseCard({ moonPhase }: Props) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.15)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Moon size={20} color={colors.accent} />
            <Text style={styles.headerTitle}>Moon Phase</Text>
          </View>
          <Text style={styles.illumination}>{moonPhase.illumination}%</Text>
        </View>

        <View style={styles.phaseDisplay}>
          <Text style={styles.phaseEmoji}>{moonPhase.emoji}</Text>
          <Text style={styles.phaseName}>{moonPhase.name}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Energy</Text>
          <Text style={styles.descriptionText}>{moonPhase.description}</Text>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Focus</Text>
          <Text style={styles.descriptionText}>{moonPhase.energy}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.upcomingSection}>
          <View style={styles.upcomingItem}>
            <Calendar size={16} color={colors.accent} />
            <View style={styles.upcomingText}>
              <Text style={styles.upcomingLabel}>Next New Moon</Text>
              <Text style={styles.upcomingDate}>{formatDate(moonPhase.nextNewMoon)}</Text>
            </View>
          </View>
          <View style={styles.upcomingItem}>
            <Calendar size={16} color={colors.accent} />
            <View style={styles.upcomingText}>
              <Text style={styles.upcomingLabel}>Next Full Moon</Text>
              <Text style={styles.upcomingDate}>{formatDate(moonPhase.nextFullMoon)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  illumination: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    backgroundColor: `${colors.accent}1A`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  phaseEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  phaseName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: `${colors.accent}33`,
    marginVertical: 16,
  },
  description: {
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 22,
  },
  upcomingSection: {
    gap: 12,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upcomingText: {
    flex: 1,
  },
  upcomingLabel: {
    fontSize: 12,
    color: `${colors.accent}CC`,
    marginBottom: 2,
  },
  upcomingDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
});
