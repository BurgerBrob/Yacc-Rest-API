import express from 'express';
import asynchHandler from "express-async-handler"
import { tokens } from "../cache/database.js";
import { tokenForm } from '../cache/globals.js';

const router = express.Router();

interface Permission {
    getUser: boolean;
    getUsers: boolean;
    createUser: boolean;
    addToken: boolean;
    getToken: boolean;
    getTokens: boolean;
    sendMessage: boolean;
    getMessage: boolean;
    getMessages: boolean;
}

interface Token {
    name: string;
    permissions: Permission;
    apiToken: string;
}

router.post("/token", asynchHandler(async (req, res) => {
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
        getUsers: req.body.getUsers == "true" || req.body.admin == "true",
        createUser: req.body.createUser == "true" || req.body.admin == "true",
        addToken: req.body.addToken == "true" || req.body.admin == "true",
        getToken: req.body.getToken == "true" || req.body.admin == "true",
        getTokens: req.body.getTokens == "true" || req.body.admin == "true",
        sendMessage: req.body.createMessage == "true" || req.body.admin == "true",
        getMessage: req.body.getMessage == "true" || req.body.admin == "true",
        getMessages: req.body.getMessages == "true" || req.body.admin == "true",
    }

    const newEntry: Token = {
        name: newName,
        permissions: newPermission,
        apiToken: newToken
    }
    tokens.insertOne(newEntry);
    res.sendStatus(200);
}));

export default router;