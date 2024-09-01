import { Request, Response, Router } from 'express';
import { verifyToken } from '../../middlewares/authMiddleware';
import { Logger } from '../../util/logger';

const router = Router();
router.post('/', verifyToken, async (req: Request, res: Response) => {
	await safe(req, res).catch((error) => {
		Logger.severe('API - User Create', error);
	});
});

async function safe(req: Request, res: Response) {}

export {
    router
};