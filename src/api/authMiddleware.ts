import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.header('Authorization');
	if (!authHeader) {
		return res
			.status(401)
			.json({ error: 'Access denied, no token provided' });
	}

	const token = authHeader.replace('Bearer ', '').trim();
	if (!token) {
		return res
			.status(401)
			.json({ error: 'Access denied, invalid token format' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);
		if (
			typeof decoded === 'object' &&
			decoded !== null &&
			'userid' in decoded
		) {
			// @ts-ignore
			req.userid = (decoded as { userid: string }).userid;
		} else {
			return res.status(401).json({ error: 'Invalid token structure' });
		}
		next();
	} catch (error) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}
