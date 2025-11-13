require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const messagesRoutes = require('./routes/messages');

const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/conversations', messagesRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// In-memory map userId -> socketId (helps multi-instance approaches should use Redis)
const onlineUsers = new Map();

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

const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => console.log(`Server listening ${PORT}`));
});
