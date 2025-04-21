import SOS from '../models/SOS.js';

const sosSocket = (io) => {
    // Initialize global storage for active SOS information
    if (!global.activeSOS) {
        global.activeSOS = {};
    }

    // Socket.io middleware to check session
    io.use((socket, next) => {
        // If there's a session with a user, add the userId to the socket
        if (socket.request.session?.user) {
            socket.userId = socket.request.session.user.id;
        }
        // Allow connection even without authentication for public SOS links
        next();
    });

    // Handle socket connections
    io.on("connection", (socket) => {
        console.log("User connected to SOS system");

        // Handle location updates from the victim
        socket.on("updateLocation", async ({ reportId, latitude, longitude }) => {
            if (!reportId || !latitude || !longitude) {
                return socket.emit("error", { message: "Invalid location data" });
            }

            try {
                // Check if this SOS exists and is active
                const sosRecord = await SOS.findOne({ reportId, endSosTime: null });

                if (!sosRecord) {
                    // SOS is not active, inform the client immediately
                    socket.emit("statusUpdate", {
                        status: "inactive",
                        message: "SOS not active or not found"
                    });
                    return;
                }

                // Initialize in-memory storage if needed
                if (!global.activeSOS[reportId]) {
                    global.activeSOS[reportId] = {
                        locations: [],
                        userId: sosRecord.userId,
                        startTime: sosRecord.startSosTime
                    };
                }

                const newLocation = {
                    latitude,
                    longitude,
                    timestamp: new Date()
                };

                // Add to in-memory location tracking
                global.activeSOS[reportId].locations.push(newLocation);

                // Cap the location history to prevent memory issues
                if (global.activeSOS[reportId].locations.length > 1000) {
                    global.activeSOS[reportId].locations = global.activeSOS[reportId].locations.slice(-1000);
                }

                // Broadcast to all clients in this SOS room
                io.to(reportId).emit("locationUpdate", newLocation);
                io.to(reportId).emit("pathUpdate", global.activeSOS[reportId].locations);

            } catch (error) {
                console.error("Error in updateLocation:", error);
                socket.emit("error", { message: "Server error processing location update" });
            }
        });

        // Handle clients joining a specific SOS room
        socket.on("joinSOS", async (reportId) => {
            if (!reportId) return;

            socket.join(reportId);
            console.log(`Client joined SOS room ${reportId}`);

            try {
                // Check if SOS exists
                const sosRecord = await SOS.findOne({ reportId });

                if (!sosRecord) {
                    return socket.emit("error", { message: "Invalid SOS reportId" });
                }

                const isActive = !sosRecord.endSosTime;

                // Send current locations if available in memory
                if (global.activeSOS?.[reportId] && isActive) {
                    socket.emit("pathUpdate", global.activeSOS[reportId].locations);
                    socket.emit("statusUpdate", {
                        status: "active",
                        startTime: global.activeSOS[reportId].startTime
                    });
                } else {
                    // If not in memory but is an active SOS, initialize it
                    if (isActive && !global.activeSOS?.[reportId]) {
                        global.activeSOS[reportId] = {
                            locations: [],
                            userId: sosRecord.userId,
                            startTime: sosRecord.startSosTime
                        };
                    }

                    // Send status update
                    socket.emit("statusUpdate", {
                        status: isActive ? "active" : "inactive",
                        startTime: sosRecord.startSosTime,
                        endTime: sosRecord.endSosTime
                    });
                }
            } catch (error) {
                console.error("Error in joinSOS:", error);
                socket.emit("error", { message: "Failed to join SOS room" });
            }
        });

        // Keep SOS alive
        socket.on("keepAlive", async ({ reportId }) => {
            if (!reportId) return;

            try {
                // Check if SOS is still active in the database
                const sosRecord = await SOS.findOne({ reportId, endSosTime: null });

                if (!sosRecord) {
                    // SOS has been deactivated in the database, inform the client
                    io.to(reportId).emit("statusUpdate", {
                        status: "inactive",
                        message: "SOS has been deactivated"
                    });

                    // Clean up in-memory data
                    if (global.activeSOS?.[reportId]) {
                        delete global.activeSOS[reportId];
                    }

                    return;
                }

                // Update the last activity time
                await SOS.findOneAndUpdate(
                    { reportId, endSosTime: null },
                    { lastActivity: new Date() }
                );
            } catch (error) {
                console.error("Error in keepAlive:", error);
            }
        });

        //leave sos
        socket.on("leaveSOS", (reportId) => {
            if (!reportId) return;
            socket.leave(reportId);
            console.log(`Client left SOS room ${reportId}`);
        });
        
        //end sos
        socket.on("endSOS", async ({ reportId }) => {
            if (!reportId) return;

            try {
                // Update database
                const sosRecord = await SOS.findOneAndUpdate(
                    { reportId, endSosTime: null },
                    { endSosTime: new Date() },
                    { new: true }
                );

                if (!sosRecord) {
                    return socket.emit("error", { message: "SOS not active or not found" });
                }

                // Clean up in-memory data
                if (global.activeSOS?.[reportId]) {
                    delete global.activeSOS[reportId];
                }

                // Broadcast to all clients in this room IMMEDIATELY
                io.to(reportId).emit("statusUpdate", {
                    status: "inactive",
                    startTime: sosRecord.startSosTime,
                    endTime: sosRecord.endSosTime
                });

                console.log(`SOS ${reportId} ended by client ${socket.id}`);
            } catch (error) {
                console.error("Error in endSOS socket event:", error);
                socket.emit("error", { message: "Server error ending SOS" });
            }
        });

        //socket disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected from SOS system");
        });
    });
};

export default sosSocket;