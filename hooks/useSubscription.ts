import { useState, useEffect, useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Platform } from 'react-native';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  trialDays: number;
  features: string[];
  popular?: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan | null;
  expiresAt: Date | null;
  isTrialActive: boolean;
  trialEndsAt: Date | null;
  autoRenew: boolean;
  purchaseDate: Date | null;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

const SUBSCRIPTION_STORAGE_KEY = 'subscription_status';
const PAYMENT_METHODS_KEY = 'payment_methods';

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly_premium',
    name: 'Premium Monthly',
    price: 3.99,
    currency: 'USD',
    period: 'monthly',
    trialDays: 7,
    features: [
      'Cloud Backup & Sync',
      'Export to PDF & Word',
      'Unlimited Entries',
      'Advanced Analytics',
      'Custom Themes',
      'Priority Support'
    ]
  },
  {
    id: 'yearly_premium',
    name: 'Premium Yearly',
    price: 39.99,
    currency: 'USD',
    period: 'yearly',
    trialDays: 7,
    features: [
      'Cloud Backup & Sync',
      'Export to PDF & Word',
      'Unlimited Entries',
      'Advanced Analytics',
      'Custom Themes',
      'Priority Support',
      '2 months free'
    ],
    popular: true
  }
];

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    plan: null,
    expiresAt: null,
    isTrialActive: false,
    trialEndsAt: null,
    autoRenew: true,
    purchaseDate: null
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadSubscriptionStatus = useCallback(async () => {
    try {
      console.log('🔵 [useSubscription] Loading subscription status from AsyncStorage...');
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      console.log('🔵 [useSubscription] Raw stored data:', stored ? stored.substring(0, 200) : 'null');
      if (stored) {
        const parsed = JSON.parse(stored);
        const status = {
          ...parsed,
          expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
          trialEndsAt: parsed.trialEndsAt ? new Date(parsed.trialEndsAt) : null,
          purchaseDate: parsed.purchaseDate ? new Date(parsed.purchaseDate) : null
        };
        console.log('🟢 [useSubscription] Loaded subscription:', {
          isActive: status.isActive,
          plan: status.plan?.name,
          isTrialActive: status.isTrialActive,
          trialEndsAt: status.trialEndsAt?.toISOString(),
        });
        setSubscriptionStatus(status);
      } else {
        console.log('🟡 [useSubscription] No stored subscription found');
      }
    } catch (error) {
      console.error('🔴 [useSubscription] Failed to load subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPaymentMethods = useCallback(async () => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.getItem(PAYMENT_METHODS_KEY);
      if (stored) {
        setPaymentMethods(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  }, []);

  useEffect(() => {
    loadSubscriptionStatus();
    loadPaymentMethods();
  }, [loadSubscriptionStatus, loadPaymentMethods]);

  const saveSubscriptionStatus = useCallback(async (status: SubscriptionStatus) => {
    try {
      console.log('🔵 [useSubscription] Saving subscription status:', {
        isActive: status.isActive,
        plan: status.plan?.name,
        isTrialActive: status.isTrialActive,
      });
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(status));
      console.log('🟢 [useSubscription] Successfully saved subscription status');
      
      // Verify the save
      const verification = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (verification) {
        const verified = JSON.parse(verification);
        console.log('🟢 [useSubscription] Verification: storage contains plan:', verified.plan?.name);
      }
    } catch (error) {
      console.error('🔴 [useSubscription] Failed to save subscription status:', error);
    }
  }, []);

  const savePaymentMethods = useCallback(async (methods: PaymentMethod[]) => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods));
    } catch (error) {
      console.error('Failed to save payment methods:', error);
    }
  }, []);

  const startTrial = useCallback(async (planId: string) => {
    setIsProcessing(true);
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000);
      const expiresAt = new Date(trialEndsAt.getTime() + 
        (plan.period === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);

      const newStatus: SubscriptionStatus = {
        isActive: true,
        plan,
        expiresAt,
        isTrialActive: true,
        trialEndsAt,
        autoRenew: true,
        purchaseDate: now
      };

      setSubscriptionStatus(newStatus);
      await saveSubscriptionStatus(newStatus);
      
      console.log(`Started ${plan.trialDays}-day trial for ${plan.name}`);
      return { success: true, trialEndsAt };
    } catch (error) {
      console.error('Failed to start trial:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [saveSubscriptionStatus]);

  const subscribe = useCallback(async (planId: string, paymentMethodId?: string) => {
    setIsProcessing(true);
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 
        (plan.period === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);

      const newStatus: SubscriptionStatus = {
        isActive: true,
        plan,
        expiresAt,
        isTrialActive: false,
        trialEndsAt: null,
        autoRenew: true,
        purchaseDate: now
      };

      setSubscriptionStatus(newStatus);
      await saveSubscriptionStatus(newStatus);
      
      console.log(`Subscribed to ${plan.name}`);
      return { success: true, expiresAt };
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [saveSubscriptionStatus]);

  const cancelSubscription = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newStatus: SubscriptionStatus = {
        ...subscriptionStatus,
        autoRenew: false
      };

      setSubscriptionStatus(newStatus);
      await saveSubscriptionStatus(newStatus);
      
      console.log('Subscription cancelled - will not auto-renew');
      return { success: true };
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [subscriptionStatus, saveSubscriptionStatus]);

  const reactivateSubscription = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newStatus: SubscriptionStatus = {
        ...subscriptionStatus,
        autoRenew: true
      };

      setSubscriptionStatus(newStatus);
      await saveSubscriptionStatus(newStatus);
      
      console.log('Subscription reactivated');
      return { success: true };
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [subscriptionStatus, saveSubscriptionStatus]);

  const addPaymentMethod = useCallback(async (method: Omit<PaymentMethod, 'id'>) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newMethod: PaymentMethod = {
        ...method,
        id: Date.now().toString()
      };

      const updatedMethods = [...paymentMethods, newMethod];
      setPaymentMethods(updatedMethods);
      await savePaymentMethods(updatedMethods);
      
      console.log('Payment method added');
      return { success: true, method: newMethod };
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [paymentMethods, savePaymentMethods]);

  const removePaymentMethod = useCallback(async (methodId: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedMethods = paymentMethods.filter(m => m.id !== methodId);
      setPaymentMethods(updatedMethods);
      await savePaymentMethods(updatedMethods);
      
      console.log('Payment method removed');
      return { success: true };
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [paymentMethods, savePaymentMethods]);

  const isPremium = useMemo(() => {
    if (!subscriptionStatus.isActive) return false;
    if (!subscriptionStatus.expiresAt) return false;
    return new Date() < subscriptionStatus.expiresAt;
  }, [subscriptionStatus]);

  const isTrialExpired = useMemo(() => {
    if (!subscriptionStatus.isTrialActive || !subscriptionStatus.trialEndsAt) return false;
    return new Date() > subscriptionStatus.trialEndsAt;
  }, [subscriptionStatus]);

  const daysUntilExpiry = useMemo(() => {
    if (!subscriptionStatus.expiresAt) return null;
    const now = new Date();
    const diffTime = subscriptionStatus.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [subscriptionStatus.expiresAt]);

  const trialDaysRemaining = useMemo(() => {
    if (!subscriptionStatus.isTrialActive || !subscriptionStatus.trialEndsAt) return null;
    const now = new Date();
    const diffTime = subscriptionStatus.trialEndsAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [subscriptionStatus]);

  return useMemo(() => ({
    subscriptionStatus,
    paymentMethods,
    isLoading,
    isProcessing,
    isPremium,
    isTrialExpired,
    daysUntilExpiry,
    trialDaysRemaining,
    plans: SUBSCRIPTION_PLANS,
    startTrial,
    subscribe,
    cancelSubscription,
    reactivateSubscription,
    addPaymentMethod,
    removePaymentMethod
  }), [
    subscriptionStatus,
    paymentMethods,
    isLoading,
    isProcessing,
    isPremium,
    isTrialExpired,
    daysUntilExpiry,
    trialDaysRemaining,
    startTrial,
    subscribe,
    cancelSubscription,
    reactivateSubscription,
    addPaymentMethod,
    removePaymentMethod
  ]);
});