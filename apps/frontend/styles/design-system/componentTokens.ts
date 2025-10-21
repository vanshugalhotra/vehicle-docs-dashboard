/**
 * Pre-composed class strings for common component patterns
 * These reference the CSS variables from global.css
 */

export const componentTokens = {
  // ============================================
  // BUTTONS
  // ============================================
  button: {
    primary:
      "bg-primary hover:bg-primary-hover text-text-inverse transition-all duration-200",
    secondary:
      "bg-surface hover:bg-sidebar-hover text-text-primary hover:text-surface transition-all duration-200 border-1 border-sidebar-hover",
    outline:
      "border border-border hover:bg-surface-hover text-text-primary transition-all duration-200",
    ghost:
      "hover:bg-surface-hover text-text-primary transition-all duration-200",
    danger:
      "bg-danger hover:bg-danger-hover text-text-inverse transition-all duration-200",
    link: "text-primary hover:text-primary-hover underline decoration-from-font transition-all duration-200",
    disabled: "opacity-50 cursor-not-allowed", // Reusable for any disabled state
    sizes: {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-5 py-3 text-lg",
    },
  },

  // ============================================
  // INPUTS
  // ============================================
  input: {
    base: "bg-surface border border-border text-text-primary placeholder:text-text-tertiary rounded-lg px-3 py-2 transition-all duration-150",
    focus:
      "focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-light",
    error: "border-danger focus:border-danger focus:ring-danger-light",
    disabled:
      "bg-disabled text-disabled-text cursor-not-allowed border-border-subtle",
    icon: "inset-y-0 flex items-center text-text-tertiary",
  },

  // ============================================
  // CARDS
  // ============================================
  card: {
    base: "bg-surface border border-border rounded-lg shadow-sm p-3",
    hover:
      "hover:border-border-hover hover:shadow-md transition-all duration-150",
    interactive:
      "bg-surface border border-border rounded-lg shadow-sm hover:border-border-hover hover:shadow-md cursor-pointer transition-all duration-150",
    header: "flex justify-between items-start gap-2 px-4 pt-4",
    titleSection: "flex flex-col",
    content: "p-4 pt-2",
  },

  // ============================================
  // BADGES
  // ============================================
  badge: {
    neutral:
      "bg-secondary hover:bg-secondary-hover text-secondary-text px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-150 cursor-default",
    success:
      "bg-success-light hover:bg-success-light-hover text-success-text px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-150 cursor-default",
    warning:
      "bg-warning-light hover:bg-warning-light-hover text-warning-text px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-150 cursor-default",
    danger:
      "bg-danger-light hover:bg-danger-light-hover text-danger-text px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-150 cursor-default",
    info: "bg-info-light hover:bg-info-light-hover text-info-text px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-all duration-150 cursor-default",
  },

  // ============================================
  // TEXT
  // ============================================
  text: {
    // Pure sizes (no colors—pair with variants)
    sizes: {
      caption: "text-xs font-normal",
      body: "text-base font-normal",
      label: "text-sm font-medium",
      heading3: "text-lg font-semibold",
      heading2: "text-xl font-semibold",
      heading1: "text-2xl font-bold",
    },
    // Convenience full classes (semantic defaults; overridable)
    bodySecondary: "text-base text-text-secondary font-normal",
    // Color-only variants (apply after size)
    primary: "text-text-primary",
    secondary: "text-text-secondary",
    muted: "text-text-tertiary",
    error: "text-danger-text",
    success: "text-success-text",
  },

  dialog: {
    overlay: "fixed inset-0 bg-overlay",
    panel:
      "inline-block w-full bg-surface p-6 text-left align-middle rounded-lg shadow-xl transition-all duration-200",
    header: "mb-4",
    content: "mb-4",
    footer: "mt-4 flex justify-end gap-2",
    sizes: {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
    },
  },

  select: {
    button:
      "w-full flex items-center justify-between bg-surface px-3 py-2 border border-border text-left focus:outline-none focus:ring-2 focus:ring-primary-light rounded-md transition-all duration-150",
    placeholder: "text-text-tertiary",
    icon: "ml-2 h-4 w-4 text-text-tertiary",
    options:
      "absolute mt-1 w-full bg-surface border border-border rounded-md shadow-xl max-h-60 overflow-auto z-10 divide-y divide-border-subtle",
    option: "cursor-pointer px-3 py-2 transition-all duration-150",
    optionActive: "bg-primary-light",
    optionSelected: "font-semibold text-primary",
    addNew: "px-3 py-2 text-primary cursor-pointer hover:bg-primary-light",
  },

  sheet: {
    overlay: "absolute inset-0 bg-overlay",
    container: "fixed inset-y-0 right-0 flex max-w-full pl-4",
    panel:
      "h-full bg-surface flex flex-col rounded-l-lg shadow-xl transition-all duration-300",
    header:
      "px-6 py-4 border-b border-border flex justify-between items-center",
    close:
      "text-text-tertiary hover:text-text-secondary p-1 rounded hover:bg-surface-subtle transition-all duration-150",
    content: "p-6 overflow-auto flex-1",
    sizes: {
      sm: "w-80",
      md: "w-96",
      lg: "w-[500px]",
    },
  },

  table: {
    header:
      "flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2",
    content: "overflow-auto",
    toolbar: "flex-shrink-0",
  },

  tooltip: {
    panel:
      "pointer-events-none absolute z-50 whitespace-nowrap px-2 py-1 text-center rounded-sm text-caption bg-[hsl(0_0%_10%)] text-text-inverse opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:scale-100 group-focus-within:scale-100",
  },

  // ============================================
  // LAYOUT
  // ============================================
  layout: {
    page: "bg-background min-h-screen",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-6 space-y-6",
    app: "flex h-screen w-full overflow-hidden bg-background",
    main: "flex flex-col flex-1 overflow-auto transition-all duration-150",
    // Page-specific
    pageHeader:
      "flex items-center justify-between px-6 py-4 bg-surface shadow-sm rounded-md border-b border-border transition-all duration-150",
    pageHeaderActions: "flex gap-2",
    pageContent: "flex-1 px-6 py-4 rounded-md shadow-sm",
  },

  topbar: {
    base: "sticky top-0 z-40 flex items-center justify-between h-17 w-full px-4 sm:px-6 bg-surface border-b border-border transition-all duration-150 flex-shrink-0",
    titleSection: "flex items-center gap-3",
    actionsSection: "flex items-center gap-2",
    shadow: "shadow-xs",
  },

  sidebar: {
    base: "h-screen flex flex-col bg-surface border-r border-border shadow-sm transition-all duration-300 ease-out thin-scrollbar", // Changed: ease-out for smoother collapse
    collapsed: "w-16",
    expanded: "w-64",
    header:
      "flex items-center justify-between p-4 border-b border-border-subtle transition-all duration-150",
    toggle:
      "flex items-center justify-center p-2 rounded-md hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary-light/20 transition-all duration-150",
    brand:
      "flex items-center gap-3 text-heading3 text-text-primary underline decoration-primary/30 decoration-2 underline-offset-4",
    nav: "flex-1 overflow-y-auto mt-4 px-2 thin-scrollbar scrollbar-thumb-border scrollbar-track-surface-subtle",
    item: "flex items-center gap-3 w-full px-3 py-3 text-left rounded-md transition-all duration-200 cursor-pointer",
    itemActive:
      "border-l-3 border-primary/70 text-primary font-semibold bg-primary/8",
    itemHover: "hover:bg-sidebar-hover/15 hover:text-text-primary",
    icon: "text-text-secondary flex-shrink-0 group-hover:text-primary/80", 
    itemOpen: "bg-surface-subtle/50 border-l-2 border-primary/30", 
    label: "text-body font-medium truncate", 
    chevron:
      "h-4 w-4 text-text-tertiary transition-transform duration-200 ml-auto", 
    group:
      "flex items-center justify-between w-full px-3 py-2.5 text-left rounded-md transition-all duration-200 hover:bg-surface-subtle", 
    groupLabel:
      "font-semibold text-text-primary flex items-center gap-2 truncate", 
    childrenIndent:
      "ml-8 mt-1 flex flex-col gap-0.5 pl-2", 
    divider: "my-2 h-px bg-border-subtle",
    // Footer
    footer: "p-4 pt-2 border-t border-border-subtle mt-auto",
    footerVersion:
      "inline-flex items-center gap-1 text-caption text-text-tertiary", 
  },
};

export type ComponentToken = typeof componentTokens;
