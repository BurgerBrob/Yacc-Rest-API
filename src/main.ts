import fs from 'fs';
import express from 'express';
import { Collection, Db, MongoClient } from "mongodb";
import asynchHandler from "express-async-handler"

// Checks if config file exists
if (!fs.existsSync('./dist/config.json')) {
    console.error('config.json not found');
    process.exit(1);
}
import { username, password } from "./config.json";

// In case no config is set
if (username === "" || password === "") {
    console.error("Please set your username and password in config.json");
    process.exit(1);
}

const app = express()
const port = 3000

// Sets up the database connection
const url = `mongodb+srv://${username}:${password}@main.mnabi.mongodb.net/test`;
const client = new MongoClient(url);
const dbName = "Yacc";
let db: Db;
let users: Collection;
let tokens: Collection;

// Connects to the database
app.listen(port, async () => {
    await client.connect();
    db = client.db(dbName);
    users = db.collection("Users");
    tokens = db.collection("Tokens");
    console.log(`Example app listening on port ${port}!`)
})

interface User {
    name: string;
    id: string;
}

interface Users extends Array<User> { }


//Gets list of Users
app.get('/users', asynchHandler(async (req, res) => {
    const token = req.query.apiToken || "";
    if (token == "") {
        res.status(401).send("No API token provided");
        return;
    }
    if (token == "") {
        res.status(400).send("No apiToken provided");
        return;
    }
    const permission = (await tokens.findOne({ apiToken: token }));
    if (!permission) {
        res.status(400).send("Invalid apiToken");
        return;
    }
    if (!permission.permissions.getUser) {
        res.status(401).send("Unauthorized");
        return;
    }
    const user = await users.find({}).toArray();
    const allUser: Users = user.map(u => { return { name: u.name, id: u.id } });
    res.send(allUser);
}));

//Gets a specific User
app.get("/user", asynchHandler(async (req, res) => {
    const token = req.query.apiToken || "";
    if (token == "") {
        res.status(400).send("No apiToken provided");
        return;
    }
    const permission = (await tokens.findOne({ apiToken: token }));
    if (!permission) {
        res.status(400).send("Invalid apiToken");
        return;
    }
    if (!permission.permissions.getUser) {
        res.status(401).send("Unauthorized");
        return;
    }
    const userId = req.query.userId || "";
    if (userId == "") {
        res.status(400).send("No userId provided");
        return;
    }
    const user = await users.findOne({ id: userId });
    if (!user) {
        res.status(404).send("User not found");
        return;
    }
    res.send({
        id: user.id,
        name: user.name
    });
}));

// TODO: make this actually work
// app.post("/token", asynchHandler(async (req, res) => {
//     const body = req.body();
//     console.log(body);
//     const token = req.query.apiToken || "";
//     if (token == "") {
//         res.status(401).send("Unauthorized");
//         return;
//     }
//     const getUser = req.query.getUser || false;
//     const createUser = req.query.createUser || false;
//     const name = req.query.name || "";
//     if (name == "") {
//         res.status(400).send("Bad Request");
//         return;
//     }
//     await tokens.insertOne({
//         apiToken: token,
//         permissions: {
//             getUser: getUser,
//             createUser: createUser
//         },
//         name: name
//     });
// }));

// Close the connection when the application ends
process.on("exit", () => {
    client.close()
    console.log("test");
});