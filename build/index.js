"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var cors_1 = __importDefault(require("cors"));
var app = express_1.default();
var server = http_1.createServer(app);
var io = new socket_io_1.Server(server, { allowEIO3: true });
app.use(cors_1.default());
var onlineUsers = [];
io.on("connection", function (socket) {
    console.log(socket.id);
    socket.join("main-room");
    console.log(socket.rooms);
    socket.on("setUsername", function (_a) {
        var username = _a.username;
        console.log("here");
        onlineUsers =
            onlineUsers
                .filter(function (user) { return user.username !== username; })
                .concat({
                username: username,
                id: socket.id
            });
        console.log(onlineUsers);
        socket.emit("loggedin");
        socket.broadcast.emit("newConnection");
    });
    socket.on("sendmessage", function (message) {
        // io.sockets.in("main-room").emit("message", message)
        socket.to("main-room").emit("message", message);
        // saveMessageToDb(message)
    });
    socket.on("disconnect", function () {
        console.log("Disconnected socket with id " + socket.id);
        onlineUsers = onlineUsers.filter(function (user) { return user.id !== socket.id; });
        socket.broadcast.emit("newConnection");
    });
});
app.get("/online-users", function (req, res) {
    res.send({ onlineUsers: onlineUsers });
});
server.listen(3030, function () {
    console.log("Server listening on port 3030");
});
