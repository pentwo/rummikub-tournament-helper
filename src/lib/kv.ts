import type { TournamentData, Player, Table, Round } from '@/types';
import Redis from 'ioredis';

// Singleton Redis client
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  memoryStore: Map<string, TournamentData>;
};

if (!globalForRedis.memoryStore) {
  globalForRedis.memoryStore = new Map<string, TournamentData>();
}

const memoryStore = globalForRedis.memoryStore;

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(process.env.REDIS_URL);
  }

  return globalForRedis.redis;
}

const getTodayKey = () => {
  const today = new Date().toISOString().split('T')[0];
  return `tournament:${today}`;
};

export async function getTournamentData(): Promise<TournamentData> {
  const key = getTodayKey();
  const today = new Date().toISOString().split('T')[0];

  const emptyData: TournamentData = {
    date: today,
    players: [],
    tables: [],
    rounds: [],
  };

  const redis = getRedisClient();

  if (!redis) {
    // Use in-memory storage for local development
    console.log('[Dev] Using in-memory storage');
    return memoryStore.get(key) || emptyData;
  }

  const raw = await redis.get(key);
  if (!raw) return emptyData;

  try {
    return JSON.parse(raw) as TournamentData;
  } catch {
    return emptyData;
  }
}

export async function saveTournamentData(data: TournamentData): Promise<void> {
  const key = getTodayKey();

  const redis = getRedisClient();

  if (!redis) {
    // Use in-memory storage for local development
    memoryStore.set(key, data);
    return;
  }

  // Set with 24 hour expiry
  await redis.setex(key, 86400, JSON.stringify(data));
}

export async function addPlayer(player: Player): Promise<TournamentData> {
  const data = await getTournamentData();
  data.players.push(player);
  await saveTournamentData(data);
  return data;
}

export async function addTable(table: Table): Promise<TournamentData> {
  const data = await getTournamentData();
  data.tables.push(table);
  await saveTournamentData(data);
  return data;
}

export async function updateTable(
  tableId: string,
  updates: Partial<Table>
): Promise<TournamentData> {
  const data = await getTournamentData();
  const tableIndex = data.tables.findIndex((t) => t.id === tableId);

  if (tableIndex === -1) {
    throw new Error(`Table ${tableId} not found`);
  }

  data.tables[tableIndex] = { ...data.tables[tableIndex], ...updates };
  await saveTournamentData(data);
  return data;
}

export async function addRound(round: Round): Promise<TournamentData> {
  const data = await getTournamentData();
  data.rounds.push(round);

  // Update player scores
  for (const [playerId, score] of Object.entries(round.scores)) {
    const player = data.players.find((p) => p.id === playerId);
    if (player) {
      player.totalScore += score;
    }
  }

  // Update table round count
  const table = data.tables.find((t) => t.id === round.tableId);
  if (table) {
    table.currentRound += 1;
    table.status = 'playing';
    table.currentPlayerIndex = 0;
    table.timerStartedAt = null;
  }

  await saveTournamentData(data);
  return data;
}

export async function getTable(tableId: string): Promise<Table | null> {
  const data = await getTournamentData();
  return data.tables.find((t) => t.id === tableId) || null;
}

export async function deleteTable(tableId: string): Promise<TournamentData> {
  const data = await getTournamentData();
  data.tables = data.tables.filter((t) => t.id !== tableId);
  await saveTournamentData(data);
  return data;
}

export async function resetTournament(): Promise<TournamentData> {
  const today = new Date().toISOString().split('T')[0];
  const emptyData: TournamentData = {
    date: today,
    players: [],
    tables: [],
    rounds: [],
  };
  await saveTournamentData(emptyData);
  return emptyData;
}
