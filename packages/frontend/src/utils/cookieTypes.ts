// Define cookie types enum
export enum CookieType {
  ESSENTIAL = 'essential',
  PERFORMANCE = 'performance',
  ANALYTICS = 'analytics',
  ADVERTISING = 'advertising',
  SOCIAL = 'social',
  UNCLASSIFIED = 'unclassified',
}

// Cookie preferences type
export interface CookiePreferences {
  [CookieType.ESSENTIAL]: boolean;
  [CookieType.PERFORMANCE]: boolean;
  [CookieType.ANALYTICS]: boolean;
  [CookieType.ADVERTISING]: boolean;
  [CookieType.SOCIAL]: boolean;
  [CookieType.UNCLASSIFIED]: boolean;
}

// Helper function to get default preferences
export const getDefaultPreferences = (): CookiePreferences => {
  return {
    [CookieType.ESSENTIAL]: true,
    [CookieType.PERFORMANCE]: false,
    [CookieType.ANALYTICS]: false,
    [CookieType.ADVERTISING]: false,
    [CookieType.SOCIAL]: false,
    [CookieType.UNCLASSIFIED]: false,
  };
};

// Helper function to check if cookie preferences have been set
export const hasSetCookiePreferences = (): boolean => {
  const preferences = localStorage.getItem('mypie_cookie_preferences');
  return !!preferences;
};
