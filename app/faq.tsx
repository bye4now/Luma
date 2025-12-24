import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface FAQItem {
  question: string;
  answer: string;
  category: 'getting-started' | 'features' | 'premium' | 'technical' | 'privacy';
}

const faqData: FAQItem[] = [
  {
    category: 'getting-started',
    question: 'How do I create my first journal entry?',
    answer: 'Tap the large microphone button on the Home screen to start recording your voice journal. Speak your thoughts, and the app will transcribe them automatically. You can add moods, tags, and edit the text after recording.',
  },
  {
    category: 'getting-started',
    question: 'What is the daily entry limit?',
    answer: 'Free users can create up to 3 journal entries per day. Premium users have unlimited entries. Your daily limit resets at midnight.',
  },
  {
    category: 'getting-started',
    question: 'How do I set my birth date for horoscope readings?',
    answer: 'Go to the Home screen and tap "Set Birth Date" in the prompt card, or navigate to Settings and look for the birth date setup option. Your birth date enables personalized horoscope and numerology readings.',
  },
  {
    category: 'features',
    question: 'How does voice recording work?',
    answer: 'Tap the microphone button to start recording. Speak clearly into your device. When finished, tap the stop button. The app will transcribe your voice to text using AI. You can then edit, add moods, and save your entry.',
  },
  {
    category: 'features',
    question: 'What are moods and how do I use them?',
    answer: 'Moods help you track your emotional state. After recording, select one or more moods that match how you&apos;re feeling. This helps you identify patterns in your emotional journey over time.',
  },
  {
    category: 'features',
    question: 'How do I view past entries?',
    answer: 'Tap the calendar icon in the top right of the Home screen. You can browse entries by date and view active, archived, or deleted entries. Tap any date to see entries from that day.',
  },
  {
    category: 'features',
    question: 'What\'s the difference between archiving and deleting?',
    answer: 'Archived entries are moved to your calendar view but remain accessible. Deleted entries are moved to a separate deleted section and can be restored within 30 days before permanent deletion.',
  },
  {
    category: 'features',
    question: 'How do I restore a deleted entry?',
    answer: 'Open the calendar, switch to "Deleted" view, find your entry, and tap the restore button. The entry will return to your active journal.',
  },
  {
    category: 'features',
    question: 'What are the Daily Insights cards?',
    answer: 'Daily Insights include your horoscope, numerology reading, and weekly summary. These provide cosmic guidance and patterns based on your birth date and journal entries.',
  },
  {
    category: 'premium',
    question: 'What features are included in Premium?',
    answer: 'Premium includes: unlimited daily entries, cloud backup & sync, export to PDF/Word, advanced insights & analytics, detailed horoscope readings, numerology analysis, weekly summaries, moon phase guidance, and birth chart analysis.',
  },
  {
    category: 'premium',
    question: 'How much does Premium cost?',
    answer: 'Premium is available as a monthly subscription ($9.99/month) or yearly subscription ($79.99/year, saving 33%). Both include a 7-day free trial.',
  },
  {
    category: 'premium',
    question: 'Can I try Premium before purchasing?',
    answer: 'Yes! All Premium subscriptions include a 7-day free trial. You can cancel anytime during the trial without being charged.',
  },
  {
    category: 'premium',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription through your device\'s subscription settings (App Store for iOS, Google Play for Android). Your Premium features will remain active until the end of your billing period.',
  },
  {
    category: 'premium',
    question: 'What happens to my data if I cancel Premium?',
    answer: 'Your journal entries remain safe and accessible. You\'ll revert to the free tier limits (3 entries/day), but all existing entries stay intact. Cloud backups will no longer sync, but you can export your data before canceling.',
  },
  {
    category: 'technical',
    question: 'How do I export my journal entries?',
    answer: 'Go to Settings > Export Data (Premium feature). Choose PDF or Word format. Your entries will be formatted with dates, moods, and content. The file will be saved to your device.',
  },
  {
    category: 'technical',
    question: 'Does the app work offline?',
    answer: 'Yes! You can create and view journal entries offline. Voice transcription and AI features require an internet connection. Your entries will sync when you&apos;re back online.',
  },
  {
    category: 'technical',
    question: 'How does Cloud Backup work?',
    answer: 'Cloud Backup (Premium) automatically syncs your entries to secure cloud storage. Enable it in Settings > Cloud Backup. Your data syncs in real-time and can be restored if you switch devices.',
  },
  {
    category: 'technical',
    question: 'Why isn\'t voice recording working?',
    answer: 'Check that you&apos;ve granted microphone permissions in your device settings. Ensure your device isn&apos;t in silent mode. Try restarting the app. If issues persist, check your internet connection for transcription.',
  },
  {
    category: 'technical',
    question: 'How do I clear all my entries?',
    answer: 'Go to Settings and scroll to the bottom. Tap "Clear All Entries" (this action cannot be undone). Use this carefully as it permanently deletes all journal data.',
  },
  {
    category: 'privacy',
    question: 'Is my journal data private and secure?',
    answer: 'Yes! Your journal entries are stored securely on your device and encrypted. Premium cloud backups use end-to-end encryption. We never share your personal journal content with third parties.',
  },
  {
    category: 'privacy',
    question: 'Who can see my journal entries?',
    answer: 'Only you. Your entries are private and stored locally on your device. Even with cloud backup, your data is encrypted and only accessible by you.',
  },
  {
    category: 'privacy',
    question: 'What data does the app collect?',
    answer: 'We collect minimal data: account information, usage analytics (anonymous), and journal entries (stored locally or in your private cloud). We never sell your data or use it for advertising.',
  },
];

const categories = [
  { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { id: 'features', label: 'Features', icon: '✨' },
  { id: 'premium', label: 'Premium', icon: '👑' },
  { id: 'technical', label: 'Technical', icon: '⚙️' },
  { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
];

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('getting-started');

  const filteredFAQs = faqData.filter(faq => faq.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Help & FAQ',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.accent} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selector */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Browse by Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setExpandedId(null);
                }}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ Items */}
        <View style={styles.faqSection}>
          {filteredFAQs.map((faq, index) => {
            const itemId = `${faq.category}-${index}`;
            const isExpanded = expandedId === itemId;

            return (
              <TouchableOpacity
                key={itemId}
                style={styles.faqItem}
                onPress={() => toggleExpand(itemId)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {isExpanded ? (
                    <ChevronUp size={20} color={colors.accent} />
                  ) : (
                    <ChevronDown size={20} color={colors.accent} />
                  )}
                </View>
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contact Support */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportText}>
            If you couldn&apos;t find the answer you&apos;re looking for, please reach out to our support team.
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => Linking.openURL('mailto:jill.bentley11@gmail.com?subject=Cosmic%20Journal%20Support')}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.supportButton, styles.privacyButton]}
            onPress={() => router.push('/privacy')}
          >
            <Text style={styles.supportButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
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
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  categorySection: {
    paddingVertical: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}1A`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  categoryLabelActive: {
    color: colors.background,
  },
  faqSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqItem: {
    backgroundColor: `${colors.accent}0D`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    lineHeight: 22,
  },
  faqAnswerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: `${colors.accent}1A`,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  supportSection: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: `${colors.accent}1A`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  supportButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  privacyButton: {
    marginTop: 12,
    backgroundColor: `${colors.accent}80`,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
});
