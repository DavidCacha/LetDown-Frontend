export const colors = {
  background: '#FDF7FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F1FB',
  surfaceLavender: '#F1ECF5',
  surfaceGreen: '#C7E7D6',
  surfaceGreenSoft: 'rgba(199,231,214,0.6)',
  surfacePurpleSoft: '#E8DDFF',

  primary: '#7868A6',
  primaryDark: '#5F508C',
  primaryText: '#FCF5FF',

  textPrimary: '#1C1B21',
  textSecondary: '#49454F',
  textSecondary80: 'rgba(73,69,79,0.8)',
  textSecondary50: 'rgba(73,69,79,0.5)',
  textGreen: '#4C695B',

  danger: '#92666C',
  dangerText: '#FFF6F6',
  dangerSoftText: '#774E54',

  border: '#DDD8E2',
  inputBg: '#F7F1FB',
  disabled: '#E6E0EA',
} as const;

export const typography = {
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const, letterSpacing: -0.6 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const, letterSpacing: 0.14 },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.24 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
};

export const shadow = {
  card: {
    shadowColor: '#7868A6',
    shadowOpacity: 0.09,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  button: {
    shadowColor: '#7868A6',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};
