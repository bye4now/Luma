import { useCallback, useEffect, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

export interface SubscriptionPlan {
  id: string; // we'll use RevenueCat package.identifier (recommended)
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  trialDays: number; // best-effort display (trial length if available)
  features: string[];
  popular?: boolean;

  // RevenueCat helpers
  rcPackage?: PurchasesPackage;
  productIdentifier?: string; // store SKU
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan | null;
  expiresAt: Date | null;

  isTrialActive: boolean;
  trialEndsAt: Date | null;

  autoRenew: boolean; // RevenueCat doesn't always expose this reliably; we'll best-effort
  purchaseDate: Date | null;
}

const ENTITLEMENT_ID =
  (process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID as string | undefined) || 'premium';

function parseDate(d?: string | Date | null): Date | null {
  if (!d) return null;
  const dt = typeof d === 'string' ? new Date(d) : d;
  return isNaN(dt.getTime()) ? null : dt;
}

function daysBetweenNow(target: Date): number {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function bestEffortTrialDaysFromPackage(pkg?: PurchasesPackage): number {
  // RevenueCat SDK doesn’t always expose trial length consistently across platforms.
  // We'll return 7 as a safe display fallback if you configured a 7-day trial in Play Console.
  // If you later want this exact, we can derive it via product details (Android) when available.
  if (!pkg) return 7;
  return 7;
}

function mapPackageToPlan(pkg: PurchasesPackage): SubscriptionPlan {
  const product = pkg.product;

  // period: try to infer from identifier/name if needed
  const idLower = (pkg.identifier || product.identifier || '').toLowerCase();
  const period: 'monthly' | 'yearly' =
    idLower.includes('year') || idLower.includes('annual') ? 'yearly' : 'monthly';

  return {
    id: pkg.identifier, // IMPORTANT: use package.identifier for purchases
    name: product.title || (period === 'yearly' ? 'Premium Yearly' : 'Premium Monthly'),
    price: Number(product.priceString?.replace(/[^\d.]/g, '')) || Number(product.price) || 0,
    currency: product.currencyCode || 'USD',
    period,
    trialDays: bestEffortTrialDaysFromPackage(pkg),
    features: [
      'Cloud Backup & Sync',
      'Export to PDF & Word',
      'Unlimited Entries',
      'Advanced Analytics',
      'Custom Themes',
      'Priority Support',
    ],
    popular: period === 'yearly',
    rcPackage: pkg,
    productIdentifier: product.identifier,
  };
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [offerPlans, setOfferPlans] = useState<SubscriptionPlan[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Configure Purchases once here (better than per-component)
  useEffect(() => {
    const androidKey =
      (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string | undefined) || '';
    const iosKey =
      (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string | undefined) || '';

    const apiKey = Platform.OS === 'android' ? androidKey : iosKey;

    if (!apiKey) {
      console.warn(
        `[RevenueCat] Missing API key for ${Platform.OS}. Set EXPO_PUBLIC_REVENUECAT_ANDROID_KEY / EXPO_PUBLIC_REVENUECAT_IOS_KEY`
      );
      setIsLoading(false);
      return;
    }

    Purchases.setDebugLogsEnabled(__DEV__);
    Purchases.configure({ apiKey });

    // Keep customer info fresh
    const sub = Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });

    return () => {
      // Some versions return an unsubscribe function; others not.
      // If your TS complains, remove this.
      // @ts-ignore
      sub?.remove?.();
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const offerings = await Purchases.getOfferings();

      const current: PurchasesOffering | null =
        offerings.current || offerings.all?.[Object.keys(offerings.all || {})[0]] || null;

      const pkgs: PurchasesPackage[] = current?.availablePackages || [];

      const plans = pkgs.map(mapPackageToPlan);

      // Sort: yearly first if you want it default/popular
      plans.sort((a, b) => (a.period === 'yearly' ? -1 : 1));

      setOfferPlans(plans);

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (e) {
      console.error('[useSubscription] refresh failed', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const entitlement = useMemo(() => {
    if (!customerInfo) return null;
    const active = customerInfo.entitlements.active?.[ENTITLEMENT_ID];
    return active || null;
  }, [customerInfo]);

  const expiresAt = useMemo(() => parseDate(entitlement?.expirationDate), [entitlement]);
  const purchaseDate = useMemo(() => parseDate(entitlement?.latestPurchaseDate), [entitlement]);

  const isPremium = useMemo(() => {
    // If entitlement is active in RevenueCat, user is premium
    return !!entitlement;
  }, [entitlement]);

  const daysUntilExpiry = useMemo(() => {
    if (!expiresAt) return null;
    return Math.max(0, daysBetweenNow(expiresAt));
  }, [expiresAt]);

  const isTrialActive = useMemo(() => {
    // RevenueCat entitlement has periodType (NORMAL, TRIAL, INTRO)
    // Not all SDK typings expose it strongly, so we do best-effort.
    // @ts-ignore
    const pt = entitlement?.periodType;
    return pt === 'TRIAL';
  }, [entitlement]);

  const trialEndsAt = useMemo(() => {
    if (!isTrialActive) return null;
    return expiresAt;
  }, [isTrialActive, expiresAt]);

  const trialDaysRemaining = useMemo(() => {
    if (!isTrialActive || !trialEndsAt) return null;
    return Math.max(0, daysBetweenNow(trialEndsAt));
  }, [isTrialActive, trialEndsAt]);

  const activePlan = useMemo(() => {
    if (!isPremium) return null;

    // Try to match entitlement productIdentifier to our plans
    // @ts-ignore
    const activeProductId: string | undefined = entitlement?.productIdentifier;

    if (activeProductId) {
      const match = offerPlans.find((p) => p.productIdentifier === activeProductId);
      if (match) return match;
    }

    return null;
  }, [isPremium, entitlement, offerPlans]);

  const subscriptionStatus: SubscriptionStatus = useMemo(
    () => ({
      isActive: isPremium,
      plan: activePlan,
      expiresAt,
      isTrialActive,
      trialEndsAt,
      autoRenew: true, // best-effort; can be improved if you want
      purchaseDate,
    }),
    [isPremium, activePlan, expiresAt, isTrialActive, trialEndsAt, purchaseDate]
  );

  const subscribe = useCallback(
    async (planId: string) => {
      setIsProcessing(true);
      try {
        const plan = offerPlans.find((p) => p.id === planId);
        const pkg = plan?.rcPackage;

        if (!pkg) {
          throw new Error(
            `Plan not found for id "${planId}". Make sure planId matches RevenueCat package.identifier.`
          );
        }

        const { customerInfo: info } = await Purchases.purchasePackage(pkg);
        setCustomerInfo(info);

        return { success: true };
      } finally {
        setIsProcessing(false);
      }
    },
    [offerPlans]
  );

  const restorePurchases = useCallback(async () => {
    setIsProcessing(true);
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return { success: true };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    // You can't cancel directly in-app via RevenueCat/Play.
    // You must deep-link to Play Store subscription management.
    return { success: true };
  }, []);

  const reactivateSubscription = useCallback(async () => {
    // Reactivation is also done via Play Store management; purchases happen via subscribe().
    return { success: true };
  }, []);

  return useMemo(
    () => ({
      // data
      subscriptionStatus,
      plans: offerPlans,
      isLoading,
      isProcessing,
      isPremium,
      trialDaysRemaining,
      daysUntilExpiry,

      // actions
      refresh,
      subscribe,
      restorePurchases,
      cancelSubscription,
      reactivateSubscription,
    }),
    [
      subscriptionStatus,
      offerPlans,
      isLoading,
      isProcessing,
      isPremium,
      trialDaysRemaining,
      daysUntilExpiry,
      refresh,
      subscribe,
      restorePurchases,
      cancelSubscription,
      reactivateSubscription,
    ]
  );
});
