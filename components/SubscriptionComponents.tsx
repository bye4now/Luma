// components/SubscriptionComponents.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';

import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, Star, Gift } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { colors } from '@/constants/colors';
import LumaLogo from '@/assets/images/LUMA_App_Icon_512px.png';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PlanCardProps {
  title: string;
  subtitle?: string;
  priceText: string;
  periodText: string;
  isSelected: boolean;
  popular?: boolean;
  savingsText?: string;
  onSelect: () => void;
  features: string[];
}

/**
 * Match this to your RevenueCat entitlement identifier.
 * RevenueCat → Entitlements → Identifier
 */
const PREMIUM_ENTITLEMENT_ID =
  (process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID as string | undefined) || 'premium';

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  subtitle,
  priceText,
  periodText,
  isSelected,
  popular,
  savingsText,
  onSelect,
  features,
}) => {
  const textColor = isSelected ? '#0c1508' : '#a0d9da';

  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.selectedPlan]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {popular && (
        <View style={styles.popularBadge}>
          <Star size={12} color="#fff" />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: textColor }]}>{title}</Text>

        <View style={styles.priceContainer}>
          <Text style={[styles.planPrice, { color: textColor }]}>{priceText}</Text>
          <Text style={[styles.pricePeriod, { color: isSelected ? '#374151' : '#7fb8b9' }]}>
            {periodText}
          </Text>
        </View>

        {subtitle ? (
          <Text style={[styles.yearlyPrice, { color: isSelected ? '#374151' : '#7fb8b9' }]}>
            {subtitle}
          </Text>
        ) : null}

        {savingsText ? (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{savingsText}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.trialInfo}>
        <Gift size={16} color="#10b981" />
        <Text style={styles.trialText}>
          Google Play will show any trial / intro price at checkout
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.slice(0, 4).map((feature, idx) => (
          <View key={idx} style={styles.featureRow}>
            <Check size={14} color="#10b981" />
            <Text style={[styles.featureText, { color: isSelected ? '#374151' : '#a0d9da' }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Check size={20} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();

  const [isRcReady, setIsRcReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // 1) Configure RevenueCat once
  useEffect(() => {
    const androidKey = (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string | undefined) || '';
    const iosKey = (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string | undefined) || '';
    const apiKey = Platform.OS === 'android' ? androidKey : iosKey;

    if (!apiKey) {
      console.warn(
        `[RevenueCat] Missing API key for ${Platform.OS}. Set EXPO_PUBLIC_REVENUECAT_ANDROID_KEY / EXPO_PUBLIC_REVENUECAT_IOS_KEY`
      );
      return;
    }

    Purchases.setDebugLogsEnabled(__DEV__);
    Purchases.configure({ apiKey });
    setIsRcReady(true);
  }, []);

  // 2) Load Offerings whenever modal opens
  useEffect(() => {
    if (!visible) return;
    if (!isRcReady) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const offerings = await Purchases.getOfferings();

        // Prefer explicit offering named "default" if it exists, else use current.
        const defaultOffering = offerings.all?.default ?? offerings.current ?? null;

        if (!defaultOffering) {
          Alert.alert(
            'RevenueCat setup incomplete',
            'No Offering found. In RevenueCat, create an Offering (ex: "default") and add Monthly + Annual packages.'
          );
          return;
        }

        if (cancelled) return;

        setOffering(defaultOffering);

        // Auto-select monthly ($rc_monthly) if present; else first.
        const monthly = defaultOffering.availablePackages.find((p) => p.identifier === '$rc_monthly');
        const first = defaultOffering.availablePackages[0];
        setSelectedPackageId(monthly?.identifier ?? first?.identifier ?? null);
      } catch (e: any) {
        console.error('Failed to load offerings:', e);
        Alert.alert('Error', 'Could not load subscription options from RevenueCat.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [visible, isRcReady]);

  const packages = useMemo(() => offering?.availablePackages ?? [], [offering]);

  const selectedPackage: PurchasesPackage | null = useMemo(() => {
    if (!selectedPackageId) return null;
    return packages.find((p) => p.identifier === selectedPackageId) ?? null;
  }, [packages, selectedPackageId]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsLoading(true);
    try {
      const result = await Purchases.purchasePackage(selectedPackage);

      const info: CustomerInfo = result.customerInfo;
      const isPremiumActive = !!info.entitlements.active[PREMIUM_ENTITLEMENT_ID];

      if (!isPremiumActive) {
        Alert.alert(
          'Purchased, but premium not unlocked',
          `Purchase succeeded, but RevenueCat doesn’t show entitlement "${PREMIUM_ENTITLEMENT_ID}" as active.\n\nRevenueCat → Entitlements: confirm identifier + attach products to this entitlement.`
        );
        return;
      }

      Alert.alert('Premium Active!', 'You’re all set 🎉', [{ text: 'Continue', onPress: onClose }]);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.toLowerCase().includes('cancel') || e?.userCancelled) {
        // user cancelled: no alert
      } else {
        console.error('Purchase failed:', e);
        Alert.alert('Purchase failed', 'Google Play could not complete the purchase. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // UI-only features list
  const featureBullets = useMemo(
    () => [
      'Cloud Backup & Sync',
      'Unlimited Entries',
      'Export to PDF',
      'Advanced Analytics',
      'Custom Themes',
      'Priority Support',
    ],
    []
  );

  const packageCardData = (p: PurchasesPackage) => {
    const product = p.product as any;

    const priceText = product?.priceString ?? `$${product?.price ?? ''}`;

    const periodText =
      p.identifier === '$rc_annual'
        ? '/year'
        : p.identifier === '$rc_monthly'
          ? '/month'
          : '';

    const title =
      p.identifier === '$rc_annual'
        ? 'Premium Yearly'
        : p.identifier === '$rc_monthly'
          ? 'Premium Monthly'
          : p.identifier;

    const popular = p.identifier === '$rc_annual';
    const subtitle = p.identifier === '$rc_annual' ? 'Best value yearly plan' : undefined;

    return { title, subtitle, priceText, periodText, popular };
  };

  const goToSubscriptionScreen = () => {
    onClose?.();
    router.push('/subscription');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.logoGlow}>
              <Image source={LumaLogo} style={styles.lumaHeroLogo} resizeMode="contain" />
            </View>

            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>Google Play will show trial/discounts at checkout</Text>

            {/* DEBUG / CONFIRMATION (helps you confirm you're on the correct modal) */}
            <Text style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              RevenueCat Offering: {offering?.identifier ?? '(loading...)'}
            </Text>
          </View>

          {isLoading && !offering ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#2b7879" />
              <Text style={styles.processingText}>Loading options…</Text>
            </View>
          ) : null}

          {offering ? (
            <View style={styles.plansContainer}>
              {packages.map((p) => {
                const card = packageCardData(p);
                return (
                  <PlanCard
                    key={p.identifier}
                    title={card.title}
                    subtitle={card.subtitle}
                    priceText={card.priceText}
                    periodText={card.periodText}
                    popular={card.popular}
                    isSelected={selectedPackageId === p.identifier}
                    onSelect={() => setSelectedPackageId(p.identifier)}
                    features={featureBullets}
                  />
                );
              })}
            </View>
          ) : null}

          <View style={styles.actionButtons}>
            {/* ✅ This is the REAL purchase flow. No payment-method screens. */}
            <TouchableOpacity
              style={styles.trialButton}
              onPress={handlePurchase}
              disabled={isLoading || !selectedPackage}
            >
              <LinearGradient colors={['#b8dda0', '#8fb87a']} style={styles.buttonGradient}>
                <Gift size={20} color="#0c1508" />
                <Text style={styles.trialButtonText}>
                  {isLoading ? 'Processing…' : 'Continue to Google Play'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Optional: also allow routing to /subscription (your dedicated screen) */}
            <TouchableOpacity style={styles.subscribeButton} onPress={goToSubscriptionScreen}>
              <Text style={styles.subscribeButtonText}>Open Full Subscription Screen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={async () => {
                try {
                  await Purchases.showManageSubscriptions();
                } catch {
                  Alert.alert(
                    'Manage Subscriptions',
                    'Open Google Play → Payments & subscriptions → Subscriptions.'
                  );
                }
              }}
            >
              <Text style={styles.subscribeButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export const TrialBanner: React.FC = () => null;
export const SubscriptionStatus: React.FC = () => null;

// --- styles (unchanged) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  closeButton: { padding: 8 },
  content: { flex: 1, paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', paddingVertical: 30 },
  logoGlow: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(43, 120, 121, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#2b7879',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },
  lumaHeroLogo: { width: 58, height: 58, borderRadius: 14 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24 },
  plansContainer: { gap: 16, marginBottom: 30 },
  planCard: {
    backgroundColor: '#0c1508',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#0c1508',
  },
  selectedPlan: { backgroundColor: '#a0d9da', borderWidth: 3, borderColor: '#2b7879' },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  planHeader: { marginBottom: 16 },
  planName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  planPrice: { fontSize: 32, fontWeight: 'bold' },
  pricePeriod: { fontSize: 16, color: '#6b7280', marginLeft: 4 },
  yearlyPrice: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  savingsBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  savingsText: { color: '#16a34a', fontSize: 12, fontWeight: '600' },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  trialText: { color: '#16a34a', fontSize: 14, fontWeight: '500', flex: 1 },
  featuresContainer: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: '#4b5563', flex: 1 },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#2b7879',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: { gap: 12, marginBottom: 20 },
  trialButton: { borderRadius: 12 },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  trialButtonText: { fontSize: 16, fontWeight: '600', color: '#0c1508' },
  subscribeButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: { fontSize: 16, fontWeight: '700', color: '#000' },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  processingText: { fontSize: 20, fontWeight: '600', color: '#1f2937' },

  // kept for compatibility
  trialBanner: {
    backgroundColor: `${colors.accent}1A`,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
