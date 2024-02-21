const express = require("express");
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: "http://localhost:3000",
    }
});

io.on("connection", (socket) =>{
    console.log("CONNECTED:", socket.id)

    socket.on("test", ()=>{
        console.log("test function called!")
    })

    socket.on("insertDrawing", (object)=>{
        socket.broadcast.emit("updateDrawings", object)
    })
})

server.listen(3001, () => {
    console.log("SERVER RUNNING")
});