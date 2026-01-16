import { DataSource } from "typeorm";
import path from "path";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "postgres", 
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "chat_db",
    synchronize: true,
    logging: true,
    
    entities: [path.join(__dirname, "..", "entities", "**", "*.js")],
    migrations: [],
    subscribers: [],
});