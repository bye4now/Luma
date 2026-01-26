import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import { useSubscription } from '@/hooks/useSubscription';
import { colors } from '@/constants/colors';
import LumaLogo from '@/assets/images/LUMA_App_Icon_512px.png';

// Optional: If you have expo-application installed
// npm i expo-application
let getAppId: (() => string | null) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Application = require('expo-application');
  getAppId = () => Application.applicationId ?? null;
} catch {
  getAppId = () => null;
}

function openPlayStoreSubscriptions(productId?: string) {
  const packageName = getAppId?.() || undefined;

  // Best deep link (works if packageName + sku are provided)
  if (Platform.OS === 'android' && packageName && productId) {
    const url = `https://play.google.com/store/account/subscriptions?package=${packageName}&sku=${productId}`;
    Linking.openURL(url);
    return;
  }

  // Fallback
  Linking.openURL('https://play.google.com/store/account/subscriptions');
}

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const {
    subscriptionStatus,
    plans,
    isProcessing,
    isLoading,
    isPremium,
    trialDaysRemaining,
    daysUntilExpiry,
    subscribe,
    restorePurchases,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ✅ Set a default plan once plans are loaded
  useEffect(() => {
    if (!selectedPlan && (plans?.length ?? 0) > 0) {
      setSelectedPlan(plans[0].id);
    }
  }, [plans, selectedPlan]);

  // ✅ Show a proper loading screen while RevenueCat loads offerings/plans
  if (isLoading) {
    return (
      <LinearGradient
        colors={['#000000', '#025067', '#6C0E42']}
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: '#b8dda0', fontSize: 16, opacity: 0.9 }}>
          Loading subscription…
        </Text>
      </LinearGradient>
    );
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      await subscribe(selectedPlan);
      router.back();
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  // SKU used for Play Store “manage subscription” deep link
  const activeSku = subscriptionStatus.plan?.productIdentifier;

  return (
    <LinearGradient
      colors={['#000000', '#025067', '#6C0E42']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#2b7879" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isPremium && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Image source={LumaLogo} style={styles.lumaIconSmall} />
              <Text style={styles.statusTitle}>Premium Active</Text>
            </View>

            {subscriptionStatus.isTrialActive && trialDaysRemaining !== null && (
              <Text style={styles.statusSubtitle}>
                {trialDaysRemaining} days left in your free trial
              </Text>
            )}

            {!subscriptionStatus.isTrialActive && daysUntilExpiry !== null && (
              <Text style={styles.statusSubtitle}>{daysUntilExpiry} days until renewal</Text>
            )}

            {subscriptionStatus.plan && (
              <Text style={styles.planInfo}>
                {subscriptionStatus.plan.name} • ${subscriptionStatus.plan.price}/
                {subscriptionStatus.plan.period === 'monthly' ? 'month' : 'year'}
              </Text>
            )}
          </View>
        )}

        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Image source={LumaLogo} style={styles.lumaIconHero} />
          </View>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to all premium features and transform your journaling experience
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          <View style={styles.featuresList}>
            {[
              { icon: '🎙️', title: 'Unlimited Voice Entries', description: 'Record as many journal entries as you want' },
              { icon: '🔮', title: 'Daily Horoscopes', description: 'Personalized cosmic insights based on your birth chart' },
              { icon: '🔢', title: 'Advanced Numerology', description: 'Deep numerological analysis and guidance' },
              { icon: '📊', title: 'AI Mood Analytics', description: 'Track patterns and insights in your emotional journey' },
              { icon: '☁️', title: 'Cloud Backup & Sync', description: 'Never lose your entries with automatic cloud storage' },
              { icon: '📄', title: 'Export & Share', description: 'Export your journal to PDF or share insights' },
              { icon: '🎨', title: 'Custom Themes', description: 'Personalize your app with beautiful cosmic themes' },
              { icon: '⚡', title: 'Priority Support', description: 'Get help faster with premium customer support' },
            ].map((feature) => (
              <View key={feature.title} style={styles.featureItem}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Check size={20} color="#2b7879" />
              </View>
            ))}
          </View>
        </View>

        {!isPremium && (
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>

            <View style={styles.plansList}>
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;

                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planCard, isSelected && styles.planCardSelected]}
                    activeOpacity={0.75}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                      </View>
                    )}

                    <View style={styles.planTopRow}>
                      <Text style={[styles.planName, { color: isSelected ? '#0c1508' : '#b8dda0' }]}>
                        {plan.name}
                      </Text>

                      {isSelected && (
                        <View style={styles.planSelectedCheck}>
                          <Check size={16} color="#fff" />
                        </View>
                      )}
                    </View>

                    <View style={styles.planPricing}>
                      <Text style={[styles.planPrice, { color: isSelected ? '#0c1508' : '#b8dda0' }]}>
                        ${plan.price}
                      </Text>
                      <Text style={[styles.planPeriod, { color: isSelected ? '#374151' : '#7fb8b9' }]}>
                        /{plan.period === 'monthly' ? 'month' : 'year'}
                      </Text>
                    </View>

                    <Text style={[styles.planTrial, { color: isSelected ? '#374151' : '#7fb8b9' }]}>
                      {plan.trialDays ? `${plan.trialDays} days free trial` : 'No free trial'}
                    </Text>

                    <View style={styles.planFeatures}>
                      {plan.features.slice(0, 3).map((feature) => (
                        <View key={feature} style={styles.planFeatureItem}>
                          <Check size={16} color="#10b981" />
                          <Text style={[styles.planFeatureText, { color: isSelected ? '#0c1508' : '#b8dda0' }]}>
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          {!isPremium ? (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, (isProcessing || !selectedPlan) && styles.buttonDisabled]}
                onPress={handleSubscribe}
                disabled={isProcessing || !selectedPlan}
              >
                <LinearGradient colors={['#2b7879', '#1a5a5b']} style={styles.buttonGradient}>
                  <Image source={LumaLogo} style={styles.lumaIconButton} />
                  <Text style={styles.primaryButtonText}>
                    {isProcessing ? 'Processing...' : 'Subscribe Now'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.restoreButton, isProcessing && styles.buttonDisabled]}
                onPress={restorePurchases}
                disabled={isProcessing}
              >
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCancelModal(true)}>
              <Text style={styles.cancelButtonText}>Manage in Play Store</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.disclaimer}>Cancel anytime. No commitments. Your data stays yours.</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModal}>
            <Text style={styles.cancelModalTitle}>Manage Subscription</Text>
            <Text style={styles.cancelModalText}>
              Google Play manages billing, upgrades, downgrades, and cancellation.
            </Text>

            <View style={styles.cancelModalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelModalButton, styles.cancelModalConfirm]}
                onPress={() => {
                  setShowCancelModal(false);
                  openPlayStoreSubscriptions(activeSku);
                }}
              >
                <Text style={[styles.cancelModalButtonText, styles.cancelModalConfirmText]}>
                  Open Play Store
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2b7879' },
  placeholder: { width: 40 },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },

  statusCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusTitle: { fontSize: 18, fontWeight: '700', color: '#2b7879', marginLeft: 10 },
  statusSubtitle: { fontSize: 14, color: 'rgba(212, 175, 55, 0.8)', marginBottom: 4 },
  planInfo: { fontSize: 12, color: 'rgba(212, 175, 55, 0.6)' },

  heroSection: { alignItems: 'center', paddingVertical: 24 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2b7879',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#2b7879', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: 'rgba(212, 175, 55, 0.8)', textAlign: 'center', lineHeight: 22 },

  featuresSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#2b7879', marginBottom: 20 },

  featuresList: { gap: 16 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  featureIcon: { fontSize: 24, marginRight: 16 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#2b7879', marginBottom: 4 },
  featureDescription: { fontSize: 14, color: 'rgba(212, 175, 55, 0.7)', lineHeight: 18 },

  plansSection: { marginBottom: 24 },
  plansList: { gap: 16 },

  planCard: {
    backgroundColor: '#0c1508',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#1a2414',
  },
  planCardSelected: {
    backgroundColor: '#b8dda0',
    borderWidth: 3,
    borderColor: '#2b7879',
    shadowColor: '#2b7879',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#2b7879',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: { fontSize: 10, fontWeight: '700', color: '#000000' },

  planTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planSelectedCheck: { backgroundColor: '#2b7879', borderRadius: 12, padding: 4 },

  planName: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  planPricing: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  planPrice: { fontSize: 32, fontWeight: '700' },
  planPeriod: { fontSize: 16, marginLeft: 4 },
  planTrial: { fontSize: 14, marginBottom: 16 },
  planFeatures: { gap: 8 },
  planFeatureItem: { flexDirection: 'row', alignItems: 'center' },
  planFeatureText: { fontSize: 14, marginLeft: 8 },

  footer: {
    marginTop: 16,
    backgroundColor: 'rgba(15, 15, 35, 0.45)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  primaryButton: {
    marginBottom: 12,
    shadowColor: '#2b7879',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  buttonDisabled: { opacity: 0.7 },

  restoreButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 12,
  },
  restoreText: { color: '#fff', fontWeight: '600' },

  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },

  disclaimer: { fontSize: 12, color: 'rgba(212, 175, 55, 0.7)', textAlign: 'center', lineHeight: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cancelModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  cancelModalTitle: { fontSize: 20, fontWeight: '700', color: '#2b7879', textAlign: 'center', marginBottom: 16 },
  cancelModalText: { fontSize: 16, color: 'rgba(212, 175, 55, 0.8)', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  cancelModalButtons: { flexDirection: 'row', gap: 12 },
  cancelModalButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelModalConfirm: { borderColor: '#ef4444' },
  cancelModalButtonText: { fontSize: 16, fontWeight: '600', color: '#2b7879' },
  cancelModalConfirmText: { color: '#ef4444' },

  lumaIconSmall: { width: 22, height: 22, borderRadius: 6 },
  lumaIconHero: { width: 44, height: 44, borderRadius: 10 },
  lumaIconButton: { width: 22, height: 22, borderRadius: 6 },
});

