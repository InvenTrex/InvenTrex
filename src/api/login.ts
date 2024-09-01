import { Request, Response, Router } from 'express';
import { getConnection } from '../database/database';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Logger } from '../util/logger';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
	await safe(req, res).catch((error) => {
		Logger.severe('API - Login', error);
	});
});

async function safe(req: Request, res: Response) {
	if (!req.body) {
		return res.status(400).json({
			error: 'Invalid request body',
		});
	}

	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({
			error: 'Username and password are required',
		});
	}

	try {
		if (username === 'admin') {
			const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
			if (!adminPasswordHash) {
				return res.status(500).json({
					error: 'Server configuration error',
				});
			}

			const isCorrect = await bcrypt.compare(password, adminPasswordHash);
			if (!isCorrect) {
				return res.status(401).json({
					error: 'Invalid credentials',
				});
			}

			const token = jwt.sign(
				{
					username: 'admin',
					userid: '0',
				},
				process.env.JWT_SECRET!,
				{
					expiresIn: '30d',
				},
			);

			return res.status(200).json({
				token,
				permissionLevel: 'admin',
			});
		}

		const connection = await getConnection();
		const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);

		// @ts-ignore
		if (!rows || rows.length === 0) {
			return res.status(401).json({
				error: 'Invalid credentials',
			});
		}

		// @ts-ignore
		const user = rows[0] as {
			id: string;
			username: string;
			password: string;
			role: string;
		};
		const isAuthorised = await bcrypt.compare(password, user.password);

		if (!isAuthorised) {
			return res.status(401).json({
				error: 'Invalid credentials',
			});
		}

		const token = jwt.sign(
			{
				username,
				userid: user.id,
			},
			process.env.JWT_SECRET!,
			{
				expiresIn: '30d',
			},
		);

		return res.status(200).json({
			token,
			permissionLevel: user.role,
		});
	} catch (error) {
		return res.status(500).json({
			error: 'Internal server error',
		});
	}
}

export { router };
