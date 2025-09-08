import { Client } from "pg";
import { config } from "./config.js";

export let client = undefined;

export async function initializeDB() {
  client = new Client({
    connectionString: config.env.DATABASE_URL,
    ssl: false,
  });
  await client.connect();
}

export async function closeDB() {
  await client.end();
}
