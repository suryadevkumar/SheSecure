import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import ioSession from 'express-socket.io-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { cloudinaryConnect } from './config/cloudinary.js';
import connectDB from './config/connection.js';
import authRoutes from './routes/User.js';
import sosRoutes from './routes/SOS.js';
import locationRoutes from './routes/LocationHistory.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(
  fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp",
  })
)

cloudinaryConnect();

// 🛠 **SESSION SETUP WITH MONGODB STORAGE**
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
io.use(ioSession(sessionMiddleware, { autoSave: true }));

// 🛠 **SOCKET.IO MIDDLEWARE TO CHECK SESSION**
io.use((socket, next) => {
  if (!socket.request.session) {
    return next(new Error("Session not found"));
  }

  const user = socket.request.session.user;
  if (user) {
    socket.userId = user.id;
    next();
  } else {
    next(new Error("Authentication error"));
  }
});

// 🛠 **TEST SESSION ROUTES**
app.get('/test-session', (req, res) => {
  req.session.test = "Session is working";
  res.send("Session set!");
});

app.get('/check-session', (req, res) => {
  res.send(req.session);
});

// 🛠 **API ROUTES**
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/location', locationRoutes);

const port = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("User connected to SOS system");

  socket.on("updateLocation", ({ reportId, latitude, longitude }) => {
    if (!reportId || !latitude || !longitude) {
      return socket.emit("error", { message: "Invalid location data" });
    }

    if (!global.activeSOS?.[reportId]) {
      return socket.emit("error", { message: "SOS not active" });
    }

    const newLocation = { 
      latitude, 
      longitude, 
      timestamp: new Date() 
    };

    global.activeSOS[reportId].locations.push(newLocation);

    // Broadcast to all clients in this SOS room
    io.to(reportId).emit("locationUpdate", newLocation);
    io.to(reportId).emit("pathUpdate", global.activeSOS[reportId].locations);
  });

  socket.on("joinSOS", (reportId) => {
    if (!reportId) return;
    
    socket.join(reportId);
    console.log(`User joined SOS room ${reportId}`);

    // Send current locations if available
    if (global.activeSOS?.[reportId]) {
      socket.emit("pathUpdate", global.activeSOS[reportId].locations);
      socket.emit("statusUpdate", { 
        status: "active",
        startTime: global.activeSOS[reportId].startTime
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

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
