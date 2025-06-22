import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST']
  }
});

const rooms = {};

io.on('connection', (socket) => {
  socket.on('join', ({ room }) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(socket.id);
    const opponentId = rooms[room].find(id => id !== socket.id);
    const waiting = rooms[room].length < 2;
    socket.emit('joined', { waiting, opponentId });
    if (opponentId) {
      socket.to(room).emit('joined', { waiting: false, opponentId: socket.id });
      io.to(room).emit('start');
    }
  });

  socket.on('progress', ({ room, text }) => {
    socket.to(room).emit('opponent-progress', { text });
  });

  socket.on('finished', ({ room }) => {
    socket.to(room).emit('opponent-finished');
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (rooms[room]) {
        rooms[room] = rooms[room].filter(id => id !== socket.id);
        socket.to(room).emit('opponent-left');
        if (rooms[room].length === 0) delete rooms[room];
      }
    }
  });
});

const PORT = 4000;
const HOST = '0.0.0.0'; // Accept connections from all network interfaces
server.listen(PORT, HOST, () => {
  console.log(`Socket.io server running at http://192.168.1.4:${PORT}`);
});
