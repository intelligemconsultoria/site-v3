/**
 * Sistema de Log para Debug e Monitoramento
 * 
 * Este sistema de log ajuda a identificar problemas de integração com Supabase,
 * erros de autenticação, problemas de permissão e outros issues.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.DEBUG;

  constructor() {
    // Em desenvolvimento, sempre logar tudo
    if (import.meta.env.DEV) {
      this.currentLevel = LogLevel.DEBUG;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      error,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Tentar obter ID do usuário do localStorage ou contexto de auth
      const authData = localStorage.getItem('intelligem-supabase-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
    return undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('intelligem-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('intelligem-session-id', sessionId);
    }
    return sessionId;
  }

  private addLog(entry: LogEntry) {
    this.logs.unshift(entry);
    
    // Manter apenas os últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log no console também
    const consoleMethod = this.getConsoleMethod(entry.level);
    const logMessage = `[${entry.timestamp}] [${entry.category}] ${entry.message}`;
    
    if (entry.data || entry.error) {
      console[consoleMethod](logMessage, entry.data || entry.error);
    } else {
      console[consoleMethod](logMessage);
    }
  }

  private getConsoleMethod(level: LogLevel): 'log' | 'info' | 'warn' | 'error' {
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warn';
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return 'error';
      default:
        return 'log';
    }
  }

  debug(category: string, message: string, data?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.addLog(this.createLogEntry(LogLevel.DEBUG, category, message, data));
    }
  }

  info(category: string, message: string, data?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      this.addLog(this.createLogEntry(LogLevel.INFO, category, message, data));
    }
  }

  warn(category: string, message: string, data?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      this.addLog(this.createLogEntry(LogLevel.WARN, category, message, data));
    }
  }

  error(category: string, message: string, error?: Error, data?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.addLog(this.createLogEntry(LogLevel.ERROR, category, message, data, error));
    }
  }

  critical(category: string, message: string, error?: Error, data?: any) {
    if (this.shouldLog(LogLevel.CRITICAL)) {
      this.addLog(this.createLogEntry(LogLevel.CRITICAL, category, message, data, error));
    }
  }

  // Métodos específicos para Supabase
  supabaseError(operation: string, error: any, context?: any) {
    this.error('SUPABASE', `Erro na operação ${operation}`, error, {
      operation,
      context,
      errorDetails: {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        status: error?.status
      }
    });
  }

  supabaseSuccess(operation: string, data?: any) {
    this.info('SUPABASE', `Operação ${operation} executada com sucesso`, data);
  }

  supabaseRequest(operation: string, table: string, method: string, data?: any) {
    this.debug('SUPABASE_REQUEST', `${method} ${table}`, {
      operation,
      table,
      method,
      data: data ? JSON.stringify(data, null, 2) : undefined
    });
  }

  // Métodos para obter logs
  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }
    
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }
    
    return filteredLogs;
  }

  getLogsAsString(level?: LogLevel, category?: string): string {
    const logs = this.getLogs(level, category);
    return logs.map(log => {
      const levelName = LogLevel[log.level];
      return `[${log.timestamp}] [${levelName}] [${log.category}] ${log.message}${
        log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : ''
      }${log.error ? `\nError: ${log.error.message}` : ''}`;
    }).join('\n\n');
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Método para debug de problemas específicos
  debugSupabaseConnection() {
    this.debug('SUPABASE_DEBUG', 'Verificando conexão com Supabase', {
      url: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
    });
  }
}

// Instância singleton
export const logger = new Logger();

// Exportar para uso global em desenvolvimento
if (import.meta.env.DEV) {
  (window as any).logger = logger;
  (window as any).getLogs = () => logger.getLogs();
  (window as any).exportLogs = () => logger.exportLogs();
}
