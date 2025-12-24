import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  X,
  CreditCard,
  Star,
  Gift,
  Clock,
  AlertCircle,
  Crown,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscription } from '@/hooks/useSubscription';
import { colors } from '@/constants/colors';
import LumaLogo from '@/assets/images/LUMA_App_Icon_512px.png';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PlanCardProps {
  plan: any;
  isSelected: boolean;
  onSelect: () => void;
  trialDaysRemaining?: number | null;
}

interface PaymentMethodCardProps {
  method: any;
  onSelect: () => void;
  onRemove: () => void;
  isSelected: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isSelected,
  onSelect,
  trialDaysRemaining,
}) => {
  const monthlyPrice =
    plan.period === 'yearly'
      ? (plan.price / 12).toFixed(2)
      : plan.price.toFixed(2);

  const savings =
    plan.period === 'yearly'
      ? Math.round(((4.99 * 12 - plan.price) / (4.99 * 12)) * 100)
      : 0;

  const textColor = isSelected ? '#0c1508' : '#a0d9da';

  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.selectedPlan]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Star size={12} color="#fff" />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: textColor }]}>{plan.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={[styles.planPrice, { color: textColor }]}>
            ${monthlyPrice}
          </Text>
          <Text
            style={[
              styles.pricePeriod,
              { color: isSelected ? '#374151' : '#7fb8b9' },
            ]}
          >
            /month
          </Text>
        </View>

        {plan.period === 'yearly' && (
          <Text
            style={[
              styles.yearlyPrice,
              { color: isSelected ? '#374151' : '#7fb8b9' },
            ]}
          >
            Billed ${plan.price}/year
          </Text>
        )}

        {savings > 0 && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Save {savings}%</Text>
          </View>
        )}
      </View>

      <View style={styles.trialInfo}>
        <Gift size={16} color="#10b981" />
        <Text style={styles.trialText}>
          {trialDaysRemaining
            ? `${trialDaysRemaining} days left in trial`
            : `${plan.trialDays}-day free trial`}
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.slice(0, 4).map((feature: string, index: number) => (
          <View key={index} style={styles.featureRow}>
            <Check size={14} color="#10b981" />
            <Text
              style={[
                styles.featureText,
                { color: isSelected ? '#374151' : '#a0d9da' },
              ]}
            >
              {feature}
            </Text>
          </View>
        ))}

        {plan.features.length > 4 && (
          <Text
            style={[
              styles.moreFeatures,
              { color: isSelected ? '#374151' : '#7fb8b9' },
            ]}
          >
            +{plan.features.length - 4} more features
          </Text>
        )}
      </View>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Check size={20} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  onSelect,
  onRemove,
  isSelected,
}) => {
  const getPaymentIcon = () => {
    switch (method.type) {
      case 'apple_pay':
        return <Text style={styles.paymentIcon}>🍎</Text>;
      case 'google_pay':
        return <Text style={styles.paymentIcon}>G</Text>;
      case 'paypal':
        return <Text style={styles.paymentIcon}>P</Text>;
      default:
        return <CreditCard size={20} color="#6b7280" />;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.paymentCard, isSelected && styles.selectedPayment]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.paymentInfo}>
        {getPaymentIcon()}
        <View style={styles.paymentDetails}>
          <Text style={styles.paymentType}>
            {method.brand || method.type.replace('_', ' ').toUpperCase()}
          </Text>
          {method.last4 && (
            <Text style={styles.paymentLast4}>•••• {method.last4}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <X size={16} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const {
    plans,
    paymentMethods,
    isProcessing,
    trialDaysRemaining,
    startTrial,
    subscribe,
    addPaymentMethod,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState(plans.find(p => p.popular) || plans[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [step, setStep] = useState<'plans' | 'payment' | 'processing'>('plans');

  const handleStartTrial = async () => {
    if (!selectedPlan) return;

    setStep('processing');
    try {
      await startTrial(selectedPlan.id);
      Alert.alert(
        'Trial Started!',
        `Your ${selectedPlan.trialDays}-day free trial has begun. Enjoy all premium features!`,
        [{ text: 'Get Started', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start trial. Please try again.');
      setStep('plans');
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    if (paymentMethods.length === 0) {
      setShowPaymentForm(true);
      return;
    }

    setStep('processing');
    try {
      await subscribe(selectedPlan.id, selectedPaymentMethod || undefined);
      Alert.alert(
        'Subscription Active!',
        'Welcome to Premium! All features are now unlocked.',
        [{ text: 'Continue', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
      setStep('payment');
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      await addPaymentMethod({
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        isDefault: paymentMethods.length === 0,
      });
      setShowPaymentForm(false);
      setStep('payment');
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method.');
    }
  };

  const renderPlansStep = () => (
    <>
      <View style={styles.heroSection}>
        {/* ✅ LUMA ICON + subtle glow */}
        <View style={styles.logoGlow}>
          <Image source={LumaLogo} style={styles.lumaHeroLogo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Start with a free trial, cancel anytime</Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan?.id === plan.id}
            onSelect={() => setSelectedPlan(plan)}
            trialDaysRemaining={trialDaysRemaining}
          />
        ))}
      </View>

      <View style={styles.actionButtons}>
        {trialDaysRemaining ? (
          <TouchableOpacity style={styles.subscribeButton} onPress={() => setStep('payment')}>
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.trialButton}
              onPress={handleStartTrial}
              disabled={isProcessing}
            >
              <LinearGradient colors={['#b8dda0', '#8fb87a']} style={styles.buttonGradient}>
                <Gift size={20} color="#0c1508" />
                <Text style={styles.trialButtonText}>
                  Start {selectedPlan?.trialDays}-Day Free Trial
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subscribeButton} onPress={() => setStep('payment')}>
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );

  const renderPaymentStep = () => (
    <>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setStep('plans')} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Payment Method</Text>
      </View>

      <View style={styles.selectedPlanSummary}>
        <Text style={styles.summaryTitle}>Selected Plan</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryPlan}>{selectedPlan?.name}</Text>
          <Text style={styles.summaryPrice}>
            ${selectedPlan?.price}/{selectedPlan?.period}
          </Text>
        </View>
      </View>

      <View style={styles.paymentMethodsContainer}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isSelected={selectedPaymentMethod === method.id}
            onSelect={() => setSelectedPaymentMethod(method.id)}
            onRemove={() => {}}
          />
        ))}

        <TouchableOpacity style={styles.addPaymentButton} onPress={() => setShowPaymentForm(true)}>
          <Text style={styles.addPaymentText}>+ Add Payment Method</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleSubscribe}
        disabled={isProcessing || paymentMethods.length === 0}
      >
        <LinearGradient colors={['#2b7879', '#1a5a5b']} style={styles.buttonGradient}>
          <Text style={styles.confirmButtonText}>Confirm Subscription</Text>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderProcessingStep = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color="#2b7879" />
      <Text style={styles.processingText}>Processing...</Text>
      <Text style={styles.processingSubtext}>
        Please wait while we set up your subscription
      </Text>
    </View>
  );

  const renderPaymentForm = () => (
    <Modal
      visible={showPaymentForm}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={() => setShowPaymentForm(false)}
    >
      <View style={[styles.paymentFormContainer, { paddingTop: insets.top }]}>
        <View style={styles.paymentFormHeader}>
          <TouchableOpacity onPress={() => setShowPaymentForm(false)}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.paymentFormTitle}>Add Payment Method</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.paymentFormContent}>
          <Text style={styles.demoText}>Demo: This would show a payment form</Text>
          <TouchableOpacity style={styles.demoAddButton} onPress={handleAddPaymentMethod}>
            <Text style={styles.demoAddText}>Add Demo Card (Visa ••••4242)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
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
            {step === 'plans' && renderPlansStep()}
            {step === 'payment' && renderPaymentStep()}
            {step === 'processing' && renderProcessingStep()}
          </ScrollView>

          
        </View>
      </Modal>

      {renderPaymentForm()}
    </>
  );
};

export const TrialBanner: React.FC = () => {
  const { trialDaysRemaining, isTrialExpired, isLoading, subscriptionStatus } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  if (isLoading || !subscriptionStatus.isTrialActive) return null;

  return (
    <>
      <View style={[styles.trialBanner, isTrialExpired && styles.expiredBanner]}>
        <View style={styles.bannerContent}>
          <Clock size={16} color={isTrialExpired ? '#ef4444' : colors.accent} />
          <Text style={[styles.bannerText, isTrialExpired && styles.expiredText]}>
            {isTrialExpired
              ? 'Trial expired - Subscribe to continue'
              : `${trialDaysRemaining} days left in trial`}
          </Text>
        </View>
        <TouchableOpacity style={styles.bannerButton} onPress={() => setShowModal(true)}>
          <Text style={styles.bannerButtonText}>{isTrialExpired ? 'Subscribe' : 'Upgrade'}</Text>
        </TouchableOpacity>
      </View>
      <SubscriptionModal visible={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export const SubscriptionStatus: React.FC = () => {
  const {
    subscriptionStatus,
    isPremium,
    daysUntilExpiry,
    cancelSubscription,
    reactivateSubscription,
    isProcessing,
  } = useSubscription();

  const [showModal, setShowModal] = useState(false);

  if (!isPremium) {
    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Free Plan</Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={() => setShowModal(true)}>
            <Crown size={16} color="#2b7879" />
            <Text style={styles.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.statusDescription}>
          Limited to 10 entries per day. Upgrade for unlimited access.
        </Text>
        <SubscriptionModal visible={showModal} onClose={() => setShowModal(false)} />
      </View>
    );
  }

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      "Are you sure you want to cancel? You'll lose access to premium features when your current period ends.",
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => cancelSubscription() },
      ]
    );
  };

  return (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={styles.premiumBadge}>
          <Crown size={16} color="#fbbf24" />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
        <Text style={styles.subscriptionPlanName}>{subscriptionStatus.plan?.name}</Text>
      </View>

      <View style={styles.statusDetails}>
        <Text style={styles.statusDescription}>
          {subscriptionStatus.isTrialActive
            ? `Trial ends in ${daysUntilExpiry} days`
            : `Renews in ${daysUntilExpiry} days`}
        </Text>

        {!subscriptionStatus.autoRenew && (
          <View style={styles.warningContainer}>
            <AlertCircle size={16} color="#2b7879" />
            <Text style={styles.warningText}>Subscription will not auto-renew</Text>
          </View>
        )}
      </View>

      <View style={styles.statusActions}>
        {subscriptionStatus.autoRenew ? (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>
              {isProcessing ? 'Processing...' : 'Cancel Subscription'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.reactivateButton}
            onPress={reactivateSubscription}
            disabled={isProcessing}
          >
            <Text style={styles.reactivateButtonText}>
              {isProcessing ? 'Processing...' : 'Reactivate Subscription'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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

  /* ✅ New: LUMA icon + subtle glow */
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
  lumaHeroLogo: {
    width: 58,
    height: 58,
    borderRadius: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  plansContainer: { gap: 16, marginBottom: 30 },

  planCard: {
    backgroundColor: '#0c1508',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#0c1508',
  },
  selectedPlan: {
    backgroundColor: '#a0d9da',
    borderWidth: 3,
    borderColor: '#2b7879',
  },

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

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
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
  trialText: { color: '#16a34a', fontSize: 14, fontWeight: '500' },

  featuresContainer: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: '#4b5563', flex: 1 },
  moreFeatures: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },

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
  subscribeButtonText: { fontSize: 20, fontWeight: '700', color: '#000' },

  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 16 },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#6b7280' },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },

  selectedPlanSummary: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  summaryTitle: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryPlan: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  summaryPrice: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },

  paymentMethodsContainer: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 },

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedPayment: { borderColor: '#2b7879', backgroundColor: 'rgba(43, 120, 121, 0.1)' },

  paymentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentIcon: { fontSize: 20 },
  paymentDetails: { gap: 2 },
  paymentType: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  paymentLast4: { fontSize: 14, color: '#6b7280' },
  removeButton: { padding: 8 },

  addPaymentButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addPaymentText: { fontSize: 16, color: '#6b7280', fontWeight: '500' },

  confirmButton: { borderRadius: 12, marginBottom: 20 },
  confirmButtonText: { fontSize: 18, fontWeight: '600', color: '#fff' },

  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  processingText: { fontSize: 20, fontWeight: '600', color: '#1f2937' },
  processingSubtext: { fontSize: 16, color: '#6b7280', textAlign: 'center' },

  paymentFormContainer: { flex: 1, backgroundColor: '#fff' },
  paymentFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  paymentFormTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  paymentFormContent: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  demoText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  demoAddButton: {
    backgroundColor: '#2b7879',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  demoAddText: { color: '#fff', fontWeight: '600' },

  footer: { paddingHorizontal: 20, paddingTop: 14 },
  termsText: { fontSize: 13, color: '#4b5563', textAlign: 'center', lineHeight: 18 },

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
  expiredBanner: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  bannerText: { fontSize: 14, color: colors.accent, fontWeight: '500' },
  expiredText: { color: '#dc2626' },
  bannerButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bannerButtonText: { color: colors.button.text, fontSize: 14, fontWeight: '600' },

  statusCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 20, margin: 16 },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 120, 121, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  upgradeText: { color: '#2b7879', fontSize: 14, fontWeight: '600' },

  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 120, 121, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: { color: '#2b7879', fontSize: 12, fontWeight: '700' },
  subscriptionPlanName: { fontSize: 16, color: '#6b7280' },

  statusDetails: { marginBottom: 16 },
  statusDescription: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  warningContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  warningText: { fontSize: 14, color: '#2b7879', fontWeight: '500' },

  statusActions: { gap: 8 },
  cancelButton: { backgroundColor: '#fee2e2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },
  reactivateButton: { backgroundColor: '#dcfce7', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  reactivateButtonText: { color: '#16a34a', fontSize: 14, fontWeight: '500' },
});
