import express from 'express';
import asynchHandler from "express-async-handler"
import { tokens, users } from "../cache/database.js";

interface User {
    name: string;
    id: string;
}

interface Users extends Array<User> { }

const router = express.Router();

//Gets a specific User
router.get("/user", asynchHandler(async (req, res) => {
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


//Gets list of Users
router.get('/users', asynchHandler(async (req, res) => {
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

export default router;