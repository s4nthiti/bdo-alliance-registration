import { NextRequest, NextResponse } from 'next/server';
import { addMercenary, removeMercenary, getMercenariesByRegistration } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const mercenary = await addMercenary(id, name);
    return NextResponse.json(mercenary, { status: 201 });
  } catch (error) {
    console.error('Error adding mercenary:', error);
    return NextResponse.json(
      { error: 'Failed to add mercenary' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await removeMercenary(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing mercenary:', error);
    return NextResponse.json(
      { error: 'Failed to remove mercenary' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mercenaries = await getMercenariesByRegistration(id);
    return NextResponse.json(mercenaries);
  } catch (error) {
    console.error('Error fetching mercenaries for registration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mercenaries' },
      { status: 500 }
    );
  }
}
