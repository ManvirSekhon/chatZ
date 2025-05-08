const { Server } = require("socket.io");

const io = new Server(8000, {
    cors: {
        origin: "http://127.0.0.1:5500", // <-- Allow this origin
        methods: ["GET", "POST"]
    }
});

const users = {};
const groups = {};
const fileUploads = new Map();
const uploadProgress = new Map();

// Store active file transfers
const activeFileTransfers = new Map();

// Add cleanup function
const cleanupUpload = (uploadId) => {
    fileUploads.delete(uploadId);
    uploadProgress.delete(uploadId);
};

// Add progress tracking
const updateProgress = (uploadId, progress) => {
    uploadProgress.set(uploadId, progress);
};

// Basic route to test if server is running
app.get('/', (req, res) => {
    res.send('Server is running');
});

io.on('connection', socket => {
    console.log('New connection:', socket.id);

    // Handle connection errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('new-user-joined', ({ groupName, userName }) => {
        try {
            console.log('New user joined:', userName, 'Socket ID:', socket.id);
            
            // Store user info
            users[socket.id] = { userName, groupName };
            
            // Initialize group if it doesn't exist
            if (!groups[groupName]) {
                groups[groupName] = new Set();
            }
            
            // Add user to group
            groups[groupName].add(socket.id);
            
            // Join socket room
            socket.join(groupName);
            
            // Get unique members by checking socket IDs and usernames
            const uniqueMembers = new Map();
            Array.from(groups[groupName]).forEach(socketId => {
                const user = users[socketId];
                if (user && user.userName) {
                    // Only add if username is not already in the map
                    if (!uniqueMembers.has(user.userName)) {
                        uniqueMembers.set(user.userName, socketId);
                    }
                }
            });
            
            // Convert to array of unique member names
            const members = Array.from(uniqueMembers.keys());
            
            // Send current members to all users in the group
            io.in(groupName).emit('current-members', members);
            
            // Notify others about new user
            socket.to(groupName).emit('user-joined', userName);
        } catch (error) {
            console.error('Error handling new user:', error);
        }
    });

    socket.on('get-member-socket', ({ memberName }, callback) => {
        try {
            console.log('Getting socket ID for member:', memberName);
            const targetUser = Object.entries(users).find(([_, user]) => user.userName === memberName);
            if (targetUser) {
                console.log('Found socket ID:', targetUser[0], 'for member:', memberName);
                callback({ socketId: targetUser[0] });
            } else {
                console.log('Member not found:', memberName);
                callback({ error: 'Member not found' });
            }
        } catch (error) {
            console.error('Error getting member socket:', error);
            callback({ error: 'Error getting member socket' });
        }
    });

    socket.on('file-offer', ({ to, from, offer, fileName, fileSize, fileType }) => {
        try {
            console.log('File offer received from:', from, 'to:', to);
            const targetSocket = io.sockets.sockets.get(to);
            if (targetSocket) {
                console.log('Sending file offer to target socket:', to);
                targetSocket.emit('file-offer', { from, offer, fileName, fileSize, fileType });
            } else {
                console.error('Target socket not found:', to);
                socket.emit('file-error', { to: from, error: 'Recipient not found' });
            }
        } catch (error) {
            console.error('Error handling file offer:', error);
            socket.emit('file-error', { to: from, error: 'Error handling file offer' });
        }
    });

    socket.on('file-answer', ({ to, from, answer }) => {
        try {
            console.log('File answer received from:', from, 'to:', to);
            const targetSocket = io.sockets.sockets.get(to);
            if (targetSocket) {
                console.log('Sending file answer to target socket:', to);
                targetSocket.emit('file-answer', { from, answer });
            } else {
                console.error('Target socket not found:', to);
                socket.emit('file-error', { to: from, error: 'Recipient not found' });
            }
        } catch (error) {
            console.error('Error handling file answer:', error);
            socket.emit('file-error', { to: from, error: 'Error handling file answer' });
        }
    });

    socket.on('ice-candidate', ({ to, from, candidate }) => {
        try {
            console.log('ICE candidate received from:', from, 'to:', to);
            const targetSocket = io.sockets.sockets.get(to);
            if (targetSocket) {
                console.log('Sending ICE candidate to target socket:', to);
                targetSocket.emit('ice-candidate', { from, candidate });
            } else {
                console.error('Target socket not found:', to);
                socket.emit('file-error', { to: from, error: 'Recipient not found' });
            }
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
            socket.emit('file-error', { to: from, error: 'Error handling ICE candidate' });
        }
    });

    socket.on('file-error', ({ to, from, error }) => {
        try {
            console.error(`File error from ${from} to ${to}:`, error);
            
            // Find target user by username
            const targetUser = Object.values(users).find(user => user.userName === to);
            if (!targetUser) {
                console.error(`Target user ${to} not found`);
                return;
            }

            const targetSocket = io.sockets.sockets.get(targetUser.socketId);
            if (targetSocket) {
                targetSocket.emit('file-error', {
                    from: from,
                    error
                });
            }
        } catch (error) {
            console.error('Error forwarding file error:', error);
        }
    });

    socket.on("send", ({groupName, message}) => {
        try {
            const user = users[socket.id];
            if (user && user.groupName === groupName) {
                socket.to(groupName).emit("receive", {
                    message: message,
                    name: user.userName
                });
            }
        } catch (error) {
            console.error('Error in send message:', error);
        }
    });

    socket.on("start-file-upload", ({groupName, fileName, fileSize, fileType}) => {
        try {
            const user = users[socket.id];
            if (!user || user.groupName !== groupName) {
                console.error('Invalid user or group for file upload');
                return;
            }

            const uploadId = `${socket.id}-${Date.now()}`;
            const filePath = path.join(uploadsDir, `${Date.now()}-${fileName}`);
            
            // Create write stream
            const writeStream = fs.createWriteStream(filePath);
            
            fileUploads.set(uploadId, {
                fileName,
                filePath,
                fileSize,
                fileType,
                receivedSize: 0,
                writeStream,
                groupName,
                userName: user.userName
            });

            // Initialize progress
            updateProgress(uploadId, 0);

            console.log(`Starting file upload: ${fileName} (${fileSize} bytes)`);
            socket.emit("upload-ready", { uploadId });
        } catch (error) {
            console.error('Error in start-file-upload:', error);
            socket.emit("file-error", "Error starting file upload. Please try again.");
        }
    });

    socket.on('file-chunk', ({ room, fileId, chunkIndex, totalChunks, fileName, fileType, chunk }) => {
        try {
            console.log(`Received chunk ${chunkIndex + 1}/${totalChunks} for file ${fileId} in room ${room}`);
            
            // Validate file size (5MB limit)
            if (chunk.byteLength > 5 * 1024 * 1024) {
                socket.emit('file-error', { error: 'File size exceeds 5MB limit' });
                return;
            }

            // Get sender's username
            const sender = users[socket.id];
            const senderName = sender ? sender.userName : 'Unknown';

            // Forward chunk to other users in the room
            socket.to(room).emit('file-chunk', {
                fileId,
                chunkIndex,
                totalChunks,
                fileName,
                fileType,
                chunk,
                senderName
            });

            // Track file transfer progress
            if (!activeFileTransfers.has(fileId)) {
                activeFileTransfers.set(fileId, {
                    room,
                    fileName,
                    fileType,
                    totalChunks,
                    receivedChunks: new Set(),
                    startTime: Date.now()
                });
            }

            const transfer = activeFileTransfers.get(fileId);
            transfer.receivedChunks.add(chunkIndex);

            // Check if all chunks are received
            if (transfer.receivedChunks.size === totalChunks) {
                console.log(`File ${fileId} transfer completed in ${(Date.now() - transfer.startTime) / 1000} seconds`);
                activeFileTransfers.delete(fileId);
            }
        } catch (error) {
            console.error('Error handling file chunk:', error);
            socket.emit('file-error', { error: 'Error processing file chunk' });
        }
    });

    socket.on('file-error', ({ error }) => {
        console.error('File transfer error:', error);
        socket.emit('file-error', { error });
    });

    socket.on('disconnect', () => {
        try {
            console.log('User disconnected:', socket.id);
            const user = users[socket.id];
            if (user) {
                const { userName, groupName } = user;
                
                // Remove user from group
                if (groups[groupName]) {
                    groups[groupName].delete(socket.id);
                    
                    // Get updated unique members
                    const members = Array.from(groups[groupName])
                        .map(id => users[id].userName)
                        .filter((name, index, self) => self.indexOf(name) === index);
                    
                    // Update members list for remaining users
                    io.in(groupName).emit('current-members', members);
                    
                    // Notify about user leaving
                    socket.to(groupName).emit('user-left', userName);
                }
                
                // Remove user from users map
                delete users[socket.id];
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Something broke!');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});