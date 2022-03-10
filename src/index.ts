import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import { Message, OpenChatRequest, User } from "./typings";
import dotenv from 'dotenv'

process.env.NODE_ENV !== "production" && dotenv.config()

const { ATLAS_URL, PORT } = process.env

const app = express();
const server = createServer(app);
const io = new Server(server, { allowEIO3: true });

app.use(cors())

let onlineUsers: User[] = []

io.on("connection", socket => {
    console.log(socket.id)

    socket.join("main-room")
    console.log(socket.rooms)

    socket.on("setUsername", ({ username }: User) => {
        console.log("here")
        onlineUsers =
            onlineUsers
                .filter(user => user.username !== username)
                .concat({
                    username,
                    id: socket.id
                })
        console.log(onlineUsers)

        socket.emit("loggedin")

        socket.broadcast.emit("newConnection")

    })

    socket.on("sendmessage", (message: Message) => {
        // io.sockets.in("main-room").emit("message", message)
        socket.to("main-room").emit("message", message)

        // saveMessageToDb(message)
    })

    socket.on("openChatWith", ({ recipientId, sender }: OpenChatRequest) => {
        console.log("here")
        socket.join(recipientId)
        socket.to(recipientId).emit("message", { sender, text: "Hello, I'd like to chat with you" })
    })

    socket.on("disconnect", () => {
        console.log("Disconnected socket with id " + socket.id)

        onlineUsers = onlineUsers.filter(user => user.id !== socket.id)

        socket.broadcast.emit("newConnection")

    })

});

app.get("/online-users", (req, res) => {
    res.send({ onlineUsers })
})

server.listen(PORT, () => {
    console.log("Server listening on port " + PORT)
});
