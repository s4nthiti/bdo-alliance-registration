import { NextRequest, NextResponse } from 'next/server';
import { broadcastUpdate } from '../route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }
    
    // Broadcast the update to all connected SSE clients
    broadcastUpdate(type, data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Update broadcasted successfully' 
    });
  } catch (error) {
    console.error('Error broadcasting update:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast update' },
      { status: 500 }
    );
  }
}
