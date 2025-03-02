import express from 'express';
import dotenv from 'dotenv';

import connectDB from './db/connection.js';

const app = express();
dotenv.config();

connectDB();

app.get('/', (req, res) => {
    res.send(`<p style="color: rgb(0, 255, 55);
        text-align: center;
        font-size: 100px;
        margin-top: 30px;">Server is running on PORT 5000</p>`);
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
});
