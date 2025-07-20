import AppError from './AppError';

interface ConsoleLogger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  verbose(message: string, meta?: Record<string, unknown>): void;
  logError(message: string, error: unknown, context?: Record<string, unknown>): void;
}

const formatMeta = (meta?: Record<string, unknown>): string => {
  if (!meta || Object.keys(meta).length === 0) return '';

  try {
    const seen = new WeakSet();
    const replacer = (key: string, value: unknown) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }
      return value;
    };
    return ' ' + JSON.stringify(meta, replacer);
  } catch {
    return ' {"error":"Failed to stringify log metadata"}';
  }
};

const formatError = (error: unknown): Record<string, unknown> => {
  if (error instanceof AppError) {
    return error.toJSON();
  } else if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
        ? error.stack.split('\n').map((line) => line.trim())
        : undefined
    };
  } else {
    return { message: String(error) };
  }
};

const logger: ConsoleLogger = {
  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`error: ${message}${formatMeta(meta)}`);
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`warn: ${message}${formatMeta(meta)}`);
  },

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`info: ${message}${formatMeta(meta)}`);
  },

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`debug: ${message}${formatMeta(meta)}`);
  },

  verbose(message: string, meta?: Record<string, unknown>): void {
    console.log(`verbose: ${message}${formatMeta(meta)}`);
  },

  logError(message: string, error: unknown, context: Record<string, unknown> = {}): void {
    const errorData = formatError(error);
    console.error(`error: ${message}`, {
      error: errorData,
      ...context
    });
  }
};

export default logger;
