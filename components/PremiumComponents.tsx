import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown, 
  Check, 
  X,
  Cloud,
  Download,
  Infinity,
  BarChart3,
  Palette,
  Headphones
} from 'lucide-react-native';
import { usePremium } from '@/hooks/usePremium';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FeatureItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  description: string;
  isPremium?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon: Icon, title, description, isPremium = true }) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIcon, isPremium ? styles.premiumIcon : styles.freeIcon]}>
      <Icon size={20} color={isPremium ? '#B31B6F' : '#10b981'} />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
    <View style={styles.featureCheck}>
      <Check size={16} color="#10b981" />
    </View>
  </View>
);

export const PremiumModal: React.FC<PremiumModalProps> = ({ visible, onClose }) => {
  const { upgradeToPremium } = usePremium();

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium();
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  const premiumFeatures = [
    {
      icon: Cloud,
      title: 'Cloud Backup & Sync',
      description: 'Access your journal from any device with automatic sync',
    },
    {
      icon: Download,
      title: 'Export to PDF & Word',
      description: 'Download your entries in professional formats',
    },
    {
      icon: Infinity,
      title: 'Unlimited Entries',
      description: 'Write as much as you want, no daily limits',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your mood patterns and writing habits',
    },
    {
      icon: Palette,
      title: 'Custom Themes',
      description: 'Personalize your journal with beautiful themes',
    },
    {
      icon: Headphones,
      title: 'Priority Support',
      description: 'Get help when you need it with premium support',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#B31B6F', '#6C0E42']}
              style={styles.crownContainer}
            >
              <Crown size={40} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Unlock the full potential of your journaling experience
            </Text>
          </View>

          <View style={styles.featuresSection}>
            {premiumFeatures.map((feature, index) => (
              <FeatureItem
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </View>

          <View style={styles.pricingSection}>
            <View style={styles.priceCard}>
              <Text style={styles.priceAmount}>$4.99</Text>
              <Text style={styles.pricePeriod}>per month</Text>
              <Text style={styles.priceDescription}>
                Cancel anytime • 7-day free trial
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <LinearGradient
              colors={['#B31B6F', '#6C0E42']}
              style={styles.upgradeButtonGradient}
            >
              <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export const PremiumBadge: React.FC = () => {
  return (
    <View style={styles.badge}>
      <Crown size={12} color="#B31B6F" />
      <Text style={styles.badgeText}>PRO</Text>
    </View>
  );
};

export const PremiumFeatureBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPremium } = usePremium();
  
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.blockedFeature}>
      <View style={styles.blockedOverlay}>
        <Crown size={20} color="#FFD700" />
        <Text style={styles.blockedText}>Premium Feature</Text>
        <Text style={styles.blockedSubtext}>Upgrade to unlock</Text>
      </View>
      <View style={styles.blurredContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(179, 27, 111, 0.2)',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  premiumIcon: {
    backgroundColor: 'rgba(179, 27, 111, 0.1)',
  },
  freeIcon: {
    backgroundColor: '#d1fae5',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  featureCheck: {
    marginLeft: 12,
  },
  pricingSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  priceCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(179, 27, 111, 0.1)',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#B31B6F',
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  upgradeButton: {
    marginBottom: 16,
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(179, 27, 111, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B31B6F',
  },
  blockedFeature: {
    position: 'relative',
  },
  blockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 21, 8, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  blockedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  blockedSubtext: {
    fontSize: 10,
    color: 'rgba(255, 215, 0, 0.8)',
  },
  blurredContent: {
    opacity: 0.3,
  },
});