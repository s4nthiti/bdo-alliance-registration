import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationsByDate, createRegistration, getAllGuilds } from '@/lib/db';

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
  let body;
  try {
    body = await request.json();
    console.log('Creating registration with data:', body);
    
    // Validate required fields
    // Note: registration_code can be empty as it will be fetched from the guild table
    if (!body.guild_id || body.used_quotas === undefined || !body.boss_date) {
      console.error('Missing required fields:', body);
      return NextResponse.json(
        { error: 'Missing required fields: guild_id, used_quotas, boss_date' },
        { status: 400 }
      );
    }
    
    // Debug: Check available guilds
    const availableGuilds = await getAllGuilds();
    console.log('Available guilds:', availableGuilds.map(g => ({ id: g.id, name: g.name })));
    console.log('Requested guild_id:', body.guild_id);
    
    const registration = await createRegistration(body);
    console.log('Registration created successfully:', registration);
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: body || 'Could not parse body'
    });
    return NextResponse.json(
      { 
        error: 'Failed to create registration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
