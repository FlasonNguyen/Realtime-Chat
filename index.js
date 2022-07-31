const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const http = require("http");
const session = require("express-session");

const formatMessages = require("./utils/messages.js");
const {
  userJoin,
  getCurrentUser,
  leaveChat,
  getRoomUsers,
} = require("./utils/users");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

//--------------------------------GOOGLE LOGIN-----------------------------------

app.use(passport.initialize());
app.use(passport.session());

require("./oauth");

app.use("/auth/google", require("./route/google"));

//--------------------------------GOOGLE LOGIN-----------------------------------

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.use("/login", require("./route/login"));
app.use("/chatbox", require("./route/chatbox"));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit(
      "message",
      formatMessages("Tesse Bot", "Connection established.")
    );
    io.to(user.room).emit(
      "message",
      formatMessages("Tesse Bot", "A new user joined the chat.")
    );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chat-message", (msg) => {
    const user = getCurrentUser(socket.id);

    io.emit("message", formatMessages(user.name, msg));
  });
  socket.on("disconnect", () => {
    const user = leaveChat(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessages("Tesse Bot", `${user.username} left the chat.`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected");
    server.listen(process.env.PORT, () => {
      console.log("http://localhost:" + process.env.PORT);
    });
  })
  .catch((e) => console.log("Error: ", e));
