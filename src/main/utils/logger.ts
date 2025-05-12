import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let isLoggingEnabled = true;
let logsDirectory: string;

export function initLogger(enabled: boolean) {
  isLoggingEnabled = enabled;
  
  if (enabled) {
    // Create logs directory in user data folder
    logsDirectory = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(logsDirectory)) {
      fs.mkdirSync(logsDirectory, { recursive: true });
    }
  }
}

export function getLogsDirectory(): string {
  return logsDirectory;
}

export function writeLog(level: 'INFO' | 'ERROR' | 'DEBUG', message: string, data?: any) {
  if (!isLoggingEnabled) return;

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${timestamp}] ${level}: ${message}`, data || '');
  }

  // Write to file
  const logFile = path.join(logsDirectory, `${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
} 