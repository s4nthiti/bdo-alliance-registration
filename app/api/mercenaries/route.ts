import { NextRequest, NextResponse } from 'next/server';
import { getMercenariesByDate } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bossDate = searchParams.get('bossDate');
    
    if (!bossDate) {
      return NextResponse.json(
        { error: 'bossDate parameter is required' },
        { status: 400 }
      );
    }

    const mercenaries = await getMercenariesByDate(bossDate);
    return NextResponse.json(mercenaries);
  } catch (error) {
    console.error('Error fetching mercenaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mercenaries' },
      { status: 500 }
    );
  }
}
