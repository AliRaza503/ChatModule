const socketIO =  (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        socket.on('setup', (userId) => {
            socket.join(userId);
            socket.emit('connected');
            console.log('User connected to socket with id:', userId);
        });

        socket.on('join room', (room) => {
            socket.join(room);
            console.log('User joined room:', room);
        });

        socket.on('new message', (newMessageReceived) => {
            try {
                const sender = newMessageReceived.message.sender;
                const recipient = newMessageReceived.message.recipient;
                // Ensure sender and recipient exist
                if (sender && recipient) {
                    socket.to(recipient._id).emit('message received', newMessageReceived);
                }
            } catch (error) {
                console.error('Error handling new message event:', error);
            }
        });
    });
};

module.exports = socketIO;