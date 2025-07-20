/**
 * Converts milliseconds to a human-readable time format
 * This function matches the backend's msToTime function exactly
 *
 * @param duration Duration in milliseconds
 * @returns Formatted time string (e.g., "3m 45s", "1h 30m", "45s")
 */
export const convertMilliseconds = (duration: number) => {
  if (!duration || isNaN(duration) || duration < 0) {
    return '0m';
  }

  const roundedDuration = Math.round(duration / 1000) * 1000;

  const totalSeconds = Math.floor(roundedDuration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

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


export const msToTime = convertMilliseconds;
