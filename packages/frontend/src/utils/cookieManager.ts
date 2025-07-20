import Cookies from 'js-cookie';
import { CookieType, CookiePreferences, getDefaultPreferences } from './cookieTypes';

// Cookie names used in the application
export enum CookieName {
  ACCESS_TOKEN_FAN = 'mypie_access_token_fan',
  ACCESS_TOKEN_ARTIST = 'mypie_access_token_artist',
  ACCESS_TOKEN_ADMIN = 'mypie_access_token_admin',
  SPOTIFY_AUTH = 'mypie_spotify_auth',
  COOKIE_PREFERENCES = 'mypie_cookie_preferences',
}

// Cookie preference cookie name
const COOKIE_PREFERENCES_KEY = 'mypie_cookie_preferences';

// Map cookies to their types
const cookieTypeMap: Record<string, CookieType> = {
  [CookieName.ACCESS_TOKEN_FAN]: CookieType.ESSENTIAL,
  [CookieName.ACCESS_TOKEN_ARTIST]: CookieType.ESSENTIAL,
  [CookieName.ACCESS_TOKEN_ADMIN]: CookieType.ESSENTIAL,
  [CookieName.SPOTIFY_AUTH]: CookieType.PERFORMANCE,
  [CookieName.COOKIE_PREFERENCES]: CookieType.ESSENTIAL,
};

/**
 * Check if a specific cookie type is allowed based on user preferences
 * @param type Cookie type to check
 * @returns boolean indicating if the cookie type is allowed
 */
export const isCookieTypeAllowed = (type: CookieType): boolean => {
  // Analytics is always allowed since we use Umami which is cookie-free
  if (type === CookieType.ANALYTICS) {
    return true;
  }

  const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!preferences) {
    // If no preferences are set, default to allowing only essential cookies
    return type === CookieType.ESSENTIAL;
  }

  try {
    const parsedPreferences = JSON.parse(preferences);
    return parsedPreferences[type] || type === CookieType.ESSENTIAL; // Always allow essential cookies
  } catch (e) {
    console.error('Error parsing cookie preferences', e);
    return type === CookieType.ESSENTIAL; // Always allow essential cookies
  }
};

/**
 * Set a cookie if the user has allowed the cookie type
 * @param name Cookie name
 * @param value Cookie value
 * @param options Cookie options
 * @returns boolean indicating if the cookie was set
 */
export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes): boolean => {
  const cookieType = cookieTypeMap[name] || CookieType.UNCLASSIFIED;

  // Check if this cookie type is allowed
  if (isCookieTypeAllowed(cookieType)) {
    Cookies.set(name, value, options);
    return true;
  }

  return false;
};

/**
 * Get a cookie if the user has allowed the cookie type
 * @param name Cookie name
 * @returns Cookie value or undefined
 */
export const getCookie = (name: string): string | undefined => {
  const cookieType = cookieTypeMap[name] || CookieType.UNCLASSIFIED;

  // Check if this cookie type is allowed
  if (isCookieTypeAllowed(cookieType)) {
    return Cookies.get(name);
  }

  return undefined;
};

/**
 * Remove a cookie
 * @param name Cookie name
 * @param options Cookie options
 */
export const removeCookie = (name: string, options?: Cookies.CookieAttributes): void => {
  Cookies.remove(name, options);
};

/**
 * Register a new cookie with its type
 * @param name Cookie name
 * @param type Cookie type
 */
export const registerCookie = (name: string, type: CookieType): void => {
  cookieTypeMap[name] = type;
};

/**
 * Apply cookie preferences to existing cookies
 * This should be called when preferences change to apply new settings to existing cookies
 */
export const applyCookiePreferences = (): void => {
  // Get all cookies
  const allCookies = Cookies.get();

  // For each cookie, check if it should be kept or removed based on preferences
  Object.keys(allCookies).forEach((name) => {
    const cookieType = cookieTypeMap[name] || CookieType.UNCLASSIFIED;

    // If cookie type is not allowed, remove it
    if (!isCookieTypeAllowed(cookieType)) {
      Cookies.remove(name);
    } else {
      // For essential cookies, make sure they have a long expiration
      if (cookieType === CookieType.ESSENTIAL) {
        const value = allCookies[name];
        if (value) {
          Cookies.set(name, value, { expires: 30 }); // 30 days
        }
      }
    }
  });
};

/**
 * Load saved cookie preferences
 * @returns Cookie preferences or default preferences if none are saved
 */
export const loadCookiePreferences = (): CookiePreferences => {
  const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (savedPreferences) {
    try {
      const parsed = JSON.parse(savedPreferences);
      // Ensure essential cookies and analytics are always enabled
      // Analytics is always enabled because we use Umami which is cookie-free
      return { ...parsed, [CookieType.ESSENTIAL]: true, [CookieType.ANALYTICS]: true };
    } catch (e) {
      console.error('Error parsing cookie preferences', e);
    }
  }

  return getDefaultPreferences();
};

/**
 * Check if we're in a production environment
 */
export const isProduction = (): boolean => {
  return window.location.hostname !== 'localhost';
};

/**
 * Save cookie preferences
 * @param preferences Cookie preferences
 */
export const saveCookiePreferences = (preferences: CookiePreferences): void => {
  // Ensure essential cookies and analytics are always enabled
  // Analytics is always enabled because we use Umami which is cookie-free
  const finalPreferences = {
    ...preferences,
    [CookieType.ESSENTIAL]: true,
    [CookieType.ANALYTICS]: true,
  };

  // Save to localStorage
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(finalPreferences));

  // Apply preferences to existing cookies
  applyCookiePreferences();
};

/**
 * Initialize cookie manager
 * This should be called when the application starts
 */
export const initCookieManager = (): void => {
  // Apply cookie preferences to existing cookies
  applyCookiePreferences();
};
