import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Hash } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Numerology } from '@/hooks/useHoroscope';
import { colors } from '@/constants/colors';

interface Props {
  numerology: Numerology | null;
}

export function NumerologyCard({ numerology }: Props) {
  const handlePress = () => {
    router.push('/(tabs)/horoscope');
  };

  if (!numerology) {
    return (
      <TouchableOpacity style={[styles.container, styles.loadingContainer]} onPress={handlePress}>
        <Text style={styles.loadingText}>Loading...</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <LinearGradient
        colors={[`${colors.primary}E6`, `${colors.surface}CC`, `${colors.secondary}1A`]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Hash size={20} color={colors.white} />
          </View>
          <Text style={styles.title}>Numerology</Text>
        </View>
        
        <View style={styles.numberContainer}>
          <Text style={styles.number}>{numerology.number}</Text>
          <Text style={styles.energy}>{numerology.energy}</Text>
        </View>
        
        <Text style={styles.meaning} numberOfLines={2}>
          {numerology.meaning}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.focusLabel}>Focus:</Text>
          <Text style={styles.focusValue}>{numerology.focus}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
    maxHeight: 220,
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: `${colors.secondary}1A`,
    borderWidth: 1,
    borderColor: `${colors.secondary}4D`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.accent,
    fontSize: 14,
  },
  gradient: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.secondary}4D`,
    justifyContent: 'space-between',
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
    color: colors.white,
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  number: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginRight: 8,
  },
  energy: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  meaning: {
    fontSize: 12,
    color: colors.white,
    lineHeight: 16,
    flex: 1,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  focusLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 4,
  },
  focusValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
});