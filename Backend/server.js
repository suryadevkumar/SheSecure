import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';
import session from 'express-session';
import cors from 'cors';

import authRoutes from './routes/User';
import connectDB from './db/connection';

const app = express();
const server=http.createServer(app);
const io=new Server(server);

dotenv.config();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "my_secret_key",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 5 * 60 * 1000 },
    })
);
app.use('/api/auth',authRoutes);

connectDB();

app.get('/', (req, res) => {
    res.send(`<p style="color: rgb(0, 255, 55);
        text-align: center;
        font-size: 100px;
        margin-top: 30px;">Server is running on PORT 5000</p>`);
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
});