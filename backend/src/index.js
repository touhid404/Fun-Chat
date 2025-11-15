import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";

const __dirname = path.resolve();
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8001;
// Create HTTP server
const httpServer = createServer(app);

// Initialize socket.io with the HTTP server
initializeSocket(httpServer);

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);

app.use(express.json());

// Example route imports
app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}



// IMPORTANT: Start HTTP SERVER, not express app
httpServer.listen(PORT, () => {
	console.log(`Server + Socket.io running on port ${PORT}`);
});
