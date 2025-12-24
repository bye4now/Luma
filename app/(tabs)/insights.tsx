import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Calendar, Heart, Brain, Lock, BarChart3 } from 'lucide-react-native';
import { useJournal } from '@/hooks/useJournal';
import { usePremium } from '@/hooks/usePremium';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { entries } = useJournal();
  const { isPremium } = usePremium();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const activeEntries = entries.filter(entry => !entry.isArchivedToCalendar && !entry.isDeleted);
  const allEntries = activeEntries;
  
  const weekEntries = entries.filter(entry => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const entryDate = new Date(entry.date);
    return entryDate >= startOfWeek && entryDate <= now;
  });
  
  const insights = [
    {
      icon: <TrendingUp size={24} color="#4ade80" />,
      title: 'Mood Trend',
      value: '+12%',
      description: 'Your overall mood has improved this month',
      trend: 'positive',
    },
    {
      icon: <Calendar size={24} color="#60a5fa" />,
      title: 'Consistency',
      value: '85%',
      description: 'You have been journaling regularly',
      trend: 'positive',
    },
    {
      icon: <Heart size={24} color="#f59e0b" />,
      title: 'Emotional Range',
      value: 'Balanced',
      description: 'Good variety in emotional expression',
      trend: 'neutral',
    },
    {
      icon: <Brain size={24} color="#8b5cf6" />,
      title: 'Reflection Depth',
      value: 'High',
      description: 'Your entries show deep self-awareness',
      trend: 'positive',
    },
  ];
  
  const PremiumUpgrade = () => (
    <View style={styles.upgradeCard}>
      <View style={styles.upgradeHeader}>
        <Lock size={32} color={colors.accent} />
        <Text style={styles.upgradeTitle}>Premium Analytics</Text>
      </View>
      <Text style={styles.upgradeDescription}>
        Unlock advanced analytics, mood patterns, and AI-powered insights about your emotional journey.
      </Text>
      <TouchableOpacity 
        style={styles.upgradeButton}
        onPress={() => router.push('/subscription')}
      >
        <LinearGradient
          colors={[colors.accent, colors.surface]}
          style={styles.upgradeButtonGradient}
        >
          <BarChart3 size={20} color={colors.white} />
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </LinearGradient>
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
            <BarChart3 size={28} color={colors.accent} />
            <Text style={styles.title}>Journal Analytics</Text>
          </View>
          <Text style={styles.subtitle}>
            {isPremium ? 'Discover patterns in your emotional journey' : 'Upgrade for detailed analytics'}
          </Text>
        </View>
        
        {!isPremium && <PremiumUpgrade />}
        
        {/* Period Selector */}
        {isPremium && (
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Key Insights */}
        {isPremium && (
          <View style={styles.insightsGrid}>
            {insights.map((insight) => (
              <View key={insight.title} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  {insight.icon}
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={[
                  styles.insightValue,
                  insight.trend === 'positive' && styles.positiveValue,
                  insight.trend === 'negative' && styles.negativeValue
                ]}>
                  {insight.value}
                </Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Charts */}
        {isPremium && (
          <>
            {/* Mood Trend Chart */}
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Mood Trend</Text>
              <Text style={styles.chartSubtitle}>Your emotional patterns over time</Text>
              <View style={styles.mockChart}>
                <Text style={styles.mockChartText}>📈 Mood trending upward this week</Text>
                <Text style={styles.mockChartSubtext}>Average mood: 4.2/5</Text>
              </View>
            </View>
            
            {/* Entry Frequency */}
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Journal Frequency</Text>
              <Text style={styles.chartSubtitle}>How often you have been journaling</Text>
              <View style={styles.mockChart}>
                <Text style={styles.mockChartText}>📊 {weekEntries.length} {weekEntries.length === 1 ? 'entry' : 'entries'} this week</Text>
                <Text style={styles.mockChartSubtext}>{weekEntries.length > 0 ? 'Keep up the great work!' : 'Start journaling today!'}</Text>
              </View>
            </View>
            
            {/* Emotion Distribution */}
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Emotion Distribution</Text>
              <Text style={styles.chartSubtitle}>Breakdown of your emotional states</Text>
              <View style={styles.mockChart}>
                <Text style={styles.mockChartText}>🎯 Most common: Happy (35%)</Text>
                <Text style={styles.mockChartSubtext}>Balanced emotional range</Text>
              </View>
            </View>
            
            {/* AI Insights */}
            <View style={styles.aiInsights}>
              <Text style={styles.chartTitle}>AI Insights</Text>
              <View style={styles.aiInsightCard}>
                <Text style={styles.aiInsightText}>
                  Your journaling shows a strong pattern of growth mindset. You frequently use words 
                  related to learning and improvement, especially on weekdays. Consider exploring 
                  this theme further in your weekend reflections.
                </Text>
                <Text style={styles.aiInsightSource}>&mdash; LUMA AI Analysis</Text>
              </View>
            </View>
          </>
        )}
        
        {/* Basic Stats for Free Users */}
        {!isPremium && (
          <View style={styles.basicStats}>
            <Text style={styles.chartTitle}>Basic Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{allEntries.length}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>156</Text>
                <Text style={styles.statLabel}>Words/Entry</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>4.2</Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </View>
            </View>
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
    color: colors.white,
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
    color: colors.white,
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: `${colors.accent}1A`,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: colors.accent,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  insightCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: `${colors.accent}0D`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 12,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 8,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  positiveValue: {
    color: '#4ade80',
  },
  negativeValue: {
    color: '#ef4444',
  },
  insightDescription: {
    fontSize: 12,
    color: colors.white,
    lineHeight: 16,
  },
  chartSection: {
    marginBottom: 32,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  aiInsights: {
    marginBottom: 32,
  },
  aiInsightCard: {
    backgroundColor: `${colors.accent}0D`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 12,
    padding: 20,
  },
  aiInsightText: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  aiInsightSource: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  basicStats: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: `${colors.accent}0D`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
  },
  mockChart: {
    backgroundColor: `${colors.accent}0D`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  mockChartText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 8,
    textAlign: 'center',
  },
  mockChartSubtext: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
  },
});