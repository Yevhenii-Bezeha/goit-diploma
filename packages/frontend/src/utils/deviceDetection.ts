/**
 * Detects if the current device is a mobile device based on user agent
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Attempts to detect if Spotify app is likely installed
 * Note: There's no 100% reliable way to detect app installation from the browser
 */
// export const checkSpotifyAppAvailability = (): Promise<boolean> => {
//   return new Promise((resolve) => {
//     // Default timeout after which we assume the app isn't installed
//     const timeout = setTimeout(() => {
//       resolve(false);
//     }, 500);

//     // Try to open a spotify: URI in an iframe
//     const iframe = document.createElement('iframe');
//     iframe.style.display = 'none';
//     iframe.src = 'spotify:';

//     iframe.onload = () => {
//       clearTimeout(timeout);
//       resolve(true);
//     };

//     iframe.onerror = () => {
//       clearTimeout(timeout);
//       resolve(false);
//     };

//     document.body.appendChild(iframe);
//     setTimeout(() => {
//       document.body.removeChild(iframe);
//     }, 600);
//   });
// };
