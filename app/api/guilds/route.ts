import { NextRequest, NextResponse } from 'next/server';
import { getAllGuilds, createGuild } from '@/lib/db';

export async function GET() {
  try {
    const guilds = await getAllGuilds();
    return NextResponse.json(guilds);
  } catch (error) {
    console.error('Error fetching guilds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guilds' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const guild = await createGuild(body);
    return NextResponse.json(guild, { status: 201 });
  } catch (error) {
    console.error('Error creating guild:', error);
    return NextResponse.json(
      { error: 'Failed to create guild' },
      { status: 500 }
    );
  }
}
