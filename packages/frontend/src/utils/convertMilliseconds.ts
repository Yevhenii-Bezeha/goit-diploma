/**
 * Converts milliseconds to a human-readable time format
 * This function matches the backend's msToTime function exactly
 *
 * @param duration Duration in milliseconds
 * @returns Formatted time string (e.g., "3m 45s", "1h 30m", "45s")
 */
export const convertMilliseconds = (duration: number) => {
  // Handle invalid input
  if (!duration || isNaN(duration) || duration < 0) {
    return '0m';
  }

  // Round to nearest 1000ms (1 second) to handle floating point values
  const roundedDuration = Math.round(duration / 1000) * 1000;

  // Calculate precise minutes and seconds
  const totalSeconds = Math.floor(roundedDuration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format based on the duration scale
  let result;
  if (totalSeconds < 60) {
    result = `${totalSeconds}s`;
  } else if (hours > 0) {
    result = `${hours}h ${minutes}m`;
  } else if (seconds > 0) {
    result = `${minutes}m ${seconds}s`;
  } else {
    result = `${minutes}m`;
  }

  return result;
};

/**
 * Alias for convertMilliseconds to match backend naming
 * Use this for consistency with backend msToTime function
 */
export const msToTime = convertMilliseconds;
