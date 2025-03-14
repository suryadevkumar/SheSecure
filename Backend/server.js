import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import ioSession from 'express-socket.io-session';
import cors from 'cors';
import connectDB from './config/connection.js';
import authRoutes from './routes/User.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'my_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    },
});

app.use(sessionMiddleware);

io.use(ioSession(sessionMiddleware, { autoSave: true }));

app.use('/api/auth', authRoutes);

connectDB();

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send(`
        <p style="color: rgb(0, 255, 55);
                text-align: center;
                font-size: 100px;
                margin-top: 30px;">Server is running on PORT ${port}</p>
    `);
});

server.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
});