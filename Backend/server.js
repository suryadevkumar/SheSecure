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
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true, // Allow credentials (cookies)
  },
});

app.use(express.json());

// Enable CORS for frontend to allow credentials
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true, // Allow cookies to be included
  })
);

// Create session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'my_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false, // set to false for development since you are using http.
    sameSite: 'lax', // or 'strict'
  },
});

// Apply the session middleware for both Express and Socket.IO
app.use(sessionMiddleware);

// Socket.IO session sharing
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
