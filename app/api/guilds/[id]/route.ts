import { NextRequest, NextResponse } from 'next/server';
import { getGuildById, updateGuild, deleteGuild } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guild = await getGuildById(params.id);
    if (!guild) {
      return NextResponse.json(
        { error: 'Guild not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(guild);
  } catch (error) {
    console.error('Error fetching guild:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guild' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const guild = await updateGuild(params.id, body);
    return NextResponse.json(guild);
  } catch (error) {
    console.error('Error updating guild:', error);
    return NextResponse.json(
      { error: 'Failed to update guild' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteGuild(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guild:', error);
    return NextResponse.json(
      { error: 'Failed to delete guild' },
      { status: 500 }
    );
  }
}
