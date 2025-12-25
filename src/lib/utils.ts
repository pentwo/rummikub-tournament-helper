import type { Player } from '@/types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getPlayerInitial(name: string): string {
  // For Chinese names, use the last character
  // For English names, use first two letters uppercase
  if (/[\u4e00-\u9fa5]/.test(name)) {
    // Contains Chinese characters - use last character
    return name.slice(-1);
  }
  // English - use first two letters
  return name.slice(0, 2).toUpperCase();
}

export function createPlayer(name: string): Player {
  return {
    id: generateId(),
    name,
    initial: getPlayerInitial(name),
    totalScore: 0,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getTimerColor(remainingSeconds: number): string {
  if (remainingSeconds <= 0) return 'bg-red-900 animate-pulse';
  if (remainingSeconds < 15) return 'bg-red-500';
  if (remainingSeconds < 30) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function sortPlayersByScore(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.totalScore - a.totalScore);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
