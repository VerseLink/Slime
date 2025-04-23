export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
	level?: LogLevel;
    prefix?: string;
	customLogger?: Partial<Record<LogLevel, (...args: any[]) => void>>;
}

export class Logger {
	private levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
	private levelIndex: number;
    private prefix: string;
	private customLogger?: Partial<Record<LogLevel, (...args: any[]) => void>>;

	constructor({ level = 'warn', customLogger, prefix }: LoggerOptions = {}) {
        this.prefix = prefix ?? "";
		this.levelIndex = this.levels.indexOf(level);
		this.customLogger = customLogger;
	}

	private log(level: LogLevel, ...args: any[]): void {
		if (this.levels.indexOf(level) >= this.levelIndex) {
            if (args.length > 0 && typeof args[0] === 'string') {
                args[0] = this.prefix + ' ' + args[0];
            }
			if (this.customLogger?.[level]) {
				this.customLogger[level]!(...args);
			} else {
				console[level]?.(...args);
			}
		}
	}

	debug(...args: any[]): void {
		this.log('debug', ...args);
	}
	info(...args: any[]): void {
		this.log('info', ...args);
	}
	warn(...args: any[]): void {
		this.log('warn', ...args);
	}
	error(...args: any[]): void {
		this.log('error', ...args);
	}
}

