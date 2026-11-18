type SSEHandler = (event: { type: string; data: any; timestamp: string }) => void;

class SSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<SSEHandler> = new Set();
  private reconnectTimer: any = null;

  connect() {
    const token = localStorage.getItem('innovia_access_token');
    if (!token) return;

    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = `/api/v1/events?token=${encodeURIComponent(token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        this.listeners.forEach((listener) => listener(payload));
      } catch (err) {
        console.error('[SSE Client] Error parsing event:', err);
      }
    };

    this.eventSource.onerror = () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, 5000);
    };
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  subscribe(handler: SSEHandler) {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }
}

export const sseClient = new SSEClient();
