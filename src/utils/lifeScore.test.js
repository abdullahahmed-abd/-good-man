import { describe, it, expect } from 'vitest';
import { calculateLifeScore, calculateCharacterRadar, getLevelInfo, TITLES_BY_LEVEL } from './lifeScore';

describe('Life Score & Character Growth Logic', () => {
  it('correctly maps XP to character levels and titles', () => {
    // Level 1: Seeker
    const lvl1 = getLevelInfo(50);
    expect(lvl1.level).toBe(1);
    expect(lvl1.title).toBe('The Seeker');

    // Level 3: Practicing Stoic
    const lvl3 = getLevelInfo(750);
    expect(lvl3.level).toBe(3);
    expect(lvl3.title).toBe('The Practicing Stoic');

    // High Level: Sage
    const lvl7 = getLevelInfo(5200);
    expect(lvl7.level).toBe(7);
  });

  it('computes unified daily life score between 0 and 100', () => {
    // Zero activity
    const zeroScore = calculateLifeScore({
      steps: 0,
      stepGoal: 10000,
      habitsCompleted: 0,
      habitsTotal: 5,
      tasksCompleted: 0,
      tasksTotal: 5,
      hasJournaledToday: false,
      hasReadToday: false,
      virtueRatingAvg: 0
    });
    expect(zeroScore).toBeGreaterThanOrEqual(0);
    expect(zeroScore).toBeLessThanOrEqual(20);

    // Full discipline day
    const fullScore = calculateLifeScore({
      steps: 10000,
      stepGoal: 10000,
      habitsCompleted: 5,
      habitsTotal: 5,
      tasksCompleted: 5,
      tasksTotal: 5,
      hasJournaledToday: true,
      hasReadToday: true,
      virtueRatingAvg: 5
    });
    expect(fullScore).toBeGreaterThanOrEqual(95);
    expect(fullScore).toBeLessThanOrEqual(100);
  });

  it('computes 6-pillar radar dimensions', () => {
    const radar = calculateCharacterRadar({
      booksReadCount: 3,
      readingMinutes: 45,
      habitsStreak: 7,
      completedTasks: 5,
      steps: 9000,
      stepGoal: 8000,
      budgetAdherencePercent: 90,
      kindnessDeedsCount: 3,
      pomodoroMinutes: 60,
      virtues: { wisdom: 5, discipline: 5, kindness: 5 }
    });

    expect(radar).toHaveLength(6);
    radar.forEach(dim => {
      expect(dim.value).toBeGreaterThanOrEqual(20);
      expect(dim.value).toBeLessThanOrEqual(100);
    });
  });
});

