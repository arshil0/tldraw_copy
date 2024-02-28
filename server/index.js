//to start the server, open the "server" directory in the terminal and run "node index.js"

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

var players = [];

io.on("connection", (socket) =>{
    players.push(socket)
    console.log("CONNECTED:", socket.id)
    if(players.length > 1)
        players[0].emit("requestCanvas");
    

    socket.on("sendCanvas", (canvas) =>{
        socket.broadcast.emit("initializeCanvas", canvas);
    })

    socket.on("test", ()=>{
        console.log("test function called!")
    })

    socket.on("insertDrawing", (object)=>{
        socket.broadcast.emit("updateDrawings", object);
    })

    socket.on("eraseDrawing", (index) =>{
        socket.broadcast.emit("eraseObject", index);
    })

    //given a dictionary of (index: object) send this dictionary to adjust objects at current indices (resizing, dragging, etc..)
    socket.on("adjustDrawings", (objects, indices) =>{
        socket.broadcast.emit("adjustObjects", objects, indices);
    })

    socket.on("disconnect", () =>{
        console.log("DISCONNECTED:", socket.id);
        players.splice(players.indexOf(socket), 1);
    })
})

server.listen(3001, () => {
    console.log("SERVER RUNNING")
});