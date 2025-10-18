import { NextRequest } from 'next/server';

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bossDate = searchParams.get('bossDate');
  
  if (!bossDate) {
    return new Response('bossDate parameter is required', { status: 400 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the set
      connections.add(controller);
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        message: 'Real-time updates connected',
        timestamp: new Date().toISOString()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        connections.delete(controller);
        controller.close();
      });
    },
    
    cancel() {
      // Remove all connections that are no longer valid
      // We can't access the specific controller here, so we'll clean up dead connections
      // in the broadcastUpdate function instead
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Function to broadcast updates to all connected clients
export function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString()
  });
  
  connections.forEach(controller => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      // Remove dead connections
      connections.delete(controller);
    }
  });
}
