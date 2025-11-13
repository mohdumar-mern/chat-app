import express from 'express';
import cors from 'cors'
import http from 'http'
import { Server} from 'socket.io'

import authRoutes from './routes/authRoutes.js'

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ Use Auth Routes
app.use('/api/v1', authRoutes);


// ✅ Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // or your frontend URL e.g. "http://localhost:3000"
    methods: ['GET', 'POST'],
  },
});


// ✅ Socket.IO connection event
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  
  // Listen for messages from client
  socket.on('send_message', (data) => {
    console.log('📩 Message received:', data);
    
    // Send message to a specific room or all clients
    io.emit('receive_message', data);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});


export default server;