class AppError extends Error {
  status: number;
  logged: boolean;
  context?: Record<string, unknown>;
  code?: string;
  requestId?: string;
  originalError?: Error;

  constructor(
    message: string,
    status = 500,
    options?: {
      context?: Record<string, unknown>;
      code?: string;
      requestId?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.logged = false;

    if (options) {
      this.context = options.context;
      this.code = options.code;
      this.requestId = options.requestId;

      if (options.originalError) {
        this.originalError = options.originalError;
        if (options.originalError.stack) {
          this.stack = options.originalError.stack;
        }
      }
    }

    if (!this.stack) {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }


  static badRequest(
    message = 'Bad Request',
    options?: {
      context?: Record<string, unknown>;
      code?: string;
      requestId?: string;
      originalError?: Error;
    }
  ) {
    return new AppError(message, 400, {
      ...options,
      code: options?.code || 'BAD_REQUEST'
    });
  }


  static unauthorized(
    message = 'Unauthorized',
    options?: {
      context?: Record<string, unknown>;
      code?: string;
      requestId?: string;
      originalError?: Error;
    }
  ) {
    return new AppError(message, 401, {
      ...options,
      code: options?.code || 'UNAUTHORIZED'
    });
  }


  static forbidden(
    message = 'Forbidden',
    options?: {
      context?: Record<string, unknown>;
      code?: string;
      requestId?: string;
      originalError?: Error;
    }
  ) {
    return new AppError(message, 403, {
      ...options,
      code: options?.code || 'FORBIDDEN'
    });
  }


  static notFound(
    message = 'Not Found',
    options?: {
      context?: Record<string, unknown>;
      code?: string;
      requestId?: string;
      originalError?: Error;
    }
  ) {
    return new AppError(message, 404, {
      ...options,
      code: options?.code || 'NOT_FOUND'
    });
  }


  static conflict(
    message = 'Conflict',
    options?: {
      context?: Record<string, unknown>;
      code?: string;
      requestId?: string;
      originalError?: Error;
    }
  ) {
    return new AppError(message, 409, {
      ...options,
      code: options?.code || 'CONFLICT'
    });
  }


  static tooManyRequests(
    message = 'Too Many Requests',
    options?: {
      context?: Record<string, unknown>;
      code?: string;
      requestId?: string;
      originalError?: Error;
    }
  ) {
    return new AppError(message, 429, {
      ...options,
      code: options?.code || 'TOO_MANY_REQUESTS'
    });
  }


  static internal(
    message = 'Internal Server Error',
    options?: {
      context?: Record<string, unknown>;
      code?: string;
      requestId?: string;
      originalError?: Error;
    }
  ) {
    return new AppError(message, 500, {
      ...options,
      code: options?.code || 'INTERNAL_SERVER_ERROR'
    });
  }


  withContext(context: Record<string, unknown>): AppError {
    this.context = { ...this.context, ...context };
    return this;
  }


  withRequestId(requestId: string): AppError {
    this.requestId = requestId;
    return this;
  }


  withCode(code: string): AppError {
    this.code = code;
    return this;
  }


  withOriginalError(error: Error): AppError {
    this.originalError = error;
    if (error.stack) {
      this.stack = error.stack;
    }
    return this;
  }


  markAsLogged(): AppError {
    this.logged = true;
    return this;
  }


  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      requestId: this.requestId,
      context: this.context,
      stack: this.parseStackTrace(),
      originalError: this.originalError
        ? {
          name: this.originalError.name,
          message: this.originalError.message
        }
        : undefined
    };
  }


  parseStackTrace(): string[] | undefined {
    if (!this.stack) return undefined;

    return this.stack
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => !!line);
  }
}

export default AppError;

export class InsufficientWalletBalanceError extends Error {
  constructor(
    currentBalance: number,
    attemptedAmount: number,
    minimumBalance: number = 0
  ) {
    super(
      `Insufficient wallet balance. Current: ${currentBalance}¢, Attempted: ${attemptedAmount}¢, Minimum allowed: ${minimumBalance}¢`
    );
    this.name = 'InsufficientWalletBalanceError';
  }
}
