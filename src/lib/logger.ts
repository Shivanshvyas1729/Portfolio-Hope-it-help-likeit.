export type AuditStatus = "pending" | "success" | "error";

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  status: AuditStatus;
  message: string;
  metadata?: any;
}

type LogListener = (logs: AuditEntry[]) => void;

class AuditLogger {
  private logs: AuditEntry[] = [];
  private listeners: LogListener[] = [];
  private readonly MAX_LOGS = 100;

  private notify() {
    this.listeners.forEach(l => l([...this.logs]));
  }

  private getFormattedTime() {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  addLog(entry: Omit<AuditEntry, "id" | "timestamp">) {
    const newLog: AuditEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: this.getFormattedTime()
    };

    this.logs = [newLog, ...this.logs].slice(0, this.MAX_LOGS);
    
    // Console output for development
    if (import.meta.env.DEV) {
      const color = entry.status === 'success' ? '#10b981' : entry.status === 'error' ? '#ef4444' : '#3b82f6';
      console.log(
        `%c[CMS:${entry.status.toUpperCase()}] %c${entry.action}: ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
        'color: inherit;',
        entry.metadata || ''
      );
    }

    this.notify();
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notify();
  }

  subscribe(listener: LogListener) {
    this.listeners.push(listener);
    listener([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Legacy compatibility / Convenience methods
  info(message: string, metadata?: any) {
    this.addLog({ action: "INFO", status: "pending", message, metadata });
  }

  warn(message: string, metadata?: any) {
    this.addLog({ action: "WARN", status: "pending", message, metadata });
  }

  error(message: string, metadata?: any) {
    this.addLog({ action: "ERROR", status: "error", message, metadata });
  }
}

export const logger = new AuditLogger();
