/**
 * Character Growth & Life Score Engine
 * Synthesizes health, habits, wisdom, finances, and virtues into a holistic index.
 */

export const TITLES_BY_LEVEL = [
  { level: 1, title: 'The Seeker', minXp: 0, icon: '🌱' },
  { level: 2, title: 'The Student of Virtue', minXp: 200, icon: '📖' },
  { level: 3, title: 'The Practicing Stoic', minXp: 600, icon: '🛡️' },
  { level: 4, title: 'The Disciplined Mind', minXp: 1200, icon: '⚡' },
  { level: 5, title: 'The Philosopher of Action', minXp: 2000, icon: '🦉' },
  { level: 6, title: 'The Master of Self', minXp: 3200, icon: '🏛️' },
  { level: 7, title: 'The Sage of Peace', minXp: 5000, icon: '👑' },
  { level: 8, title: 'The Complete Insaan', minXp: 8000, icon: '✨' }
];

export function getLevelInfo(totalXp = 0) {
  let currentTier = TITLES_BY_LEVEL[0];
  let nextTier = TITLES_BY_LEVEL[1];

  for (let i = TITLES_BY_LEVEL.length - 1; i >= 0; i--) {
    if (totalXp >= TITLES_BY_LEVEL[i].minXp) {
      currentTier = TITLES_BY_LEVEL[i];
      nextTier = TITLES_BY_LEVEL[i + 1] || null;
      break;
    }
  }

  const prevXp = currentTier.minXp;
  const targetXp = nextTier ? nextTier.minXp : currentTier.minXp + 3000;
  const progressInLevel = Math.max(0, totalXp - prevXp);
  const neededForLevel = targetXp - prevXp;
  const percentToNext = Math.min(100, Math.round((progressInLevel / (neededForLevel || 1)) * 100));

  return {
    level: currentTier.level,
    title: currentTier.title,
    icon: currentTier.icon,
    currentXp: totalXp,
    percentToNext,
    neededXp: targetXp - totalXp,
    nextTitle: nextTier ? nextTier.title : 'Supreme Sage'
  };
}

/**
 * Calculates unified daily Life Score (0 to 100)
 */
export function calculateLifeScore({
  steps = 0,
  stepGoal = 8000,
  habitsCompleted = 0,
  habitsTotal = 0,
  tasksCompleted = 0,
  tasksTotal = 0,
  hasJournaledToday = false,
  hasReadToday = false,
  virtueRatingAvg = 0 // 0 to 5
}) {
  // Steps weight: 25 points
  const stepRatio = Math.min(1.2, (steps || 0) / (stepGoal || 8000));
  const stepScore = Math.round(Math.min(25, stepRatio * 25));

  // Habits weight: 25 points
  const habitRatio = habitsTotal > 0 ? (habitsCompleted / habitsTotal) : 0.8;
  const habitScore = Math.round(habitRatio * 25);

  // Discipline & Tasks: 15 points
  const taskRatio = tasksTotal > 0 ? (tasksCompleted / tasksTotal) : 0.75;
  const taskScore = Math.round(taskRatio * 15);

  // Wisdom & Reading: 15 points
  const readingScore = hasReadToday ? 15 : 5;

  // Reflection & Journaling: 10 points
  const journalScore = hasJournaledToday ? 10 : 0;

  // Virtues: 10 points
  const virtueScore = Math.round((virtueRatingAvg / 5) * 10);

  const totalScore = Math.min(100, stepScore + habitScore + taskScore + readingScore + journalScore + virtueScore);
  return totalScore;
}

/**
 * Calculates radar chart scores for the 6 Core Dimensions (0 to 100)
 */
export function calculateCharacterRadar({
  booksReadCount = 1,
  readingMinutes = 30,
  habitsStreak = 3,
  completedTasks = 4,
  steps = 5000,
  stepGoal = 8000,
  budgetAdherencePercent = 85,
  kindnessDeedsCount = 2,
  pomodoroMinutes = 50,
  virtues = {}
}) {
  // 1. Wisdom: books, reading, reflections
  const wisdomScore = Math.min(100, Math.round(booksReadCount * 15 + readingMinutes * 1.2 + (virtues.wisdom || 3) * 10));

  // 2. Discipline: habit streaks, tasks completed, pomodoro
  const disciplineScore = Math.min(100, Math.round(habitsStreak * 6 + completedTasks * 7 + (virtues.discipline || 3) * 8));

  // 3. Health: steps ratio + active minutes
  const healthScore = Math.min(100, Math.round((steps / (stepGoal || 8000)) * 75 + 15));

  // 4. Finance: budget adherence & goal savings
  const financeScore = Math.min(100, Math.round(budgetAdherencePercent || 70));

  // 5. Kindness: deeds of the day + empathy ratings
  const kindnessScore = Math.min(100, Math.round(kindnessDeedsCount * 22 + (virtues.kindness || 3) * 10));

  // 6. Focus: pomodoro time + absence of distractions
  const focusScore = Math.min(100, Math.round(pomodoroMinutes * 1.1 + 35));

  return [
    { subject: 'Wisdom', value: Math.max(20, wisdomScore), fullMark: 100, icon: '🦉' },
    { subject: 'Discipline', value: Math.max(20, disciplineScore), fullMark: 100, icon: '🛡️' },
    { subject: 'Health', value: Math.max(20, healthScore), fullMark: 100, icon: '👟' },
    { subject: 'Finance', value: Math.max(20, financeScore), fullMark: 100, icon: '💰' },
    { subject: 'Kindness', value: Math.max(20, kindnessScore), fullMark: 100, icon: '🌱' },
    { subject: 'Focus', value: Math.max(20, focusScore), fullMark: 100, icon: '🎯' }
  ];
}

