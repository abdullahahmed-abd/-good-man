/**
 * Date and Time utilities for Insaan
 */

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function formatHumanDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'golden_hour';
  if (hour >= 20 && hour < 23) return 'evening';
  return 'night';
}

export function getGreeting(language = 'en') {
  const time = getTimeOfDay();
  if (language === 'hi' || language === 'hinglish') {
    if (time === 'dawn' || time === 'morning') return 'Shubh Prabhat';
    if (time === 'afternoon') return 'Shubh Dopahar';
    if (time === 'golden_hour') return 'Shubh Sandhya';
    return 'Shubh Ratri';
  }

  if (time === 'dawn') return 'Peaceful Dawn';
  if (time === 'morning') return 'Good Morning';
  if (time === 'afternoon') return 'Good Afternoon';
  if (time === 'golden_hour') return 'Golden Hour';
  if (time === 'evening') return 'Good Evening';
  return 'Restful Night';
}

/**
 * Computes consecutive days streak from an array of date strings (YYYY-MM-DD)
 */
export function calculateStreak(dateStrings = []) {
  if (!dateStrings || dateStrings.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(dateStrings)).sort().reverse();
  const today = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Must have completed today or yesterday to have an active streak
  if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(uniqueDates.includes(today) ? today : yesterday);

  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.includes(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Generates an array of past N days for GitHub-style heatmap
 */
export function generatePastDays(numDays = 70) {
  const days = [];
  const now = new Date();
  
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

