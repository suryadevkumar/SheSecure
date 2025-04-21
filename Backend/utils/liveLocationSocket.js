export const liveLocationSocket = (io) => {
    const activeSessions = new Map();
    const sessionTimeouts = new Map();

    const cleanupSession = (shareId, reason = "timeout") => {
        io.to(shareId).emit("location:session_ended", { reason });
        activeSessions.delete(shareId);
        sessionTimeouts.delete(shareId);
        console.log(`Cleaned up location session: ${shareId}, reason: ${reason}`);
    };

    io.on("connection", (socket) => {
        console.log(`Client connected to location namespace: ${socket.id}`);

        // Handle joining a location sharing session
        socket.on("location:join", (shareId, callback) => {
            try {
                if (!shareId) {
                    return callback?.({ success: false, message: "Invalid share ID" });
                }

                // Clear any existing timeout
                clearTimeout(sessionTimeouts.get(shareId));

                socket.join(shareId);

                // Initialize or update session
                if (!activeSessions.has(shareId)) {
                    activeSessions.set(shareId, {
                        locations: [],
                        participants: new Set([socket.id]),
                        createdAt: Date.now()
                    });
                } else {
                    activeSessions.get(shareId).participants.add(socket.id);
                }

                // Send full history to the new participant
                const session = activeSessions.get(shareId);
                socket.emit("location:history", session.locations);

                console.log(`Client ${socket.id} joined location room ${shareId}`);
                callback?.({ success: true });
            } catch (error) {
                console.error("Location join error:", error);
                callback?.({ success: false, message: "Internal server error" });
            }
        });

        // Handle location updates (standardized to use latitude/longitude)
        socket.on("location:update", (data, callback) => {
            try {
                const { shareId, latitude, longitude, timestamp } = data;
                
                if (!shareId || latitude == null || longitude == null) {
                    return callback?.({ success: false, message: "Invalid location data" });
                }

                if (!activeSessions.has(shareId)) {
                    return callback?.({ success: false, message: "Session not found" });
                }

                const session = activeSessions.get(shareId);
                const newLocation = { 
                    latitude, 
                    longitude, 
                    timestamp: timestamp || Date.now() 
                };

                // Store and broadcast the update
                session.locations.push(newLocation);
                
                // Limit history size
                if (session.locations.length > 100) {
                    session.locations = session.locations.slice(-100);
                }

                // Broadcast to all participants
                socket.to(shareId).emit("location:update", newLocation);
                
                // Reset session timeout
                clearTimeout(sessionTimeouts.get(shareId));
                sessionTimeouts.set(
                    shareId, 
                    setTimeout(() => cleanupSession(shareId), 5 * 60 * 1000) // 5 min timeout
                );

                callback?.({ success: true });
            } catch (error) {
                console.error("Location update error:", error);
                callback?.({ success: false, message: "Internal server error" });
            }
        });

        // Handle leaving a session
        socket.on("location:leave", (shareId, callback) => {
            try {
                if (!shareId) {
                    return callback?.({ success: false, message: "Invalid share ID" });
                }

                socket.leave(shareId);

                // Clean up if no participants left
                if (activeSessions.has(shareId)) {
                    const session = activeSessions.get(shareId);
                    session.participants.delete(socket.id);

                    if (session.participants.size === 0) {
                        cleanupSession(shareId, "all_left");
                    }
                }

                console.log(`Client ${socket.id} left location room ${shareId}`);
                callback?.({ success: true });
            } catch (error) {
                console.error("Location leave error:", error);
                callback?.({ success: false, message: "Internal server error" });
            }
        });
        // location end session
        socket.on("location:end_session", (shareId, callback) => {
            try {
                if (!shareId) {
                    return callback?.({ success: false, message: "Invalid share ID" });
                }

                // Explicitly end the session
                if (activeSessions.has(shareId)) {
                    cleanupSession(shareId, "user_ended");
                }

                console.log(`Client ${socket.id} ended location session ${shareId}`);
                callback?.({ success: true });
            } catch (error) {
                console.error("Location end session error:", error);
                callback?.({ success: false, message: "Internal server error" });
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`Client disconnected from location namespace: ${socket.id}`);

            // Clean up any sessions this client was part of
            activeSessions.forEach((session, shareId) => {
                if (session.participants.has(socket.id)) {
                    session.participants.delete(socket.id);
                    
                    if (session.participants.size === 0) {
                        cleanupSession(shareId);
                    }
                }
            });
        });
    });
};