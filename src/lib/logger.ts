import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Creates a child logger with request context.
 */
export function createLogger(context: { store_id?: string; request_id?: string; [key: string]: unknown }) {
  return logger.child(context);
}
