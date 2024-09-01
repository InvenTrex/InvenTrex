import { Express, Router } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Logger } from '../util/logger';

export async function registerEndpoints(app: Express) {
	const apiDir = path.resolve(__dirname, '../api');

	async function scanDir(dir: string) {
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				await scanDir(fullPath);
			} else if (entry.isFile() && entry.name.endsWith('.js')) {
				const relativePath = path.relative(apiDir, fullPath);
				const routePath =
					'/' + relativePath.replace(/\.js$/, '').replace(/\\/g, '/');

                    try {
                        const routerModule = await import(fullPath);
                        Logger.info('Router', `Loaded module: ${fullPath}`);
                        Logger.info('Router', routerModule);  // Log the module exports
                        
                        const router: Router = routerModule.router;
    
                        if (!router) {
                            Logger.severe('Router', `No router found in module at path: ${fullPath}`);
                            continue;
                        }
    
                        app.use(routePath, router);
                    } catch (err) {
                        Logger.severe('Router', `Failed to load module at path: ${fullPath}`);
                    }
			}
		}
	}

	await scanDir(apiDir);
}
