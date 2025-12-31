import { DataSource } from "typeorm";
import path from "path";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "postgres", // Ime servisa iz docker-compose
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "chat_db",
    synchronize: true,
    logging: true,
    // Ovako ce TypeORM sam naci entitete u dist folderu bez importa
    entities: [path.join(__dirname, "..", "entities", "**", "*.js")],
    migrations: [],
    subscribers: [],
});