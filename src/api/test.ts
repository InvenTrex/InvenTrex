import { Request, Response, Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import { Logger } from '../util/logger';

const router = Router();
router.get('/', async (req: Request, res: Response) => {
	await safe(req, res).catch((error) => {
		Logger.severe('API - Test', error);
	});
});

async function safe(req: Request, res: Response) {
    res.status(200).send("Hello World");
}


export {
    router
};
