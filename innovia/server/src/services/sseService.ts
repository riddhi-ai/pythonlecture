import { Response } from 'express';

interface SSEClient {
  id: string;
  userId: string;
  workspaceId: string;
  res: Response;
}

class SSEService {
  private clients: SSEClient[] = [];

  addClient(userId: string, workspaceId: string, res: Response) {
    const id = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const client: SSEClient = { id, userId, workspaceId, res };
    this.clients.push(client);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', id })}\n\n`);

    res.on('close', () => {
      this.removeClient(id);
    });

    return id;
  }

  removeClient(id: string) {
    this.clients = this.clients.filter((c) => c.id !== id);
  }

  broadcastToWorkspace(workspaceId: string, eventType: string, payload: any) {
    const targets = this.clients.filter((c) => c.workspaceId === workspaceId);
    const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
    targets.forEach((c) => {
      try {
        c.res.write(`data: ${data}\n\n`);
      } catch (err) {
        console.error(`[SSE] Broadcast failure for client ${c.id}:`, err);
      }
    });
  }
}

export const sseManager = new SSEService();
