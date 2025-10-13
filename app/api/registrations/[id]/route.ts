import { NextRequest, NextResponse } from 'next/server';
import { updateRegistrationQuotas, getRegistrationById } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { usedQuotas } = body;
    
    if (typeof usedQuotas !== 'number') {
      return NextResponse.json(
        { error: 'usedQuotas must be a number' },
        { status: 400 }
      );
    }

    const registration = await updateRegistrationQuotas(id, usedQuotas);
    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}
