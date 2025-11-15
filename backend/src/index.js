import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createServer } from "http";
import authRoutes from "./routes/auth.route.js";
import { initializeSocket } from "./lib/socket.js";

dotenv.config();


const app = express();
const PORT = process.env.PORT || 8001;

// Create HTTP server
const httpServer = createServer(app);

// Initialize socket.io with the HTTP server
initializeSocket(httpServer);

// Middleware
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Serve frontend in production
// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "../frontend/dist")));
// 	app.get("*", (req, res) => {
// 		res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
// 	});
// }

// Start HTTP server
httpServer.listen(PORT, () => {
	console.log(`Server + Socket.io running on port ${PORT}`);
});
