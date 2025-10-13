import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationsByDate, createRegistration } from '@/lib/db';
import { broadcastQuotaUpdate } from './events/route';

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

    const registrations = await getRegistrationsByDate(bossDate);
    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const registration = await createRegistration(body);
    
    // Broadcast the new registration to all connected clients
    try {
      broadcastQuotaUpdate(registration.boss_date);
    } catch (error) {
      console.error('Error broadcasting registration creation:', error);
      // Don't fail the request if broadcasting fails
    }
    
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}
