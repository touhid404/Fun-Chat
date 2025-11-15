import { Server } from "socket.io";

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: "http://localhost:5173",
			credentials: true,
		},
	});

	const userSockets = new Map(); // { userId: socketId }

	io.on("connection", (socket) => {

		// USER CONNECTED
		socket.on("user_connected", (userId) => {
			userSockets.set(userId, socket.id);

			console.log(`User connected: ${userId}`);

			// Notify everyone
			io.emit("user_connected", userId);

			// Send current online list to newly connected user
			socket.emit("users_online", Array.from(userSockets.keys()));
		});

		/* =============================
		   SEND MESSAGE (GLOBAL CHAT)
		============================== */
		socket.on("send_message", ({ senderId, content }) => {
			const message = {
				senderId,
				content,
				timestamp: new Date(),
			};

			// Broadcast message to ALL users
			io.emit("receive_message", message);
		});

		/* =============================
		   DISCONNECT
		============================== */
		socket.on("disconnect", () => {
			let disconnectedUser = null;

			for (const [userId, socketId] of userSockets.entries()) {
				if (socketId === socket.id) {
					disconnectedUser = userId;
					userSockets.delete(userId);
					break;
				}
			}

			if (disconnectedUser) {
				console.log(` User disconnected: ${disconnectedUser}`);
				io.emit("user_disconnected", disconnectedUser);
			}
		});
	});
};
