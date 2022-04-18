import fs from 'fs';
import { Collection, Db, MongoClient } from "mongodb";

import config from "../config.json" assert {type: "json"};


// Checks if config file exists
if (!fs.existsSync('./dist/config.json')) {
    console.error('config.json not found');
    process.exit(1);
}

// In case no config is set
if (config.username === "" || config.password === "") {
    console.error("Please set your username and password in config.json");
    process.exit(1);
}

// Sets up the database connection
const url = `mongodb+srv://${config.username}:${config.password}@main.mnabi.mongodb.net/test`;
const client = new MongoClient(url);
const dbName = "Yacc";
let db: Db;
let users: Collection;
let tokens: Collection;

await client.connect();
db = client.db(dbName);
users = db.collection("Users");
tokens = db.collection("Tokens");

export { client, db, users, tokens };