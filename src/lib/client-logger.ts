/**
 * Client-side Logger
 * Provides a safe way to log in the browser without polluting production logs
 * or violating project rules about console usage.
 */

export const clientLogger = {
  error: (msg: string, err?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[TCG Error] ${msg}`, err);
    }
    // In production, we could send to a service like Sentry
  },
  info: (msg: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TCG Info] ${msg}`, data);
    }
  },
  warn: (msg: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[TCG Warn] ${msg}`, data);
    }
  }
};
