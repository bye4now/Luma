import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Sparkles, Calendar, Gift, ArrowRight } from 'lucide-react-native';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSubscription } from '@/hooks/useSubscription';
import { useHoroscope } from '@/hooks/useHoroscope';
import { BirthDateSetup } from '@/components/BirthDateSetup';
import { colors } from '@/constants/colors';
import LumaLogo from '@/assets/images/LUMA_App_Icon_512px.png';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  header?: React.ReactNode;
  component: React.ReactNode;
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  const {
    currentStep,
    userName,
    completeWelcome,
    setUserName,
    completeBirthDateSetup,
    completeTrialOffer,
    completeOnboarding,
  } = useOnboarding();

  const { startTrial, plans, isProcessing } = useSubscription();
  const { saveBirthDate } = useHoroscope();

  const [localUserName, setLocalUserName] = useState(userName || '');
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(plans[1]?.id || 'yearly_premium');

  const handleNameSubmit = useCallback(async () => {
    const name = localUserName.trim();

    if (!name) {
      Alert.alert('Name required', 'Please enter your name to continue.');
      return;
    }

    await setUserName(name);
    await completeWelcome();
  }, [localUserName, setUserName, completeWelcome]);

  const handleBirthDateSet = useCallback(
    async (date: Date) => {
      await saveBirthDate(date);
      await completeBirthDateSetup();
      setShowBirthDatePicker(false);
    },
    [saveBirthDate, completeBirthDateSetup]
  );

  const handleStartTrial = useCallback(async () => {
    try {
      await startTrial(selectedPlan);
      await completeTrialOffer();
      await completeOnboarding();
      requestAnimationFrame(() => {
        router.replace('/(tabs)/home');
      });
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  }, [selectedPlan, startTrial, completeTrialOffer, completeOnboarding]);

  const handleSkipTrial = useCallback(async () => {
    try {
      await completeTrialOffer();
      await completeOnboarding();
      requestAnimationFrame(() => {
        router.replace('/(tabs)/home');
      });
    } catch (error) {
      console.error('Failed to skip trial:', error);
      requestAnimationFrame(() => {
        router.replace('/(tabs)/home');
      });
    }
  }, [completeTrialOffer, completeOnboarding]);

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welcome to LUMA',
      header: (
        <View style={styles.logoWrap}>
          <Image source={LumaLogo} style={styles.logo} resizeMode="contain" />
        </View>
      ),
      subtitle: 'Your private voice journal with cosmic insights',
      component: (
        <View style={styles.stepContainer}>
          <Text style={styles.stepDescription}>
            Transform your thoughts into insights with AI-powered journaling, personalized horoscopes, and numerology guidance.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>What should we call you?</Text>
            <TextInput
              style={styles.textInput}
              value={localUserName}
              onChangeText={setLocalUserName}
              placeholder="Enter your name"
              placeholderTextColor={`${colors.white}80`}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleNameSubmit}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleNameSubmit}>
            <Text style={styles.primaryButtonText}>Continue</Text>
            <ArrowRight size={20} color={colors.button.text} />
          </TouchableOpacity>
        </View>
      ),
    },

{
  id: 1,

header: (
  <Text
    style={{
      marginBottom: 12,
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: 2,              // ✅ REDUCED (prevents clipping)
      color: 'rgba(0,0,0,0.85)',     // ✅ darker, readable on light gradient
      textAlign: 'center',
      paddingHorizontal: 16,         // ✅ prevents last letter cut-off
      lineHeight: 26,                // ✅ Android rendering fix
      includeFontPadding: false,     // ✅ Android-only fix
      textShadowColor: 'rgba(255,255,255,0.35)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    }}
  >
    LUMA
  </Text>
),



  title: `Nice to meet you, ${userName || localUserName || 'there'}!`,
  subtitle: 'Set your birth date for personalized cosmic insights',

  icon: <Calendar size={48} color={colors.accent} />,

  component: (
    <View style={styles.stepContainer}>
      <Text style={styles.stepDescription}>
        Your birth date unlocks personalized horoscope readings and numerology
        insights that align with your cosmic blueprint.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setShowBirthDatePicker(true)}
      >
        <Calendar size={20} color={colors.button.text} />
        <Text style={styles.primaryButtonText}>Set Birth Date</Text>
      </TouchableOpacity>
    </View>
  ),
},

    {
      id: 2,
     title: 'Unlock Premium Features',
  header: <Text style={styles.brandText}>LUMA</Text>,
  subtitle: 'Start your free trial to access unlimited entries and insights',
  icon: <Gift size={48} color={colors.accent} />,
      component: (
        <View style={styles.stepContainer}>
          <View style={styles.trialOfferContainer}>
            <View style={styles.trialBadge}>
              <Text style={styles.trialBadgeText}>FREE TRIAL</Text>
            </View>

            <Text style={styles.trialTitle}>Premium Features</Text>

            <View style={styles.featuresList}>
              {[
                'Unlimited voice journal entries',
                'Daily personalized horoscopes',
                'Advanced numerology insights',
                'AI-powered mood analytics',
                'Cloud backup & sync',
                'Export your journal entries',
              ].map((feature) => (
                <View key={feature} style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.planSelector}>
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                const showPopularBadge = isSelected && plan.popular;

                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.planOption, isSelected && styles.planOptionSelected]}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    {showPopularBadge && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                      </View>
                    )}

                    <Text style={[styles.planName, isSelected && styles.planNameSelected]}>{plan.name}</Text>
                    <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                      ${plan.price}/{plan.period === 'monthly' ? 'mo' : 'yr'}
                    </Text>
                    <Text style={[styles.planTrial, isSelected && styles.planTrialSelected]}>
                      {plan.trialDays} days free
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isProcessing && styles.buttonDisabled]}
              onPress={handleStartTrial}
              disabled={isProcessing}
            >
              <Gift size={20} color={colors.button.text} />
              <Text style={styles.primaryButtonText}>{isProcessing ? 'Starting Trial...' : 'Start Free Trial'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkipTrial}>
              <Text style={styles.skipButtonText}>Continue with Free Version</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  if (!currentStepData || currentStep >= steps.length) {
    return null;
  }

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary, colors.surface]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentStep + 1) / steps.length) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {steps.length}
              </Text>
            </View>

            {/* Step Content */}
            <View style={styles.contentContainer}>
              {currentStepData.header ?? null}

              {currentStepData.icon ? (
                <View style={styles.iconContainer}>{currentStepData.icon}</View>
              ) : null}

              <Text style={styles.title}>{currentStepData.title}</Text>
              <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

              {currentStepData.component}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <BirthDateSetup
        visible={showBirthDatePicker}
        onClose={() => setShowBirthDatePicker(false)}
        onSave={handleBirthDateSet}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  logoWrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },

  logo: {
    width: 120,
    height: 120,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  progressContainer: {
    marginTop: 20,
    marginBottom: 40,
  },

  progressBar: {
    height: 4,
    backgroundColor: `${colors.secondary}33`,
    borderRadius: 2,
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  progressText: {
    fontSize: 12,
    color: `${colors.white}B3`,
    textAlign: 'center',
    fontWeight: '500',
  },

  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 5,
  },

brandText: {
  marginBottom: 14,
  fontSize: 28,
  fontWeight: '900',
  letterSpacing: 4,
  textAlign: 'center',
  color: 'rgba(0,0,0,0.55)', // darker for the light top gradient
  textShadowColor: 'rgba(255,255,255,0.25)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
},

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.secondary}1A`,
    borderWidth: 2,
    borderColor: `${colors.secondary}4D`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    color: `${colors.white}CC`,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },

  stepDescription: {
    fontSize: 16,
    color: `${colors.white}E6`,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },

  inputLabel: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },

  textInput: {
    backgroundColor: `${colors.secondary}1A`,
    borderWidth: 1,
    borderColor: `${colors.secondary}4D`,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.accent,
    textAlign: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,          // ✅ smaller so it won’t clip
    color: 'rgba(0,0,0,0.85)', // ✅ darker for the light top of gradient
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,     // ✅ prevents last letter clipping
    lineHeight: 26,            // ✅ helps Android render cleanly
    includeFontPadding: false, // ✅ Android fix
    textShadowColor: 'rgba(255,255,255,0.35)', // ✅ keeps readable when gradient   gets darker
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
},

  primaryButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
    marginBottom: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.button.text,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  trialOfferContainer: {
    width: '100%',
    alignItems: 'center',
  },

  trialBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },

  trialBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.button.text,
  },

  trialTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 24,
  },

  featuresList: {
    width: '100%',
    marginBottom: 32,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 12,
  },

  featureText: {
    fontSize: 14,
    color: `${colors.white}E6`,
    flex: 1,
  },

  planSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },

  planOption: {
    flex: 1,
    backgroundColor: `${colors.secondary}33`,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },

  planOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },

  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.button.text,
  },

  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },

  planNameSelected: {
    color: colors.background,
  },

  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 2,
  },

  planPriceSelected: {
    color: colors.background,
  },

  planTrial: {
    fontSize: 12,
    color: `${colors.white}B3`,
  },

  planTrialSelected: {
    color: colors.background,
  },

  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
  },

  skipButtonText: {
    fontSize: 14,
    color: `${colors.white}B3`,
    textDecorationLine: 'underline',
  },
});
