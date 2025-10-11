import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationsByDate, createRegistration } from '@/lib/db';

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
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}
