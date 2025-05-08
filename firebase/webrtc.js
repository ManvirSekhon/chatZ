// WebRTC utilities for P2P file sharing
class WebRTCManager {
    constructor(socket, groupName, userName) {
        this.socket = socket;
        this.groupName = groupName;
        this.userName = userName;
        this.socketId = socket.id;
        this.peers = new Map();
        this.dataChannels = new Map();
        this.fileTransfers = new Map(); // Map of file transfers by transferId
        this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        this.CHUNK_SIZE = 16 * 1024; // 16KB chunks

        this.initializeSignaling();
    }

    initializeSignaling() {
        // Handle incoming file offers
        this.socket.on('file-offer', async ({ from, offer, fileName, fileSize, fileType }) => {
            console.log('Received file offer from socket ID:', from, 'File:', fileName);
            try {
                if (!from) {
                    console.error('Invalid sender socket ID');
                    this.socket.emit('file-error', { to: from, error: 'Invalid sender socket ID' });
                    return;
                }

                if (fileSize > this.MAX_FILE_SIZE) {
                    this.socket.emit('file-error', { to: from, error: 'File size exceeds 5MB limit' });
                    return;
                }

                const peerConnection = this.createPeerConnection(from);
                console.log('Created peer connection for incoming offer from socket ID:', from);

                // Handle incoming data channel
                peerConnection.ondatachannel = (event) => {
                    console.log('Received data channel from socket ID:', from);
                    const dataChannel = event.channel;
                    this.setupDataChannel(dataChannel, from, fileName, fileSize, fileType);
                };

                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                console.log('Set remote description for offer from socket ID:', from);

                // Create and send answer
                const answer = await peerConnection.createAnswer();
                console.log('Created answer for socket ID:', from);
                
                await peerConnection.setLocalDescription(answer);
                console.log('Set local description for answer to socket ID:', from);
                
                this.socket.emit('file-answer', { 
                    to: from, 
                    from: this.socketId,
                    answer 
                });
                console.log('Sent answer to socket ID:', from);
            } catch (error) {
                console.error('Error handling file offer from socket ID:', from, error);
                this.socket.emit('file-error', { to: from, error: 'Failed to establish connection' });
            }
        });

        // Handle incoming answers
        this.socket.on('file-answer', async ({ from, answer }) => {
            console.log('Received answer from socket ID:', from);
            try {
                if (!from) {
                    console.error('Invalid sender socket ID');
                    return;
                }

                const peerConnection = this.peers.get(from);
                if (peerConnection) {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                    console.log('Set remote description for answer from socket ID:', from);
                } else {
                    console.error('No peer connection found for socket ID:', from);
                }
            } catch (error) {
                console.error('Error handling file answer from socket ID:', from, error);
            }
        });

        // Handle ICE candidates
        this.socket.on('ice-candidate', ({ from, candidate }) => {
            console.log('Received ICE candidate from socket ID:', from);
            try {
                if (!from) {
                    console.error('Invalid sender socket ID');
                    return;
                }

                const peerConnection = this.peers.get(from);
                if (peerConnection) {
                    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                        .then(() => console.log('Added ICE candidate from socket ID:', from))
                        .catch(error => console.error('Error adding ICE candidate from socket ID:', from, error));
                } else {
                    console.error('No peer connection found for ICE candidate from socket ID:', from);
                }
            } catch (error) {
                console.error('Error handling ICE candidate:', error);
            }
        });

        // Handle file errors
        this.socket.on('file-error', ({ from, error }) => {
            console.error('File transfer error from socket ID:', from, error);
            if (from) {
                this.cleanupTransfer(from);
            }
        });
    }

    createPeerConnection(socketId) {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        };

        const peerConnection = new RTCPeerConnection(configuration);
        console.log('Created new peer connection for socket ID:', socketId);
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Generated ICE candidate for socket ID:', socketId);
                this.socket.emit('ice-candidate', {
                    to: socketId,
                    from: this.socketId,
                    candidate: event.candidate
                });
            }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log('Connection state changed for socket ID:', socketId, 'State:', peerConnection.connectionState);
            if (peerConnection.connectionState === 'disconnected' ||
                peerConnection.connectionState === 'failed' ||
                peerConnection.connectionState === 'closed') {
                this.cleanupTransfer(socketId);
            }
        };

        // Handle ICE connection state changes
        peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state changed for socket ID:', socketId, 'State:', peerConnection.iceConnectionState);
        };

        this.peers.set(socketId, peerConnection);
        return peerConnection;
    }

    setupDataChannel(dataChannel, socketId, fileName, fileSize, fileType) {
        console.log('Setting up data channel for socket ID:', socketId);
        
        dataChannel.onopen = () => {
            console.log('Data channel opened for socket ID:', socketId);
            this.dataChannels.set(socketId, dataChannel);
        };

        dataChannel.onclose = () => {
            console.log('Data channel closed for socket ID:', socketId);
            this.cleanupTransfer(socketId);
        };

        dataChannel.onerror = (error) => {
            console.error('Data channel error for socket ID:', socketId, error);
            this.socket.emit('file-error', { to: socketId, error: 'Data channel error' });
            this.cleanupTransfer(socketId);
        };

        dataChannel.onmessage = (event) => {
            console.log('Received message on data channel from socket ID:', socketId);
            try {
                const data = JSON.parse(event.data);
                console.log('Message type:', data.type);
                
                if (data.type === 'metadata') {
                    this.handleFileMetadata(socketId, data);
                } else if (data.type === 'chunk') {
                    this.handleFileChunk(socketId, data);
                } else if (data.type === 'complete') {
                    this.handleFileComplete(socketId);
                }
            } catch (error) {
                console.error('Error handling data channel message from socket ID:', socketId, error);
            }
        };
    }

    handleFileMetadata(socketId, metadata) {
        const transferId = `${socketId}-${Date.now()}`;
        this.fileTransfers.set(transferId, {
            fileName: metadata.fileName,
            fileType: metadata.fileType,
            fileSize: metadata.fileSize,
            receivedSize: 0,
            chunks: []
        });
    }

    handleFileChunk(socketId, chunkData) {
        const transferId = `${socketId}-${Date.now()}`;
        const transfer = this.fileTransfers.get(transferId);
        
        if (transfer) {
            transfer.chunks.push(chunkData.chunk);
            transfer.receivedSize += chunkData.chunk.length;
            
            // Update progress
            const progress = (transfer.receivedSize / transfer.fileSize) * 100;
            this.updateProgress(socketId, progress);
        }
    }

    handleFileComplete(socketId) {
        const transferId = `${socketId}-${Date.now()}`;
        const transfer = this.fileTransfers.get(transferId);
        
        if (transfer) {
            // Create blob from chunks
            const blob = new Blob(transfer.chunks, { type: transfer.fileType });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            this.createDownloadLink(transfer.fileName, url, this.userName);
            
            // Cleanup
            this.cleanupTransfer(socketId);
        }
    }

    updateProgress(socketId, progress) {
        const progressElement = document.querySelector(`.file-progress[data-socket="${socketId}"]`);
        if (progressElement) {
            progressElement.textContent = `Uploading... ${Math.round(progress)}%`;
        }
    }

    createDownloadLink(fileName, url, senderName) {
        const messageGroup = document.querySelector('.message-group');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message file-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">${senderName.trim().charAt(0).toUpperCase()}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${senderName}</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="file-info">
                    <a href="${url}" download="${fileName}" class="file-link">
                        <span class="file-icon">📎</span>
                        <span class="file-name">${fileName}</span>
                    </a>
                </div>
            </div>
        `;
        messageGroup.appendChild(messageDiv);
        messageGroup.scrollTop = messageGroup.scrollHeight;
    }

    cleanupTransfer(socketId) {
        const peerConnection = this.peers.get(socketId);
        if (peerConnection) {
            peerConnection.close();
            this.peers.delete(socketId);
        }

        const dataChannel = this.dataChannels.get(socketId);
        if (dataChannel) {
            dataChannel.close();
            this.dataChannels.delete(socketId);
        }

        const transferId = `${socketId}-${Date.now()}`;
        this.fileTransfers.delete(transferId);
    }

    async sendFile(file, toSocketId) {
        console.log(`Starting file transfer to socket ID: ${toSocketId}`, file);
        
        try {
            if (!toSocketId) {
                throw new Error('Invalid recipient socket ID');
            }

            if (file.size > this.MAX_FILE_SIZE) {
                throw new Error('File size exceeds 5MB limit');
            }

            const peerConnection = this.createPeerConnection(toSocketId);
            console.log('Created peer connection for socket ID:', toSocketId);

            // Create data channel
            const dataChannel = peerConnection.createDataChannel('fileTransfer', {
                ordered: true,
                reliable: true
            });
            console.log('Created data channel for socket ID:', toSocketId);

            // Setup data channel
            dataChannel.onopen = async () => {
                try {
                    console.log('Data channel opened for socket ID:', toSocketId);
                    // Send metadata
                    const metadata = {
                        type: 'metadata',
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type
                    };
                    console.log('Sending metadata to socket ID:', toSocketId, metadata);
                    dataChannel.send(JSON.stringify(metadata));

                    // Read and send file in chunks
                    const reader = new FileReader();
                    let offset = 0;
                    let totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
                    let currentChunk = 0;

                    const readNextChunk = () => {
                        const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
                        reader.readAsArrayBuffer(chunk);
                    };

                    reader.onload = (event) => {
                        if (dataChannel.readyState === 'open') {
                            console.log(`Sending chunk ${currentChunk + 1}/${totalChunks} to socket ID: ${toSocketId}`);
                            dataChannel.send(JSON.stringify({
                                type: 'chunk',
                                chunk: event.target.result
                            }));

                            currentChunk++;
                            const progress = (currentChunk / totalChunks) * 100;
                            this.updateProgress(toSocketId, progress);

                            offset += this.CHUNK_SIZE;
                            if (offset < file.size) {
                                setTimeout(readNextChunk, 0);
                            } else {
                                console.log('File transfer complete to socket ID:', toSocketId);
                                dataChannel.send(JSON.stringify({ type: 'complete' }));
                                this.cleanupTransfer(toSocketId);
                            }
                        }
                    };

                    readNextChunk();
                } catch (error) {
                    console.error('Error sending file to socket ID:', toSocketId, error);
                    this.socket.emit('file-error', { to: toSocketId, error: 'Error sending file' });
                    this.cleanupTransfer(toSocketId);
                }
            };

            // Create and send offer
            const offer = await peerConnection.createOffer();
            console.log('Created offer for socket ID:', toSocketId);
            
            await peerConnection.setLocalDescription(offer);
            console.log('Set local description for offer to socket ID:', toSocketId);

            // Send file offer with socket ID
            this.socket.emit('file-offer', {
                to: toSocketId,
                from: this.socketId,
                offer,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });
            console.log('Sent file offer to socket ID:', toSocketId);

            this.dataChannels.set(toSocketId, dataChannel);
        } catch (error) {
            console.error('Error initiating file transfer to socket ID:', toSocketId, error);
            this.socket.emit('file-error', { to: toSocketId, error: error.message });
            this.cleanupTransfer(toSocketId);
            throw error;
        }
    }
}

export default WebRTCManager; 