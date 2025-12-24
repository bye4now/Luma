import { useState, useEffect, useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { getHoroscopeForDate, getNumerologyForDate, getZodiacSign, getMoonPhase, getBirthChart } from '@/utils/mysticalUtils';

export interface Horoscope {
  sign: string;
  message: string;
  luckyNumber: number;
  mood: string;
  color: string;
}

export interface Numerology {
  number: number;
  meaning: string;
  energy: string;
  focus: string;
}

export interface WeeklySummary {
  week: string;
  dominantMood: string;
  keyThemes: string[];
  luckyNumbers: number[];
  weeklyForecast: string;
}

export interface MoonPhase {
  name: string;
  emoji: string;
  description: string;
  energy: string;
  illumination: number;
  nextNewMoon: Date;
  nextFullMoon: Date;
}

export interface PlanetPosition {
  planet: string;
  symbol: string;
  sign: string;
  house: number;
  degree: number;
  meaning: string;
}

export interface ZodiacHouse {
  number: number;
  name: string;
  description: string;
}

export interface BirthChart {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  positions: PlanetPosition[];
  houses: ZodiacHouse[];
  dominantElement: string;
  dominantQuality: string;
  chartSummary: string;
}

export const [HoroscopeProvider, useHoroscope] = createContextHook(() => {
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [numerology, setNumerology] = useState<Numerology | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [moonPhase, setMoonPhase] = useState<MoonPhase | null>(null);
  const [birthChart, setBirthChart] = useState<BirthChart | null>(null);

  const loadBirthDate = useCallback(async () => {
    try {
      console.log('🔵 [useHoroscope] Loading birth date from AsyncStorage...');
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.getItem('birthDate');
      console.log('🔵 [useHoroscope] Raw stored birth date:', stored);
      if (stored) {
        const date = new Date(stored);
        console.log('🟢 [useHoroscope] Loaded birth date:', date.toISOString());
        setBirthDate(date);
      } else {
        console.log('🟡 [useHoroscope] No stored birth date found');
      }
    } catch (error) {
      console.error('🔴 [useHoroscope] Failed to load birth date:', error);
    }
  }, []);

  const saveBirthDate = useCallback(async (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      console.error('🔴 [useHoroscope] Invalid date provided');
      return;
    }
    
    try {
      console.log('🔵 [useHoroscope] Saving birth date:', date.toISOString());
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('birthDate', date.toISOString());
      console.log('🟢 [useHoroscope] Successfully saved birth date');
      
      // Verify the save
      const verification = await AsyncStorage.getItem('birthDate');
      if (verification) {
        console.log('🟢 [useHoroscope] Verification: storage contains:', verification);
      }
      
      setBirthDate(date);
    } catch (error) {
      console.error('🔴 [useHoroscope] Failed to save birth date:', error);
    }
  }, []);

  const generateWeeklySummary = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekString = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    
    const themes = ['Growth', 'Relationships', 'Career', 'Health', 'Creativity', 'Spirituality'];
    const moods = ['Energetic', 'Peaceful', 'Creative', 'Focused', 'Adventurous', 'Reflective'];
    const forecasts = [
      'This week brings opportunities for personal transformation and new beginnings.',
      'Focus on building meaningful connections and strengthening existing relationships.',
      'Career advancement and professional recognition are highlighted this week.',
      'Pay attention to your physical and mental well-being for optimal balance.',
      'Creative projects and artistic endeavors will flourish under this week\'s energy.',
      'Spiritual growth and inner wisdom guide your path forward this week.'
    ];

    const weekIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24 * 7)) % themes.length;
    
    setWeeklySummary({
      week: weekString,
      dominantMood: moods[weekIndex],
      keyThemes: [themes[weekIndex], themes[(weekIndex + 1) % themes.length]],
      luckyNumbers: [((weekIndex * 7) % 99) + 1, ((weekIndex * 11) % 99) + 1, ((weekIndex * 13) % 99) + 1],
      weeklyForecast: forecasts[weekIndex]
    });
  }, []);

  const refreshInsights = useCallback(() => {
    const today = new Date();
    if (birthDate) {
      const zodiacSign = getZodiacSign(birthDate);
      setHoroscope(getHoroscopeForDate(today, zodiacSign));
      setBirthChart(getBirthChart(birthDate));
    } else {
      setHoroscope(getHoroscopeForDate(today));
      setBirthChart(null);
    }
    setNumerology(getNumerologyForDate(today));
    setMoonPhase(getMoonPhase(today));
    generateWeeklySummary();
  }, [birthDate, generateWeeklySummary]);

  useEffect(() => {
    loadBirthDate();
  }, [loadBirthDate]);

  useEffect(() => {
    const today = new Date();
    if (birthDate) {
      const zodiacSign = getZodiacSign(birthDate);
      setHoroscope(getHoroscopeForDate(today, zodiacSign));
      setBirthChart(getBirthChart(birthDate));
    } else {
      setHoroscope(getHoroscopeForDate(today));
      setBirthChart(null);
    }
    setNumerology(getNumerologyForDate(today));
    setMoonPhase(getMoonPhase(today));
    generateWeeklySummary();
  }, [birthDate, generateWeeklySummary]);

  return useMemo(() => ({
    horoscope,
    numerology,
    birthDate,
    weeklySummary,
    moonPhase,
    birthChart,
    refreshInsights,
    saveBirthDate,
    hasBirthDate: !!birthDate,
  }), [horoscope, numerology, birthDate, weeklySummary, moonPhase, birthChart, refreshInsights, saveBirthDate]);
});