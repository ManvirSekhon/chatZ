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

        if (!chatGroups[groupName]) {
            chatGroups[groupName] = [];
        }
        chatGroups[groupName].push({ id: socket.id, name: userName });
    
        console.log(`${userName} joined group: ${groupName}`);
    
        // Send the current list of members to the newly joined user
        const memberNames = chatGroups[groupName].map(user => user.name);
        socket.emit("current-members", memberNames);

        console.log(`${userName} joined group: ${groupName}`);
        socket.to(groupName).emit("user-joined", userName);
    })

    socket.on("send", ({groupName, message}) => {
        socket.to(groupName).emit("receive", {message: message, name: users[socket.id]})
    })

    socket.on("disconnect", () => {
        const groupName = chatGroups[socket.id];
        const userName = users[socket.id];
        console.log(`${userName} has left`);

        if (chatGroups[groupName]) {
            chatGroups[groupName] = chatGroups[groupName].filter(user => user.id !== socket.id);
        }
        socket.to(chatGroups[socket.id]).emit("leaving", users[socket.id])
        delete users[socket.id];
    })
})