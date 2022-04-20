import express from 'express';
import bodyParser from 'body-parser';

import { client } from "./cache/database.js";
import userRouter from "./routes/user.js";
import tokenRouter from "./routes/token.js";
import messageRouter from "./routes/message.js";


const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(userRouter);
app.use(tokenRouter);
app.use(messageRouter);

const port = 3003

// Connects to the database
app.listen(port, async () => {
    console.log(`Example app listening on port ${port}!`)
})

// Close the connection when the application ends
process.on("exit", () => {
    client.close()
});

// Close the connection when the application is interrupted
process.on("SIGINT", () => {
    client.close()
});