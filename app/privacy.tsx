import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* This prevents Expo Router from rendering its own header,
          which is what causes the "title twice" issue. */}
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={['#025067', '#0B9FBD', '#6C0E42']} style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.lastUpdated}>Last Updated: October 2025</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Introduction</Text>
              <Text style={styles.paragraph}>
                Welcome to LUMA. We respect your privacy and are committed to protecting your personal data. This privacy
                policy explains how we collect, use, and safeguard your information when you use our voice journaling and
                horoscope application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Information We Collect</Text>

              <Text style={styles.subsectionTitle}>Personal Information</Text>
              <Text style={styles.paragraph}>
                • Birth date and time (for horoscope and numerology features){'\n'}
                • Voice recordings (converted to text for journal entries){'\n'}
                • Journal entries and mood data{'\n'}
                • User preferences and settings
              </Text>

              <Text style={styles.subsectionTitle}>Automatically Collected Information</Text>
              <Text style={styles.paragraph}>
                • Device information (type, operating system){'\n'}
                • App usage statistics{'\n'}
                • Crash reports and performance data
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How We Use Your Information</Text>
              <Text style={styles.paragraph}>
                We use your information to:{'\n\n'}
                • Provide personalized horoscope and numerology insights{'\n'}
                • Process and store your journal entries{'\n'}
                • Transcribe voice recordings into text{'\n'}
                • Generate AI-powered insights and summaries{'\n'}
                • Improve app functionality and user experience{'\n'}
                • Send notifications and reminders (if enabled){'\n'}
                • Provide customer support
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Storage and Security</Text>
              <Text style={styles.paragraph}>
                • All journal entries are stored locally on your device by default{'\n'}
                • Premium users can enable cloud backup for data synchronization{'\n'}
                • Voice recordings are processed securely and not permanently stored{'\n'}
                • We use industry-standard encryption to protect your data{'\n'}
                • Your data is never sold to third parties
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Third-Party Services</Text>
              <Text style={styles.paragraph}>
                We use the following third-party services:{'\n\n'}
                • AI transcription services for voice-to-text conversion{'\n'}
                • AI language models for generating insights{'\n'}
                • Cloud storage providers (for premium backup features){'\n'}
                • Analytics services to improve app performance{'\n\n'}
                These services may have access to limited data necessary for their functionality. We ensure all third-party
                services comply with privacy standards.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Rights</Text>
              <Text style={styles.paragraph}>
                You have the right to:{'\n\n'}
                • Access your personal data{'\n'}
                • Export your journal entries{'\n'}
                • Delete your data at any time{'\n'}
                • Opt-out of notifications{'\n'}
                • Disable cloud backup{'\n'}
                • Request data correction
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Retention</Text>
              <Text style={styles.paragraph}>
                • Journal entries are retained until you delete them{'\n'}
                • Voice recordings are deleted immediately after transcription{'\n'}
                • Account data is retained while your account is active{'\n'}
                • You can delete all data through the app settings
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Children&apos;s Privacy</Text>
              <Text style={styles.paragraph}>
                LUMA is not intended for users under the age of 13. We do not knowingly collect personal information from
                children under 13. If you believe we have collected information from a child under 13, please contact us
                immediately.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Changes to This Policy</Text>
              <Text style={styles.paragraph}>
                We may update this privacy policy from time to time. We will notify you of any significant changes through
                the app or via email. Your continued use of LUMA after changes are posted constitutes acceptance of the
                updated policy.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have questions about this privacy policy or how we handle your data, please contact us at:{'\n\n'}
                Email: jill.bentley11@gmail.com{'\n\n'}
                We will respond to your inquiry within 48 hours.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Consent</Text>
              <Text style={styles.paragraph}>
                By using LUMA, you consent to this privacy policy and agree to its terms. If you do not agree with this
                policy, please discontinue use of the app.
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2025 LUMA. All rights reserved.</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: { flex: 1 },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#025067',
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#025067',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B9FBD',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#025067',
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(2, 80, 103, 0.2)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#025067',
    fontStyle: 'italic',
  },
});
