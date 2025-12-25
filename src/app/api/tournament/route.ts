import { NextResponse } from 'next/server';
import { getTournamentData, saveTournamentData, resetTournament } from '@/lib/kv';
import type { TournamentData } from '@/types';

export async function GET() {
  try {
    const data = await getTournamentData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tournament data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<TournamentData>;
    const currentData = await getTournamentData();

    const updatedData: TournamentData = {
      ...currentData,
      ...body,
    };

    await saveTournamentData(updatedData);
    return NextResponse.json(updatedData);
  } catch (error) {
    console.error('Error saving tournament data:', error);
    return NextResponse.json(
      { error: 'Failed to save tournament data' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const data = await resetTournament();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error resetting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to reset tournament' },
      { status: 500 }
    );
  }
}
