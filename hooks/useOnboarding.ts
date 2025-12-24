import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  hasSeenWelcome: boolean;
  hasSetBirthDate: boolean;
  hasSeenTrialOffer: boolean;
  userName: string | null;
  currentStep: number;
}

const ONBOARDING_STORAGE_KEY = 'onboarding_state';

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  hasSeenWelcome: false,
  hasSetBirthDate: false,
  hasSeenTrialOffer: false,
  userName: null,
  currentStep: 0,
};

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  const loadOnboardingState = useCallback(async () => {
    try {
      console.log('🔵 [useOnboarding] Loading onboarding state from AsyncStorage...');
      const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      console.log('🔵 [useOnboarding] Raw stored data:', stored ? stored.substring(0, 200) : 'null');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('🟢 [useOnboarding] Loaded state:', parsed);
        setState(parsed);
      } else {
        console.log('🟡 [useOnboarding] No stored onboarding state found - user needs to onboard');
      }
    } catch (error) {
      console.error('🔴 [useOnboarding] Failed to load onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveOnboardingState = useCallback(async (newState: OnboardingState) => {
    try {
      console.log('🔵 [useOnboarding] Saving onboarding state:', newState);
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newState));
      console.log('🟢 [useOnboarding] Successfully saved onboarding state');
      
      // Verify the save
      const verification = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (verification) {
        console.log('🟢 [useOnboarding] Verification: storage contains:', JSON.parse(verification));
      }
    } catch (error) {
      console.error('🔴 [useOnboarding] Failed to save onboarding state:', error);
    }
  }, []);

  useEffect(() => {
    loadOnboardingState();
  }, [loadOnboardingState]);

  const updateOnboardingState = useCallback(async (updates: Partial<OnboardingState>) => {
    try {
      const newState = { ...state, ...updates };
      setState(newState);
      await saveOnboardingState(newState);
    } catch (error) {
      console.error('Failed to update onboarding state:', error);
      // Still update local state even if save fails
      setState(prevState => ({ ...prevState, ...updates }));
    }
  }, [state, saveOnboardingState]);

  const completeWelcome = useCallback(async () => {
    await updateOnboardingState({ hasSeenWelcome: true, currentStep: 1 });
  }, [updateOnboardingState]);

  const setUserName = useCallback(async (name: string) => {
    await updateOnboardingState({ userName: name });
  }, [updateOnboardingState]);

  const completeBirthDateSetup = useCallback(async () => {
    await updateOnboardingState({ hasSetBirthDate: true, currentStep: 2 });
  }, [updateOnboardingState]);

  const completeTrialOffer = useCallback(async () => {
    await updateOnboardingState({ hasSeenTrialOffer: true, currentStep: 3 });
  }, [updateOnboardingState]);

  const completeOnboarding = useCallback(async () => {
    await updateOnboardingState({ 
      hasCompletedOnboarding: true, 
      currentStep: 4 
    });
  }, [updateOnboardingState]);

  const resetOnboarding = useCallback(async () => {
    setState(initialState);
    await saveOnboardingState(initialState);
  }, [saveOnboardingState]);

  return useMemo(() => ({
    ...state,
    isLoading,
    completeWelcome,
    setUserName,
    completeBirthDateSetup,
    completeTrialOffer,
    completeOnboarding,
    resetOnboarding,
    updateOnboardingState,
  }), [
    state,
    isLoading,
    completeWelcome,
    setUserName,
    completeBirthDateSetup,
    completeTrialOffer,
    completeOnboarding,
    resetOnboarding,
    updateOnboardingState,
  ]);
});