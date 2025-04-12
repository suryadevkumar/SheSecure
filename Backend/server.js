import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { Server } from 'socket.io';
import { cloudinaryConnect } from './config/cloudinary.js';
import connectDB from './config/connection.js';
import authRoutes from './routes/User.js';
import sosRoutes from './routes/SOS.js';
import locationRoutes from './routes/Location.js';
import chatRoutes from './routes/Counselling.js';
import crimeRoutes from './routes/CrimeReport.js';
import chatSocket from './utils/chatSocket.js';
import sosSocket from './utils/sosSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();
cloudinaryConnect();

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  })
);

// Handle OPTIONS requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Session setup with MongoDB storage
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'my_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  },
});

app.use(sessionMiddleware);

// Create namespaces for different features
const chatNamespace = io.of('/chat');
const sosNamespace = io.of('/sos');

// Wrap middleware for Socket.IO
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// Apply session middleware to namespaces
chatNamespace.use(wrap(sessionMiddleware));
sosNamespace.use(wrap(sessionMiddleware));

// Set up both socket handlers with their own namespaces
chatSocket(chatNamespace);
sosSocket(sosNamespace);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/crime', crimeRoutes);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <p style="color: rgb(0, 255, 55); text-align: center; font-size: 100px; margin-top: 30px;">
      Server is running on PORT ${port}
    </p>
  `);
});

server.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});