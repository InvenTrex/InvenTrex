import { Database } from "./dataclass";

export let database: Database;

export async function connectDB() {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const pass = process.env.DB_PASS;
    const name = process.env.DB_NAME;

    database = await new Database(host, user, pass, name);
    await database.connect();
}

export const getConnection = async () => {
    return await database.getConnection();
}