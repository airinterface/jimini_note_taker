type LogMeta = unknown;

class Logger {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  info(message: string, meta?: LogMeta): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    this.write('error', message, meta);
  }

  private write(level: 'info' | 'warn' | 'error', message: string, meta?: LogMeta): void {
    const prefix = `[${this.name}]`;

    if (typeof meta === 'undefined') {
      console[level](`${prefix} ${message}`);
      return;
    }

    console[level](`${prefix} ${message}`, meta);
  }
}

export const getLogger = (name: string): Logger => new Logger(name);

export const logger = getLogger('App');

export type { Logger };

