export const formatPlayedAt = (playedAt: string): string => {
  if (!playedAt) return '';

  const playedDate = new Date(playedAt);
  const now = new Date();

  // Check if it's today
  if (playedDate.toDateString() === now.toDateString()) {
    const hoursDiff = Math.floor((now.getTime() - playedDate.getTime()) / (1000 * 60 * 60));

    if (hoursDiff === 0) {
      const minutesDiff = Math.floor((now.getTime() - playedDate.getTime()) / (1000 * 60));
      return `${minutesDiff} ${minutesDiff === 1 ? 'minute' : 'minutes'} ago`;
    }

    return `${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'} ago`;
  }

  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (playedDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Check if it's within the last week
  const daysDiff = Math.floor((now.getTime() - playedDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    return `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} ago`;
  }

  // Otherwise, return the date
  return playedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
