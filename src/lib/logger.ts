const isTest = process.env.NODE_ENV === 'test';

/**
 * Thin logging seam. Stays silent under test to keep Jest output clean, and
 * centralises the single place where a real logger (pino, etc.) could later
 * be plugged in without touching call sites.
 */
export const logger = {
  error: (...args: unknown[]): void => {
    if (!isTest) console.error(...args);
  },
  warn: (...args: unknown[]): void => {
    if (!isTest) console.warn(...args);
  },
};
