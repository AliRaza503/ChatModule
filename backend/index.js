const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const mlRoutes = require('./routes/MLRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const http = require('http');
const socketIo = require('socket.io');
const socketHandler = require('./socketHandler');

dotenv.config(); 
connectDB();

const app = express();
app.use(bodyParser.json());
app.use(express.json()); // To allow the app to accept JSON data from client

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

// Use the external Socket.IO handler
socketHandler(io);

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/message', messageRoutes);
app.use('/score', mlRoutes);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
