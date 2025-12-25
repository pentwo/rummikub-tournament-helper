import { NextResponse } from 'next/server';
import { getTournamentData, saveTournamentData } from '@/lib/kv';
import { generateId, createPlayer } from '@/lib/utils';
import type { CreateTableRequest, Table } from '@/types';

export async function GET() {
  try {
    const data = await getTournamentData();
    return NextResponse.json(data.tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateTableRequest;

    if (
      !body.playerNames ||
      body.playerNames.length < 2 ||
      body.playerNames.length > 4
    ) {
      return NextResponse.json(
        { error: 'Must have 2-4 players' },
        { status: 400 }
      );
    }

    const data = await getTournamentData();

    // Create players if they don't exist
    const playerIds: string[] = [];
    for (const name of body.playerNames) {
      let player = data.players.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      if (!player) {
        player = createPlayer(name);
        data.players.push(player);
      }
      playerIds.push(player.id);
    }

    // Create table
    const table: Table = {
      id: generateId(),
      players: playerIds,
      currentPlayerIndex: 0,
      currentRound: 1,
      status: 'playing',
      timerStartedAt: null,
    };

    data.tables.push(table);
    await saveTournamentData(data);

    return NextResponse.json({ table, players: data.players });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}
