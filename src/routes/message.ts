import crypto from 'crypto';
import express from 'express';
import asynchHandler from "express-async-handler"
import { tokens, messages } from "../cache/database.js";
import { tokenForm } from '../cache/globals.js';

const router = express.Router();

interface Message {
    messageId: string;
    content: string;
    sent: string;
    author: string;
}

interface Messages extends Array<Message> { }

// Get all messages
router.get("/messages", asynchHandler(async (req, res) => {
    const token = req.query.apiToken;
    if (!token) {
        res.status(400).send("No apiToken provided");
        return;
    }
    const permission = (await tokens.findOne({ apiToken: token }));
    if (!permission) {
        res.status(400).send("Invalid apiToken");
        return;
    }
    if (!permission.permissions.getMessages) {
        res.status(401).send("Unauthorized");
        return;
    }

    const texts = await messages.find({}).toArray();
    const allMessages: Messages = texts.map(text => { return { messageId: text.messageId, content: text.content, sent: text.sent, author: text.author } });
    res.send(allMessages);
}));

//Get a specific message
router.get("/message", asynchHandler(async (req, res) => {
    const token = req.query.apiToken;
    if (!token) {
        res.status(400).send("No apiToken provided");
        return;
    }
    const permission = (await tokens.findOne({ apiToken: token }));
    if (!permission) {
        res.status(400).send("Invalid apiToken");
        return;
    }
    if (!permission.permissions.getMessage) {
        res.status(401).send("Unauthorized");
        return;
    }
    const messageId = req.query.messageId;
    if (!messageId) {
        res.status(400).send("No messageId provided");
        return;
    }
    const message = await messages.findOne({ id: messageId });
    if (!message) {
        res.status(404).send("Message not found");
        return;
    }
    const messageObj: Message = { messageId: message.id, content: message.content, sent: message.sent, author: message.author };
    res.send(messageObj);
}));

//Create a new message
router.post("/message", asynchHandler(async (req, res) => {
    const token = req.body.apiToken;
    if (!token) {
        res.status(400).send("No apiToken provided");
        return;
    }
    if (!tokenForm.test(token.toString())) {
        res.status(400).send("Invalid apiToken");
        return;
    }
    const permission = (await tokens.findOne({ apiToken: token }));
    if (!permission) {
        res.status(400).send("Invalid apiToken");
        return;
    }
    if (!permission.permissions.sendMessage) {
        res.status(401).send("Unauthorized");
        return;
    }
    const content = req.body.content;
    if (!content) {
        res.status(400).send("No content provided");
        return;
    }
    const author = req.body.author;
    if (!author) {
        res.status(400).send("No author provided");
        return;
    }
    const messageId = crypto.randomBytes(32).toString('hex');
    const message = { author: author, content: content, sent: new Date(), messageId: messageId };
    await messages.insertOne(message);
    res.send(message);
}));

export default router;