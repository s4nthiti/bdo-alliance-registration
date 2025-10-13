import { NextResponse } from 'next/server';
import { cleanupDuplicateRegistrations } from '@/lib/db';

export async function POST() {
  try {
    console.log('Starting cleanup of duplicate registrations...');
    await cleanupDuplicateRegistrations();
    console.log('Cleanup completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Duplicate registrations cleaned up successfully' 
    });
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup duplicates' },
      { status: 500 }
    );
  }
}
