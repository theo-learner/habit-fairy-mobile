// ============================================
// Headspace Kids 스타일 디자인 테마
// ============================================

export const THEME = {
  colors: {
    lavender: '#8E97C8',
    lavenderLight: '#B8C0E8',
    sageGreen: '#7DB89E',
    darkCircle: '#4A5568',
    coral: '#E8744F',
    white: '#FFFFFF',
    offWhite: '#F7F5FA',
    textPrimary: '#2D3436',
    textSecondary: '#636E72',
    textLight: '#B2BEC3',
    cardBg: 'rgba(255,255,255,0.95)',
    overlay: 'rgba(142,151,200,0.15)',
  },
  gradients: {
    main: ['#8E97C8', '#B8C0E8'] as const,
    hero: ['#8E97C8', '#A8B0D8', '#B8C0E8'] as const,
    card: ['#FFFFFF', '#F7F5FA'] as const,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    pill: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#8E97C8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    pill: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
  },
  font: {
    family: 'Jua',
  },
} as const;
