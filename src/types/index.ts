// Player
export interface Player {
  id: string;
  name: string;
  initial: string; // Avatar text, e.g., "小明" -> "明" or "SM"
  totalScore: number; // Cumulative total score
}

// Table
export interface Table {
  id: string;
  players: string[]; // player IDs
  currentPlayerIndex: number;
  currentRound: number;
  status: 'playing' | 'scoring' | 'finished';
  timerStartedAt: number | null;
}

// Round record
export interface Round {
  id: string;
  tableId: string;
  roundNumber: number;
  winnerId: string;
  scores: Record<string, number>; // playerId -> score
  timestamp: number;
}

// Tournament data for the day
export interface TournamentData {
  date: string; // YYYY-MM-DD
  players: Player[];
  tables: Table[];
  rounds: Round[];
}

// API request/response types
export interface CreateTableRequest {
  playerNames: string[];
}

export interface UpdateTableRequest {
  players?: string[];
  currentPlayerIndex?: number;
  status?: Table['status'];
  timerStartedAt?: number | null;
}

export interface CreateRoundRequest {
  tableId: string;
  winnerId: string;
  scores: Record<string, number>;
}
