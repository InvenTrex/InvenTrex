import * as db from './database/database';
import { Logger } from './util/logger';
import { config } from 'dotenv';
import http from 'http';
import https from 'https';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { registerEndpoints } from './api';

const app = express();

async function preInit() {
	if (process.argv.includes('dev')) {
		await config();
	}
}

async function init() {
	await preInit()
	await db.connectDB();

	await registerEndpoints(app);

	const port = process.env.WEB_PORT || 3000;
	const useSSL = process.env.USE_SSL === 'true';

	if (useSSL) {
		const keyPath = path.join(__dirname, '/data/keys/ssl-key.pem');
		const certPath = path.join(__dirname, '/data/keys/ssl-cert.pem');

		if (!checkFilesExist(keyPath, certPath)) {
			Logger.severe(
				'HTTPS',
				'SSL certificate files are missing. Please add them to the keys directory in the data folder specified in your docker-compose file.',
			);
			process.exit(1);
		}

		const key = fs.readFileSync(keyPath, 'utf8');
		const cert = fs.readFileSync(certPath, 'utf8');
		const credentials = { key, cert };

		https.createServer(credentials, app).listen(port, () => {
			Logger.info(
				'HTTPS',
				`Server is running on https://localhost:${port}`,
			);
		});
	} else {
		http.createServer(app).listen(port, () => {
			Logger.info(
				'HTTP',
				`Server is running on http://localhost:${port}`,
			);
		});
	}
}

// Function to check if files exist
function checkFilesExist(...filePaths: string[]): boolean {
	return filePaths.every((filePath) => fs.existsSync(filePath));
}

init();
