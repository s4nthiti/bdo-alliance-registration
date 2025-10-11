import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0]?.current_time,
      environment: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasBdoStorageUrl: !!process.env.BDO_STORAGE_POSTGRES_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasBdoStorageUrl: !!process.env.BDO_STORAGE_POSTGRES_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
