import { Logger } from '../util/logger';
import { Database } from './dataclass';

let database: Database;

export async function connectDB() {
	const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

	database = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	await database.connect();
	await checkTables();
}

async function checkTables() {
	Logger.info('Database', 'Checking Tables...');
	const connection = await getConnection();

	const tableQueries = [
		`CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            username VARCHAR(255) NOT NULL UNIQUE, 
            password VARCHAR(255) NOT NULL, 
            role VARCHAR(255) NOT NULL
        );`,
		`CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            name VARCHAR(255) NOT NULL UNIQUE, 
            hash CHAR(64) NOT NULL
        );`,
		`CREATE TABLE IF NOT EXISTS items (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            name VARCHAR(255) NOT NULL, 
            hash CHAR(64) NOT NULL, 
            serialNumber VARCHAR(100) NOT NULL UNIQUE, 
            category INT NOT NULL, 
            inventoryId INT NOT NULL, 
            booked BOOLEAN DEFAULT FALSE, 
            FOREIGN KEY (category) REFERENCES categories(id)
        );`,
	];

	for (const query of tableQueries) {
		await connection.query(query);
	}

	Logger.info('Database', 'Tables Checked and Created!');
}

export const getConnection = async () => database.getConnection();
