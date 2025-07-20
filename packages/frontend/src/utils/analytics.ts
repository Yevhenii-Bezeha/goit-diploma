/**
 * Standard parameter names to ensure consistency across events
 */
export const EventParams = {
  SOURCE: 'source',
  USER_TYPE: 'user_type',
};

/**
 * Specific navigation events for better analytics tracking
 */
export const NavigationEvents = {
  NAVIGATION_TO_SPOTIFY_ARTIST: 'navigation_to_spotify_artist',
  NAVIGATION_TO_SPOTIFY_TRACK: 'navigation_to_spotify_track',
  NAVIGATION_TO_TWITTER: 'navigation_to_twitter',
  NAVIGATION_TO_FACEBOOK: 'navigation_to_facebook',
  NAVIGATION_TO_LINKEDIN: 'navigation_to_linkedin',
  NAVIGATION_TO_INSTAGRAM: 'navigation_to_instagram',
  NAVIGATION_TO_CREATE_PIE: 'navigation_to_create_pie',
} as const;

// Create a type that includes all the possible navigation event values
export type NavigationEventType = (typeof NavigationEvents)[keyof typeof NavigationEvents];

/**
 * Specific button click events
 */
export const ButtonClickEvents = {
  // Search actions
  SEARCH_ARTISTS: 'search_artists_button_click',
  LOAD_MORE_ARTISTS: 'load_more_artists_button_click',
  LOAD_MORE_TRACKS: 'load_more_tracks_button_click',

  // Authentication tabs
  OFFICE_INVITATION_SWITCH_TO_LOGIN_TAB: 'office_invitation_switch_to_login_tab_click',
  OFFICE_INVITATION_SWITCH_TO_REGISTER_TAB: 'office_invitation_switch_to_register_tab_click',

  // Contact
  CONTACT_EMAIL_CLICK: 'contact_email_click',
  CONTACT_SUPPORT_CLICK: 'contact_support_click',

  // Media
  YOUTUBE_VIDEO_CLICK: 'youtube_video_click',

  // Artist claim
  SELECT_ARTIST_IN_CLAIM_MODAL: 'select_artist_in_claim_modal',
  SELECT_VERIFICATION_METHOD: 'select_verification_method',

  // Navigation - Mobile menu
  OPEN_MOBILE_MENU: 'open_mobile_menu',
  MOBILE_MENU_NAVIGATE: 'mobile_menu_navigate',
  MOBILE_MENU_VIEW_PROFILE: 'mobile_menu_view_profile',

  // Pie settings
  OPEN_PIE_SETTINGS: 'open_pie_settings',
  TOGGLE_REWARD_TOP_ONLY: 'toggle_reward_top_only',
  TOGGLE_PRIORITIZE: 'toggle_prioritize',
  TOGGLE_EXCLUDE_NON_ACTIVE: 'toggle_exclude_non_active',

  // Share functionality
  COPY_SHARE_LINK: 'copy_share_link',
  SHARE_TO_FACEBOOK: 'share_to_facebook',
  SHARE_TO_TWITTER: 'share_to_twitter',
  SHARE_TO_LINKEDIN: 'share_to_linkedin',
  SHARE_TO_REDDIT: 'share_to_reddit',

  // Artist management
  VIEW_CLAIMED_ARTISTS: 'view_claimed_artists',
  VIEW_PENDING_CLAIMS: 'view_pending_claims',
  CLAIM_ARTIST: 'claim_artist',

  // Financial
  SETUP_STRIPE: 'setup_stripe',
  VIEW_STRIPE_TRANSACTIONS: 'view_stripe_transactions',
  VIEW_STRIPE_DASHBOARD: 'view_stripe_dashboard',

  // Team management
  ADD_TEAM_MEMBER: 'add_team_member',
  REMOVE_TEAM_MEMBER: 'remove_team_member',
  RESEND_INVITATION: 'resend_invitation',

  // Pie interface tabs
  VIEW_PIE_INCLUDED_ARTISTS: 'view_pie_included_artists',
  VIEW_PIE_EXCLUDED_ARTISTS: 'view_pie_excluded_artists',
} as const;

// Create a type that includes all the possible button click event values
export type ButtonClickEventType = (typeof ButtonClickEvents)[keyof typeof ButtonClickEvents];

/**
 * Standard business event types for analytics tracking
 */
export const BusinessEvents = {
  // User account events
  ACCOUNT_ACTION: 'account_action', // Already existing
  ACCOUNT_CREATED: 'account_created',
  ACCOUNT_DELETED: 'account_deleted',
  ACCOUNT_UPDATED: 'account_updated',

  // Authentication events - More specific login methods
  LOGIN_EMAIL: 'login_email',
  LOGIN_GOOGLE: 'login_google',
  LOGIN_SPOTIFY: 'login_spotify',
  LOGIN_TWITTER: 'login_twitter',
  LOGIN_INSTAGRAM: 'login_instagram',
  LOGIN_FACEBOOK: 'login_facebook',

  // Registration events - More specific registration methods
  REGISTER_EMAIL: 'register_email',
  REGISTER_GOOGLE: 'register_google',
  REGISTER_SPOTIFY: 'register_spotify',
  REGISTER_TWITTER: 'register_twitter',
  REGISTER_INSTAGRAM: 'register_instagram',
  REGISTER_FACEBOOK: 'register_facebook',

  LOGOUT: 'logout',
  PASSWORD_RESET: 'password_reset',
  DELETE_ACCOUNT: 'delete_account',
  ACCEPT_OFFICE_INVITATION: 'accept_office_invitation',

  // Subscription events
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_UPDATED: 'subscription_updated',

  // Artist management events
  ARTIST_CLAIMED: 'artist_claimed',
  ARTIST_CLAIM_COMPLETED: 'artist_claim_completed',

  // Office management events
  OFFICE_CREATED: 'office_created',
  OFFICE_UPDATED: 'office_updated',
  OFFICE_DELETED: 'office_deleted',
  TEAM_MEMBER_ADDED: 'team_member_added',
  TEAM_MEMBER_REMOVED: 'team_member_removed',

  // Financial events
  PAYOUT_CREATED: 'payout_created',
  STRIPE_ACCOUNT_CREATED: 'stripe_account_created',
  STRIPE_ACCOUNT_UPDATED: 'stripe_account_updated',

  // Pie management events
  REFRESH_USER_TRACKS: 'refresh_user_tracks',
  UPDATE_PIE_SETTINGS: 'update_pie_settings',
  PIE_CREATED: 'pie_created',
  ARTIST_ADDED_TO_PIE: 'artist_added_to_pie',
  ARTIST_REMOVED_FROM_PIE: 'artist_removed_from_pie',

  SELECT_TOP_ARTISTS_CHANGE: 'select_top_artists_change',
  UPDATE_POPULARITY_SCORE: 'update_popularity_score',
  PIE_AMOUNT_CHANGED: 'pie_amount_changed',
  PIE_CREATE_CLICK: 'pie_create_click',

  // Platform connection events
  SPOTIFY_CONNECTED: 'spotify_connected',
  SPOTIFY_DISCONNECTED: 'spotify_disconnected',
  SOCIAL_ACCOUNT_CONNECTED: 'social_account_connected',
} as const;

// Create a type that includes all the possible business event values
export type BusinessEventType = (typeof BusinessEvents)[keyof typeof BusinessEvents];

/**
 * Track a business event like signup, payment, etc.
 */
export const trackBusinessEvent = (eventName: BusinessEventType, additionalParams: Record<string, any> = {}) => {
  trackEvent(eventName, {
    ...additionalParams,
  });
};

/**
 * Enhanced button click tracker with user type
 */
export const trackButtonClick = (
  buttonEventName: ButtonClickEventType,
  source: string,
  additionalParams: Record<string, any> = {}
) => {
  const params: Record<string, any> = {
    [EventParams.SOURCE]: source,
    ...additionalParams,
  };

  trackEvent(buttonEventName, params);
};

/**
 * Track navigation between pages or sections with specific event names
 */
export const trackNavigation = (
  navigationEventName: NavigationEventType,
  source: string,
  additionalParams: Record<string, any> = {}
) => {
  const params: Record<string, any> = {
    [EventParams.SOURCE]: source,
    ...additionalParams,
  };

  trackEvent(navigationEventName, params);
};

/**
 * Track a custom event in Umami
 * @param eventName The name of the event to track
 * @param eventParams Additional parameters for the event
 */
export const trackEvent = (eventName: string, eventParams: Record<string, any> = {}) => {
  const isProduction = window.location.hostname !== 'localhost';

  // Only track events in production
  if (isProduction && window.umami && typeof window.umami.track === 'function') {
    window.umami.track(eventName, eventParams);
  }
};

// Ensure TypeScript recognizes the umami property on the window object
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventParams?: Record<string, any>) => void;
    };
  }
}
