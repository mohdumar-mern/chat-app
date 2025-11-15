import express from 'express';
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import messagesRoutes from './routes/messageRoutes.js'

import User from './models/userModels.js';
import Conversation from './models/conversationModel.js';
import Message from './models/messageModel.js';

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ exact frontend URL
    credentials: true, // ✅ allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))
app.use(cookieParser());



// ✅ Use Auth Routes
app.use('/api/v1', authRoutes);
app.use('/api/v1/', userRoutes);
app.use('/conversations', messagesRoutes);

// ✅ Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // or your frontend URL e.g. "http://localhost:3000"
    methods: ['GET', 'POST'],
  },
});

// In-memory store for online users
const onlineUsers = new Map();


// ✅ Socket.IO connection event
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  // client emits "user:online" after login with payload { userId }
  socket.on('user:online', async ({ userId }) => {
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { online: true, socketId: socket.id });
    io.emit('users:status', Array.from(onlineUsers.keys())); // broadcast list of online ids
  });

  socket.on('message:send', async (payload) => {
    // payload: { conversationId, senderId, text }
    const { conversationId, senderId, text } = payload;

    // persist message
    const message = new Message({ conversation: conversationId, sender: senderId, text });
    await message.save();

    // mark deliveredTo for participants that are online (excluding sender)
    const conversation = await Conversation.findById(conversationId).populate('participants', '_id');
    const recipients = conversation.participants.filter(p => String(p._id) !== String(senderId));
    const deliveredTo = [];

    for (const r of recipients) {
      const sid = onlineUsers.get(String(r._id));
      if (sid) {
        io.to(sid).emit('message:new', { message: await message.populate('sender', 'name avatar email') });
        deliveredTo.push(r._id);
      }
    }

    if (deliveredTo.length) {
      message.deliveredTo = deliveredTo;
      await message.save();
    }

    // broadcast new message to sender as well (so they can update UI)
    socket.emit('message:sent', { message });
  });

  socket.on('typing:start', ({ conversationId, userId }) => {
    // notify other participants
    socket.to(conversationId).emit('typing:start', { conversationId, userId });
  });

  socket.on('typing:stop', ({ conversationId, userId }) => {
    socket.to(conversationId).emit('typing:stop', { conversationId, userId });
  });

  socket.on('message:read', async ({ messageId, userId }) => {
    const message = await Message.findById(messageId);
    if (!message) return;
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
      // notify sender
      const sender = message.sender.toString();
      const sid = onlineUsers.get(sender);
      if (sid) io.to(sid).emit('message:read', { messageId, userId });
    }
  });

  socket.on('join:conversation', ({ conversationId }) => {
    socket.join(conversationId); // join room for typing notifications if desired
  });

  socket.on('disconnect', async () => {
    // find user by socketId
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, { online: false, socketId: null });
        io.emit('users:status', Array.from(onlineUsers.keys()));
        break;
      }
    }
    console.log('socket disconnected', socket.id);
  });



 
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});


export default server;