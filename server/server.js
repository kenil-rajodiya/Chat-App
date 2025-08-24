import express from "express"
import { Server } from 'socket.io'
import 'dotenv/config'
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.router.js";
import messageRouter from "./routes/message.router.js";
import groupRouter from "./routes/group.router.js"
import groupMessageRouter from "./routes/groupMessage.router.js"

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: "https://chat-app-frontend-ten-eta.vercel.app"
    },
    pingInterval: 25000,
    pingTimeout: 60000
})

export const userSocketMap = {}; // {userId : socketId}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);
    if (userId) {
        userSocketMap[userId] = socket.id
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("sendGroupMessage", (message) => {
        console.log("New group message received", message);
        io.to(message.groupId).emit("receiveGroupMessage", message);
    });

    socket.on("joinGroup", (groupId) => {
        console.log(`User joined group room  ${groupId}`);
        socket.join(groupId);
    })

    socket.on("leaveGroup", (groupId) => {
        console.log(`User left  group room :  ${groupId}`);
        socket.leave(groupId);
    })
})

app.use(express.json({ limit: "4mb" }))
app.use(cors())

app.use("/api/status", (req, res) => {
    res.send("Server is running")
})

app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter)
app.use('/api/group', groupRouter);
app.use('/api/group-messages', groupMessageRouter)

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default server;
