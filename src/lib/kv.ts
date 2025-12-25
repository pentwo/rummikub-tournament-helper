import type { TournamentData, Player, Table, Round } from '@/types';

// In-memory storage for local development
// Use globalThis to persist across hot reloads in Next.js dev mode
const globalStore = globalThis as unknown as {
  memoryStore: Map<string, TournamentData>;
};

if (!globalStore.memoryStore) {
  globalStore.memoryStore = new Map<string, TournamentData>();
}

const memoryStore = globalStore.memoryStore;

const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

const getTodayKey = () => {
  const today = new Date().toISOString().split('T')[0];
  return `tournament:${today}`;
};

// Lazy load @vercel/kv only when configured
async function getKV() {
  const { kv } = await import('@vercel/kv');
  return kv;
}

export async function getTournamentData(): Promise<TournamentData> {
  const key = getTodayKey();
  const today = new Date().toISOString().split('T')[0];

  const emptyData: TournamentData = {
    date: today,
    players: [],
    tables: [],
    rounds: [],
  };

  if (!isKVConfigured()) {
    // Use in-memory storage for local development
    console.log('[Dev] Using in-memory storage');
    return memoryStore.get(key) || emptyData;
  }

  const kv = await getKV();
  const data = await kv.get<TournamentData>(key);
  return data || emptyData;
}

export async function saveTournamentData(data: TournamentData): Promise<void> {
  const key = getTodayKey();

  if (!isKVConfigured()) {
    // Use in-memory storage for local development
    memoryStore.set(key, data);
    return;
  }

  const kv = await getKV();
  // Set with 24 hour expiry
  await kv.set(key, data, { ex: 86400 });
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
