import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { TrendingUp, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WeeklySummary } from '@/hooks/useHoroscope';
import { PremiumFeatureBlock } from './PremiumComponents';

interface Props {
  weeklySummary: WeeklySummary | null;
}

export function WeeklySummaryCard({ weeklySummary }: Props) {
  if (!weeklySummary) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <PremiumFeatureBlock>
      <TouchableOpacity style={styles.container}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.8)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <TrendingUp size={20} color="#10b981" />
            </View>
            <Text style={styles.title}>Weekly Summary</Text>
            <Crown size={16} color="#fbbf24" />
          </View>
          
          <Text style={styles.week}>{weeklySummary.week}</Text>
          
          <View style={styles.moodSection}>
            <Text style={styles.moodLabel}>Dominant Mood:</Text>
            <Text style={styles.moodValue}>{weeklySummary.dominantMood}</Text>
          </View>
          
          <View style={styles.themesSection}>
            <Text style={styles.themesLabel}>Key Themes:</Text>
            <View style={styles.themesContainer}>
              {weeklySummary.keyThemes.map((theme, index) => (
                <View key={index} style={styles.themeTag}>
                  <Text style={styles.themeText}>{theme}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <Text style={styles.forecast} numberOfLines={2}>
            {weeklySummary.weeklyForecast}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.luckyLabel}>Lucky Numbers:</Text>
            <View style={styles.luckyNumbers}>
              {weeklySummary.luckyNumbers.map((number, index) => (
                <Text key={index} style={styles.luckyNumber}>
                  {number}
                </Text>
              ))}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </PremiumFeatureBlock>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  week: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  moodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginRight: 6,
  },
  moodValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
  },
  themesSection: {
    marginBottom: 8,
  },
  themesLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  themesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  themeTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  themeText: {
    fontSize: 9,
    color: '#4338ca',
    fontWeight: '500',
  },
  forecast: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 14,
    flex: 1,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  luckyLabel: {
    fontSize: 9,
    color: '#9ca3af',
  },
  luckyNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  luckyNumber: {
    fontSize: 9,
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});