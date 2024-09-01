import { Express, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { Logger } from '../util/logger';

// Helper function to recursively get all JavaScript files from a directory
const getJavaScriptFiles = (dir: string, filelist: string[] = []): string[] => {
	const files = fs.readdirSync(dir);
	files.forEach((file) => {
		const filepath = path.join(dir, file);
		const stat = fs.statSync(filepath);
		if (stat.isDirectory()) {
			getJavaScriptFiles(filepath, filelist);
		} else if (filepath.endsWith('.js')) {
			filelist.push(filepath);
		}
	});
	return filelist;
};

// Helper function to register routes from files with error handling
const registerRoutes = (
	app: Express,
	dir: string,
	method: 'post' | 'get' | 'delete',
) => {
	const files = getJavaScriptFiles(dir);
	files.forEach((file) => {
		const relativePath = path.relative(dir, file).replace(/\.js$/, '');
		const routePath = `/${relativePath.replace(/\\/g, '/')}`;

		// Import the route handler dynamically
		import(file)
			.then((module) => {
				const handler = module.execute;
				if (typeof handler === 'function') {
					app[method](
						routePath,
						async (
							req: Request,
							res: Response,
							next: NextFunction,
						) => {
							try {
								await handler(req, res);
							} catch (err) {
								Logger.severe(
									'express',
									`Error handling ${method.toUpperCase()} ${routePath}: ${err.message}`,
								);
								res.status(500).json({
									error: 'Internal Server Error',
								});
							}
						},
					);
				} else {
					Logger.warning(
						'express',
						`No 'execute' function found in ${file}`,
					);
				}
			})
			.catch((err) => {
				Logger.severe(
					'express',
					`Failed to load module ${file}: ${err.message}`,
				);
			});
	});
};

export async function registerPOSTEndpoints(app: Express) {
	const postDir = path.join(__dirname, 'POST');
	registerRoutes(app, postDir, 'post');
}

export async function registerGETEndpoints(app: Express) {
	const getDir = path.join(__dirname, 'GET');
	registerRoutes(app, getDir, 'get');
}

export async function registerDELETEEndpoints(app: Express) {
	const deleteDir = path.join(__dirname, 'DELETE');
	registerRoutes(app, deleteDir, 'delete');
}

export async function registerEndpoints(app: Express) {
	registerDELETEEndpoints(app);
	registerGETEndpoints(app);
	registerPOSTEndpoints(app);
}
