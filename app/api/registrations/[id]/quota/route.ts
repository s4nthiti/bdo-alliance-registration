import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationById, updateRegistrationQuotasOptimistic } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { expectedCurrentQuota, newQuota } = body;
    
    if (expectedCurrentQuota === undefined || newQuota === undefined) {
      return NextResponse.json(
        { error: 'expectedCurrentQuota and newQuota are required' },
        { status: 400 }
      );
    }
    
    // Get current registration to verify the expected quota
    const currentRegistration = await getRegistrationById(id);
    if (!currentRegistration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }
    
    // Use optimistic locking to prevent race conditions
    const updatedRegistration = await updateRegistrationQuotasOptimistic(
      id, 
      expectedCurrentQuota, 
      newQuota
    );
    
    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error('Error updating quota with optimistic locking:', error);
    
    if (error instanceof Error && error.message.includes('Concurrent modification')) {
      return NextResponse.json(
        { 
          error: 'Concurrent modification detected',
          message: 'Another user has modified this registration. Please refresh and try again.',
          code: 'CONCURRENT_MODIFICATION'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update quota' },
      { status: 500 }
    );
  }
}
