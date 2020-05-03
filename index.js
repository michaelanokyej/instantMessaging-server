const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();

// Make the express server use sockets
const server = http.createServer(app);

// Create an instance of the socket
const io = socketio(server);

io.on("connection", socket => {
  console.log("we have a new connection!!!");

  socket.on("join", ({ name, room }, callback) => {
    // the addUser service returns either
    // an error property or a user property
    const { error, user } = addUser({ id: socket.id, name, room });

    // if there is an error, our callback fn will
    // dynamically use the error object from our service
    if (error) return callback(error);

    // send the new user a welcome message
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the ${user.room} room`
    });

    // Notify all users about the new user
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined the room!`
    });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  // NB: the admin generated message is "message"  and
  // the user generated message is "sendMessage"

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} left`
      });
    }
  });
});

app.use(router);
app.use(cors());

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
