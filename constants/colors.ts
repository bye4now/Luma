export const colors = {
  // Primary colors from your new palette
  text: '#e7f4df',
  background: '#0c1508',
  primary: '#b8dda0',
  secondary: '#2b7879',
  accent: '#b8dda0',
  white: '#e7f4df',
  yellow: '#FFD700',
  
  // Semantic color mappings
  surface: '#1a2414', // Slightly lighter than background
  textSecondary: '#b8dda0', // Primary green for secondary text
  
  // UI element colors
  button: {
    primary: '#b8dda0',
    secondary: '#2b7879',
    accent: '#5e90c6',
    text: '#0c1508',
  },
  
  card: {
    background: '#1a2414',
    border: '#2b7879',
    text: '#e7f4df',
  },
  
  // Status colors using your palette
  success: '#b8dda0',
  warning: '#5e90c6',
  error: '#2b7879',
  
  // Opacity variants
  overlay: 'rgba(12, 21, 8, 0.8)',
  cardOverlay: 'rgba(26, 36, 20, 0.95)',
  
  // Gradient combinations
  gradients: {
    primary: ['#b8dda0', '#2b7879'], // Green to Teal
    accent: ['#2b7879', '#5e90c6'], // Teal to Blue
    dark: ['#0c1508', '#1a2414'], // Dark background gradient
  },
} as const;

export type ColorKey = keyof typeof colors;