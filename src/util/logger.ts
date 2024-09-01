import * as path from 'path';

export class Logger {
    private static logs: string[] = [];

    private static formatTimestamp(): string {
        const now = new Date();
        return now.toISOString().replace('T', ' ').substring(0, 19);
    }

    private static getFileName(): string {
        if (process.env.DEVELOPMENT === '1') {
            const stack = new Error().stack;
            if (stack) {
                const match = stack.match(/at\s+(.*):(\d+):(\d+)/);
                if (match) {
                    const filePath = match[1];
                    return path.basename(filePath);
                }
            }
        }
        return '';
    }

    private static log(level: string, module: string, message: string): void {
        const timestamp = Logger.formatTimestamp();
        const fileName = Logger.getFileName();
        const fileInfo = fileName ? `[${fileName}] ` : '';
        const logEntry = `[${timestamp}] ${level} [${module}] ${fileInfo}${message}`;
        
        Logger.logs.push(logEntry);
        console.log(logEntry);
    }

    public static info(module: string, message: string): void {
        Logger.log('INFO', module, message);
    }

    public static warning(module: string, message: string): void {
        Logger.log('WARNING', module, message);
    }

    public static severe(module: string, message: string): void {
        Logger.log('SEVERE', module, message);
    }

    public static getLogs(): string[] {
        return Logger.logs;
    }
}
