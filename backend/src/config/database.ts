import { DataSource } from "typeorm";
import path from "path";

export const AppDataSource = new DataSource({
    type: "postgres",
    // Ovde kažemo: uzmi iz ENV-a, a ako ne postoji, koristi 'localhost'
    host: process.env.DB_HOST || "localhost", 
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "chat_db",
    synchronize: true,
    logging: true,
    
    // Dodajemo i SSL opciju jer Cloud baze (Render/Azure) to često zahtevaju
    ssl: process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "postgres" 
         ? { rejectUnauthorized: false } 
         : false,

    entities: [path.join(__dirname, "..", "entities", "**", "*.js")],
    migrations: [],
    subscribers: [],
});