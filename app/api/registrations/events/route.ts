import { NextRequest } from 'next/server';
import { getRegistrationsByDate } from '@/lib/db';

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

// Broadcast function to send updates to all connected clients
export function broadcastQuotaUpdate(bossDate: string) {
  const message = JSON.stringify({
    type: 'quota_update',
    bossDate,
    timestamp: Date.now()
  });

  connections.forEach(controller => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
    } catch (error) {
      console.error('Error sending SSE message:', error);
      connections.delete(controller);
    }
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bossDate = searchParams.get('bossDate');
  
  if (!bossDate) {
    return new Response('bossDate parameter is required', { status: 400 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller);
      
      // Send initial data
      const sendInitialData = async () => {
        try {
          const registrations = await getRegistrationsByDate(bossDate);
          const message = JSON.stringify({
            type: 'initial_data',
            data: registrations,
            timestamp: Date.now()
          });
          controller.enqueue(`data: ${message}\n\n`);
        } catch (error) {
          console.error('Error sending initial data:', error);
          const errorMessage = JSON.stringify({
            type: 'error',
            message: 'Failed to load initial data',
            timestamp: Date.now()
          });
          controller.enqueue(`data: ${errorMessage}\n\n`);
        }
      };

      sendInitialData();

      // Send keep-alive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          clearInterval(keepAliveInterval);
          connections.delete(controller);
        }
      }, 30000);

      // Clean up when connection closes
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAliveInterval);
        connections.delete(controller);
      });
    },
    
    cancel() {
      connections.delete(controller);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
