import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MoodType } from '@/hooks/useJournal';

interface Props {
  selectedMood?: MoodType;
  onMoodSelect: (mood: MoodType) => void;
  onClose: () => void;
}

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: '#b8dda0' },
  { type: 'excited', emoji: '🤩', label: 'Excited', color: '#5e90c6' },
  { type: 'grateful', emoji: '🙏', label: 'Grateful', color: '#b8dda0' },
  { type: 'content', emoji: '😌', label: 'Content', color: '#2b7879' },
  { type: 'calm', emoji: '😌', label: 'Calm', color: '#5e90c6' },
  { type: 'peaceful', emoji: '☮️', label: 'Peaceful', color: '#b8dda0' },
  { type: 'energetic', emoji: '⚡', label: 'Energetic', color: '#FFD700' },
  { type: 'anxious', emoji: '😰', label: 'Anxious', color: '#FFD700' },
  { type: 'frustrated', emoji: '😤', label: 'Frustrated', color: '#2b7879' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: '#5e90c6' },
];

export function MoodSelector({ selectedMood, onMoodSelect, onClose }: Props) {
  const handleMoodPress = (mood: MoodType) => {
    onMoodSelect(mood);
    onClose();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <Text style={styles.subtitle}>Select a mood for your entry</Text>
      
      <ScrollView style={styles.moodsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.moodsGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.moodButton,
                selectedMood === mood.type && styles.selectedMoodButton,
                { borderColor: mood.color }
              ]}
              onPress={() => handleMoodPress(mood.type)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[
                styles.moodLabel,
                selectedMood === mood.type && styles.selectedMoodLabel
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipButton} onPress={onClose}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a2414',
    borderRadius: 20,
    padding: 24,
    maxHeight: 500,
    borderWidth: 1,
    borderColor: '#2b7879',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e7f4df',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#b8dda0',
    textAlign: 'center',
    marginBottom: 24,
  },
  moodsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  moodButton: {
    width: '45%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2b7879',
    backgroundColor: 'rgba(43, 120, 121, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  selectedMoodButton: {
    backgroundColor: 'rgba(184, 221, 160, 0.2)',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b8dda0',
    textAlign: 'center',
    numberOfLines: 1,
  },
  selectedMoodLabel: {
    color: '#e7f4df',
  },
  actions: {
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#b8dda0',
    borderWidth: 1,
    borderColor: '#2b7879',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c1508',
  },
});