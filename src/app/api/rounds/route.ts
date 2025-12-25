import { NextResponse } from 'next/server';
import { addRound } from '@/lib/kv';
import { generateId } from '@/lib/utils';
import type { CreateRoundRequest, Round } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateRoundRequest;

    if (!body.tableId || !body.winnerId || !body.scores) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, winnerId, scores' },
        { status: 400 }
      );
    }

    const round: Round = {
      id: generateId(),
      tableId: body.tableId,
      roundNumber: 0, // Will be set based on table's current round
      winnerId: body.winnerId,
      scores: body.scores,
      timestamp: Date.now(),
    };

    const data = await addRound(round);

    return NextResponse.json({ round, tournament: data });
  } catch (error) {
    console.error('Error creating round:', error);
    return NextResponse.json(
      { error: 'Failed to create round' },
      { status: 500 }
    );
  }
}
