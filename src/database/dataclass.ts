import mysql from 'mysql2/promise';
import { Logger } from '../util/logger';

export class Database {
    private static instance: Database;
    private connection: mysql.Connection | null = null;

    private host: string;
    private user: string;
    private password: string;
    private database: string;

    constructor(host: string, user: string, password: string, database: string) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.database = database;
    }

    private async createDatabase() {
        Logger.info("Database", "Database does not exist. Creating database...");
        const tempConnection = await mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password
        });

        try {
            await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${this.database}\``);
            Logger.info("Database", "Database created successfully.");
        } catch (error) {
            Logger.severe("Database", "Error creating database: " + error.message);
            throw error;
        } finally {
            await tempConnection.end();
        }
    }

    async connect() {
        try {
            await this.createDatabase();
            this.connection = await mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database
            });
            Logger.info("Database", "Connection successful!");

        } catch (error) {
            Logger.severe("Database", "Connection failed: " + error.message);
            throw error;
        }
    }

    async getConnection() {
        if (!await this.checkConnection()) await this.connect();
        return this.connection;
    }

    private async checkConnection(): Promise<boolean> {
        if (!this.connection) return false;
        try {
            await this.connection.query("SELECT 1");
            return true;
        } catch {
            return false;
        }
    }
}
