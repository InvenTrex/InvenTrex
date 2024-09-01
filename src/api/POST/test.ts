import { Request, Response } from 'express';

export async function execute(req: Request, res: Response) {
	return res.send('Hello World!');
}
