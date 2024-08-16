const express = require('express')
const { createServer } = require('node:http');
const cors = require('cors')
const { Server } = require('socket.io')
const options = {
    origin: "*",
    credentials: true
}
const app = express(cors(options));
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*"
    },
  });  

io.on('connection', (socket) =>{
    console.log('Socket connected', socket.id);
    socket.on("join-room", (data, callback) => {
        if (socket.room) {
          console.error("Socket is already in a room!");
          if (typeof callback === 'function') {
            callback({ success: false, error: "Already in a room" });
          }
          return;
        }
    
        if (io.sockets.adapter.rooms.get(data.room)) {
          socket.join(data.room);
          socket.name = data.name;
          socket.room = data.room;
          console.log(`User ${data.name} joined room: ${data.room}`);
    
          if (typeof callback === 'function') {
            callback({ success: true, room: data.room });
          }
          io.emit('user-join', { id: socket.id, name: socket.name });
        } else {
          console.error(`Attempted to join non-existent room: ${data.room}`);
          if (typeof callback === 'function') {
            callback({ success: false, error: "Room does not exist" });
          }
        }
      });
    
      // Handle chat messages
      socket.on("chat message", (msg) => {
        console.log(`Message received: ${msg} by user ${socket.name}`);
        if (socket.room) {
          io.to(socket.room).emit("chat message", { msg, name: socket.name });
        } else {
          console.error("Socket is not in any room!");
        }
      });
    
      // Handle creating a room
      socket.on("create-room", (data, callback) => {
        if (socket.room) {
          console.error("Socket is already in a room!");
          if (typeof callback === 'function') {
            callback({ success: false, error: "Already in a room" });
          }
          return;
        }
    
        const room = `room_${Math.random().toString(36).substr(2, 9)}`;
        socket.join(room);
        socket.name = data.name;
        socket.room = room;
        console.log("create socket id", socket.id)
        console.log(`Room created: ${room}`); 
        if (typeof callback === 'function') {
          callback({ success: true, room });
        }
      });
      socket.on("disconnect", () => {
        console.log(`Socket Disconnected: ${socket.id}`);
        const room = socket.room;
        if (room) {
          io.to(room).emit("user-left", { name: socket.name });
          socket.leave(room);
          console.log(`Socket left room: ${room}`);
        }
      });
})

server.listen(3000, ()=>{
    console.log('Server listening on port 3000');
})