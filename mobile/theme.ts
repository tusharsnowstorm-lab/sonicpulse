// Values copied verbatim from src/app/globals.css on the website — not reinvented.
export const theme = {
  void: '#050508',
  surface: '#0D0D14',
  elevated: '#16161F',
  primary: '#F0F0F8',
  muted: '#6B6B7E',
  mutedDim: '#4C4C5C',
  border: '#1E1E2E',
  accent: '#FF3FC2',
  magentaSoft: 'rgba(255, 63, 194, 0.14)',
  good: '#3ED598',
} as const;

// Clique member colors — six hues chosen to sit clear of the brand accent
// and the "good" status color, so a friend's arrow on the radar never
// reads as a system color. Assigned to members in join order; cycles past six.
export const cliquePalette = [
  '#FF6B5B', // coral
  '#FFB648', // amber
  '#4DDDC9', // seafoam
  '#3DC7F0', // sky
  '#7C93FF', // periwinkle
  '#B98BFF', // violet
] as const;

export const fonts = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semiBold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
  black: 'Montserrat-Black',
} as const;
