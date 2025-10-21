import { palette } from './palette';

/**
 * Semantic Design Tokens
 * Maps raw palette colors to meaningful, purpose-driven names
 */
export const tokens = {
  // ============================================
  // COLORS - All semantic color mappings
  // ============================================
  colors: {
    // Page & Layout
    background: palette.neutral[50],        // Main page background
    surface: '#FFFFFF',                     // Cards, modals, panels
    surfaceHover: palette.neutral[50],      // Hoverable surface
    surfaceSubtle: palette.neutral[100],    // Secondary surfaces (sidebar, etc.)

    // Text
    textPrimary: palette.neutral[900],      // Headings, primary content
    textSecondary: palette.neutral[600],    // Labels, secondary text
    textTertiary: palette.neutral[400],     // Placeholders, disabled text
    textInverse: '#FFFFFF',                 // Text on dark backgrounds

    // Borders
    border: palette.neutral[200],           // Default borders
    borderSubtle: palette.neutral[100],     // Very subtle borders/dividers
    borderHover: palette.neutral[300],      // Hover state borders (using 200 + darkening)
    borderFocus: palette.primary[600],      // Focused input borders

    // Interactive - Primary
    primary: palette.primary[600],
    primaryHover: palette.primary[700],
    primaryLight: palette.primary[50],      // Light primary bg (badges, etc.)
    primaryLightHover: palette.primary[100],

    // Interactive - Secondary
    secondary: palette.neutral[100],
    secondaryHover: palette.neutral[200],
    secondaryText: palette.neutral[700],

    // States - Success
    success: palette.success[600],
    successHover: palette.success[700],
    successLight: palette.success[50],
    successLightHover: palette.success[100],
    successText: palette.success[700],

    // States - Warning
    warning: palette.warning[600],
    warningHover: palette.warning[700],
    warningLight: palette.warning[50],
    warningLightHover: palette.warning[100],
    warningText: palette.warning[700],

    // States - Danger
    danger: palette.danger[600],
    dangerHover: palette.danger[700],
    dangerLight: palette.danger[50],
    dangerLightHover: palette.danger[100],
    dangerText: palette.danger[700],

    // States - Info
    info: palette.info[600],
    infoHover: palette.info[700],
    infoLight: palette.info[50],
    infoLightHover: palette.info[100],
    infoText: palette.info[700],

    // Special States
    disabled: palette.neutral[100],
    disabledText: palette.neutral[400],
    overlay: 'rgba(0, 0, 0, 0.5)',          // Modal overlays
  },
};

// ============================================
// TYPE EXPORTS (for TypeScript autocomplete)
// ============================================
export type ColorToken = keyof typeof tokens.colors;