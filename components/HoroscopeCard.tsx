import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Horoscope } from '@/hooks/useHoroscope';
import { colors } from '@/constants/colors';

interface Props {
  horoscope: Horoscope | null;
}

export function HoroscopeCard({ horoscope }: Props) {
  const handlePress = () => {
    router.push('/(tabs)/horoscope');
  };

  if (!horoscope) {
    return (
      <TouchableOpacity style={[styles.container, styles.loadingContainer]} onPress={handlePress}>
        <Text style={styles.loadingText}>Loading...</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <LinearGradient
        colors={[`${colors.primary}E6`, `${colors.secondary}CC`, `${colors.accent}1A`]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Star size={20} color={colors.white} fill={colors.white} />
          </View>
          <Text style={styles.title}>Horoscope</Text>
        </View>
        
        <Text style={styles.sign}>{horoscope.sign}</Text>
        <Text style={styles.message} numberOfLines={3}>
          {horoscope.message}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.moodContainer}>
            <Text style={styles.moodLabel}>Mood:</Text>
            <Text style={styles.moodValue}>{horoscope.mood}</Text>
          </View>
          <View style={styles.luckyContainer}>
            <Text style={styles.luckyLabel}>Lucky #:</Text>
            <Text style={styles.luckyValue}>{horoscope.luckyNumber}</Text>
          </View>
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
    backgroundColor: `${colors.accent}1A`,
    borderWidth: 1,
    borderColor: `${colors.accent}4D`,
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
    borderColor: `${colors.accent}4D`,
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
  sign: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 10,
  },
  message: {
    fontSize: 12,
    color: colors.white,
    lineHeight: 16,
    flex: 1,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 4,
  },
  moodValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  luckyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  luckyLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 4,
  },
  luckyValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
});