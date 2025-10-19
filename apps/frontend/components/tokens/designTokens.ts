// Border radius
export const radius = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
};

// Shadows
export const shadow = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

// Transitions
export const transition = {
  base: "transition-all duration-150 ease-in-out",
  fast: "transition-all duration-100 ease-in",
  slow: "transition-all duration-300 ease-out",
};

// Typography
export const typography = {
  sm: "text-sm leading-5",
  md: "text-base leading-6",
  lg: "text-lg leading-7",
  xl: "text-xl leading-8",
  heading1: "text-2xl font-bold leading-9",
  heading2: "text-xl font-semibold leading-8",
  heading3: "text-lg font-semibold leading-7",
  body: "text-base leading-6",
  label: "text-sm font-medium leading-5",
};

// Light and dark themes (future-proof)
export const theme = {
  light: {
    colors: {
      // Buttons / Surfaces
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
      outline: "border border-gray-300 text-gray-800 hover:bg-gray-50",
      ghost: "bg-transparent hover:bg-gray-50 text-gray-800",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      link: "text-blue-600 underline hover:text-blue-700",

      // Layout
      background: "bg-white",
      surface: "bg-gray-50",

      // Text
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-700",

      // Borders
      border: "border-gray-300",
      mutedBorder: "border-gray-200",
      errorBorder: "border-red-500",
      focusBorder: "border-blue-500",

      // State / Effects
      disabledOpacity: "opacity-50 cursor-not-allowed",
      focusRing: "ring-2 ring-blue-500 ring-offset-1",

      // Badges
      neutralBadge: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      successBadge: "bg-green-100 text-green-800 hover:bg-green-200",
      warningBadge: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      dangerBadge: "bg-red-100 text-red-800 hover:bg-red-200",
    },

    input: {
      base: "bg-white border border-gray-300 placeholder-gray-400 text-gray-900",
      hover: "hover:border-gray-400",
      focus:
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-0",
      error: "border-red-500 focus:ring-red-200",
      disabled: "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
      filled: "bg-gray-50 border-gray-200",
    },

    radius,
    shadow,
    transition,
    typography,
  },

  dark: {
    // unchanged for now
    colors: {
      primary: "bg-blue-500 hover:bg-blue-600 text-white",
      secondary: "bg-gray-700 hover:bg-gray-600 text-white",
      outline: "border border-white text-white hover:bg-gray-700",
      ghost: "bg-transparent text-white hover:bg-gray-600",
      danger: "bg-red-500 hover:bg-red-600 text-white",
      link: "text-blue-400 underline hover:text-blue-500",
      border: "border-gray-600",
      errorBorder: "border-red-400",
      disabledOpacity: "opacity-50 cursor-not-allowed",
      background: "bg-gray-900",
      surface: "bg-gray-800",
      textPrimary: "text-white",
      textSecondary: "text-gray-300",
      neutralBadge: "bg-gray-700 text-gray-200 hover:bg-gray-600",
      successBadge: "bg-green-800 text-green-100 hover:bg-green-700",
      warningBadge: "bg-yellow-800 text-yellow-100 hover:bg-yellow-700",
      dangerBadge: "bg-red-800 text-red-100 hover:bg-red-700",
    },
    radius,
    shadow,
    transition,
    typography,
  },
};

export type ThemeType = keyof typeof theme;
