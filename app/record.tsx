import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Mic, MicOff, Save, X, Heart } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useJournal, MoodType } from '@/hooks/useJournal';
import { usePremium } from '@/hooks/usePremium';
import { MoodSelector } from '@/components/MoodSelector';
import { colors } from '@/constants/colors';

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const insets = useSafeAreaInsets();
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const { addEntry } = useJournal();
  const { canAddEntry, getEntryLimit } = usePremium();
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.log('Microphone permission required');
        return;
      }

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }

      const uri = recording.getURI();
      if (uri) {
        await transcribeAudio(uri);
      }

      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const transcribeAudio = async (uri: string) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        setTranscribedText(
          'Voice recording transcription is not available on web. Please type your entry manually.'
        );
        return;
      }

      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const audioFile = {
        uri,
        name: 'recording.' + fileType,
        type: 'audio/' + fileType,
      } as any;

      formData.append('audio', audioFile);

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      setTranscribedText(result.text || 'No speech detected. Please try recording again.');
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscribedText('Failed to transcribe audio. Please try again or type your entry manually.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveEntry = async () => {
    console.log('🟡 [Record] saveEntry called');
    console.log('🟡 [Record] Transcribed text:', transcribedText.substring(0, 50));
    console.log('🟡 [Record] Selected mood:', selectedMood);

    if (!transcribedText.trim()) {
      console.log('🔴 [Record] No content to save');
      return;
    }

    try {
      const checkLimit = (count: number) => {
        const canAdd = canAddEntry(count);
        console.log('🟡 [Record] Checking limit - current count:', count, 'can add:', canAdd);
        return canAdd;
      };

      const success = await addEntry(transcribedText.trim(), selectedMood, undefined, checkLimit);

      console.log('🟡 [Record] addEntry returned:', success);

      if (success) {
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        console.log('🟢 [Record] Entry saved successfully, navigating back');

        setTimeout(() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/home');
          }
        }, 300);
      } else {
        console.log('🔴 [Record] Entry save failed, showing limit modal');
        setShowLimitModal(true);
      }
    } catch (error) {
      console.error('🔴 [Record] Error saving entry:', error);
    }
  };

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      {/* ✅ Reserve safe-area at bottom so buttons never sit under Android nav */}
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voice Journal</Text>
          <View style={styles.placeholder} />
        </View>

        {/* ✅ flex-start + bottom padding helps keep Save Entry above nav bar */}
        <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.recordingSection}>
            {isRecording && (
              <View style={styles.durationContainer}>
                <View style={styles.recordingIndicator} />
                <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
            >
              <View style={styles.recordButtonGradient}>
                {isRecording ? (
                  <MicOff size={32} color={colors.text} />
                ) : (
                  <Mic size={32} color={colors.text} />
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.recordingHint}>
              {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
            </Text>
          </View>

          {isTranscribing && (
            <View style={styles.transcribingSection}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.transcribingText}>Transcribing your voice...</Text>
            </View>
          )}

          {transcribedText && !isTranscribing && (
            <View style={styles.transcriptionSection}>
              <View style={styles.transcriptionCard}>
                <Text style={styles.transcriptionTitle}>Your Entry</Text>

                <ScrollView
                  style={styles.transcriptionScrollView}
                  showsVerticalScrollIndicator
                  persistentScrollbar
                >
                  <Text style={styles.transcriptionText}>{transcribedText}</Text>
                </ScrollView>

                {/* ✅ Extra padding under Save Entry so it never hides behind nav */}
                <View style={[styles.actionButtons, { paddingBottom: insets.bottom + 8 }]}>
                  <TouchableOpacity style={styles.moodButton} onPress={() => setShowMoodSelector(true)}>
                    <Heart size={16} color={selectedMood ? colors.accent : colors.secondary} />
                    <Text style={[styles.moodButtonText, selectedMood && styles.moodButtonTextSelected]}>
                      {selectedMood ? `Feeling ${selectedMood}` : 'Add mood'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
                    <Save size={20} color={colors.button.text} />
                    <Text style={styles.saveButtonText}>Save Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        <Modal
          visible={showMoodSelector}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMoodSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <MoodSelector
              selectedMood={selectedMood}
              onMoodSelect={handleMoodSelect}
              onClose={() => setShowMoodSelector(false)}
            />
          </View>
        </Modal>

        <Modal
          visible={showLimitModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLimitModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.limitModalCard}>
              <Text style={styles.limitModalTitle}>Entry Limit Reached</Text>
              <Text style={styles.limitModalText}>
                You&apos;ve reached your daily limit of {getEntryLimit()} entries. Upgrade to Premium for unlimited
                entries!
              </Text>
              <View style={styles.limitModalButtons}>
                <TouchableOpacity style={styles.limitModalButton} onPress={() => setShowLimitModal(false)}>
                  <Text style={styles.limitModalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start', // ✅ was center
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 8,
  },
  durationText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  recordButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 24,
  },
  recordButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  recordButtonGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  recordingHint: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  transcribingSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  transcribingText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  transcriptionSection: {
    width: '100%',
    marginTop: 20,
    flex: 1,
  },
  transcriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    flex: 1,
  },
  transcriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  transcriptionScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  transcriptionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  actionButtons: {
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: colors.button.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  moodButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  moodButtonTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  limitModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  limitModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  limitModalText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  limitModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  limitModalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  limitModalButtonText: {
    color: colors.button.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
