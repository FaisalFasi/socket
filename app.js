import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let onlineUsers = [];
console.log("Server started on port 4000");

const addUser = (userId, socketId) => {
  const userExist = onlineUsers.find((u) => u.userId === userId);
  if (!userExist) {
    onlineUsers.push({ userId, socketId });
  }
};
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    console.log("REceiverID", receiverId, data);

    const receivedUser = getUser(receiverId);
    if (!receivedUser) {
      console.log(`User with ID ${receiverId} not found.`);
      return; // Exit early if user is not found
    }
    console.log("Received User:", receivedUser);
    console.log("Data:", data);

    if (receivedUser.socketId) {
      io.to(receivedUser.socketId).emit("getMessage", data);
    } else {
      console.log(`Socket ID not found for user with ID ${receiverId}`);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen(process.env.PORT || 4000);
