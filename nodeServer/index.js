const { Server } = require("socket.io");

const io = new Server(8000, {
    cors: {
        origin: "http://127.0.0.1:5500", // <-- Allow this origin
        methods: ["GET", "POST"]
    }
});

const users = {};
const chatGroups = {};

io.on('connection', socket => {
    socket.on('new-user-joined', ({groupName, userName}) => {
        console.log("new user: ", userName);
        users[socket.id] = userName; 
        chatGroups[socket.id] = groupName;
        socket.join(groupName); // join the group room
        console.log(`${userName} joined group: ${groupName}`);
        socket.to(groupName).emit("user-joined", userName);
    })

    socket.on("send", ({groupName, message}) => {
        socket.to(groupName).emit("receive", {message: message, name: users[socket.id]})
    })

    socket.on("disconnect", () => {
        console.log(`${users[socket.id]} has left`);
        socket.to(chatGroups[socket.id]).emit("leaving", users[socket.id])
        delete users[socket.id];
    })
})