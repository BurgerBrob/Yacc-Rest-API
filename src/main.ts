import fs from 'fs';
import express from 'express';
import { Collection, Db, MongoClient } from "mongodb";
import asynchHandler from "express-async-handler"
import bodyParser from 'body-parser';

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
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000

// Sets up the database connection
const url = `mongodb+srv://${username}:${password}@main.mnabi.mongodb.net/test`;
const client = new MongoClient(url);
const dbName = "Yacc";
let db: Db;
let users: Collection;
let tokens: Collection;

const tokenForm = /^[0-9a-f]{32}$/;

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

interface Permission {
    getUser: boolean;
    createUser: boolean;
    addToken: boolean;
}

interface Token {
    name: string;
    permission: Permission;
    apiToken: string;
}


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
    const userObj: User = { name: user.name, id: user.id };
    res.send(userObj);
}));

// TODO: make this actually work
app.post("/token", asynchHandler(async (req, res) => {
    // console.log('Got body:', req.body);
    const token = req.body.apiToken;

    if (!token) {
        res.statusMessage = "No apiToken provided";
        res.status(400).end();
        return;
    }
    // Check if the token is a valid token with length 32 and only contains hexadecimal characters
    if (!tokenForm.test(token)) {
        res.sendStatus(400);
        return;
    }
    const permission = (await tokens.findOne({ apiToken: token }));
    if (!permission || !permission.permissions.addToken) {
        res.sendStatus(401);
        return;
    }
    const newToken = req.body.newToken;
    //Check if newToken fits the form
    if (!tokenForm.test(newToken) || !newToken) {
        res.sendStatus(400);
        return;
    }
    //Check if newToken is already in use
    const tokenExists = await tokens.findOne({ apiToken: newToken });
    if (tokenExists) {
        res.sendStatus(400);
        return;
    }
    const newName = req.body.newName;
    if (!newName) {
        res.sendStatus(400);
        return;
    }
    const newPermission: Permission = {
        getUser: req.body.getUser == "true" || req.body.admin == "true",
        createUser: req.body.createUser == "true" || req.body.admin == "true",
        addToken: req.body.addToken == "true" || req.body.admin == "true"
    }
    const newEntry: Token = {
        name: newName,
        permission: newPermission,
        apiToken: newToken
    }
    tokens.insertOne(newEntry);
    res.sendStatus(200);
}));

// Close the connection when the application ends
process.on("exit", () => {
    client.close()
});