import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, ChevronDown, ChevronUp } from 'lucide-react-native';
import { BirthChart } from '@/hooks/useHoroscope';
import { colors } from '@/constants/colors';

interface Props {
  birthChart: BirthChart;
}

export function BirthChartCard({ birthChart }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return '#ef4444';
      case 'Earth': return '#84cc16';
      case 'Air': return '#3b82f6';
      case 'Water': return '#06b6d4';
      default: return colors.accent;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(245, 158, 11, 0.15)', 'rgba(239, 68, 68, 0.15)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Star size={20} color="#f59e0b" />
            <Text style={styles.headerTitle}>Birth Chart</Text>
          </View>
        </View>

        <View style={styles.mainSigns}>
          <View style={styles.signItem}>
            <Text style={styles.signLabel}>Sun</Text>
            <Text style={styles.signValue} numberOfLines={1} adjustsFontSizeToFit>{birthChart.sunSign}</Text>
          </View>
          <View style={styles.signDivider} />
          <View style={styles.signItem}>
            <Text style={styles.signLabel}>Moon</Text>
            <Text style={styles.signValue} numberOfLines={1} adjustsFontSizeToFit>{birthChart.moonSign}</Text>
          </View>
          <View style={styles.signDivider} />
          <View style={styles.signItem}>
            <Text style={styles.signLabel}>Rising</Text>
            <Text style={styles.signValue} numberOfLines={1} adjustsFontSizeToFit>{birthChart.risingSign}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.elementSection}>
          <View style={styles.elementItem}>
            <Text style={styles.elementLabel}>Dominant Element</Text>
            <View style={[styles.elementBadge, { backgroundColor: `${getElementColor(birthChart.dominantElement)}33` }]}>
              <Text style={[styles.elementText, { color: getElementColor(birthChart.dominantElement) }]}>
                {birthChart.dominantElement}
              </Text>
            </View>
          </View>
          <View style={styles.elementItem}>
            <Text style={styles.elementLabel}>Quality</Text>
            <View style={styles.elementBadge}>
              <Text style={styles.elementText}>{birthChart.dominantQuality}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.summarySection}>
          <Text style={styles.summaryText}>{birthChart.chartSummary}</Text>
        </View>

        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.detailsButtonText}>
            {showDetails ? 'Hide' : 'View'} Planetary Positions
          </Text>
          {showDetails ? (
            <ChevronUp size={20} color={colors.accent} />
          ) : (
            <ChevronDown size={20} color={colors.accent} />
          )}
        </TouchableOpacity>

        {showDetails && (
          <View style={styles.planetsSection}>
            <View style={styles.divider} />
            <ScrollView style={styles.planetsScroll} nestedScrollEnabled>
              {birthChart.positions.map((position, index) => (
                <View key={index} style={styles.planetItem}>
                  <View style={styles.planetHeader}>
                    <Text style={styles.planetSymbol}>{position.symbol}</Text>
                    <Text style={styles.planetName}>{position.planet}</Text>
                  </View>
                  <View style={styles.planetDetails}>
                    <Text style={styles.planetPosition}>
                      {position.sign} • House {position.house} • {position.degree}°
                    </Text>
                    <Text style={styles.planetMeaning}>{position.meaning}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
    color: '#f59e0b',
  },
  mainSigns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  signItem: {
    flex: 1,
    alignItems: 'center',
  },
  signDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
  },
  signLabel: {
    fontSize: 12,
    color: 'rgba(245, 158, 11, 0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  signValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f59e0b',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    marginVertical: 16,
  },
  elementSection: {
    flexDirection: 'row',
    gap: 12,
  },
  elementItem: {
    flex: 1,
  },
  elementLabel: {
    fontSize: 12,
    color: 'rgba(245, 158, 11, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  elementBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  elementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  summarySection: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  planetsSection: {
    marginTop: 16,
  },
  planetsScroll: {
    maxHeight: 300,
  },
  planetItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.1)',
  },
  planetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  planetSymbol: {
    fontSize: 20,
    color: '#f59e0b',
  },
  planetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  planetDetails: {
    gap: 4,
  },
  planetPosition: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '500',
  },
  planetMeaning: {
    fontSize: 12,
    color: `${colors.white}CC`,
    lineHeight: 16,
  },
});
