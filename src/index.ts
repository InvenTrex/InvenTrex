import * as db from './database/database';
import { Logger } from './util/logger';
import { config } from 'dotenv';

async function preInit() {
    if (process.argv.includes("dev")) {
        await config();
    }
}

async function init() {
    await preInit();
    await db.connectDB();
}

init();