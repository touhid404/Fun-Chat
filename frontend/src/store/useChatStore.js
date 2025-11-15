import { create } from "zustand";
import { io } from "socket.io-client";

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const socket = io(baseURL, { autoConnect: false, withCredentials: true });

// Maximum number of messages to keep
const MAX_MESSAGES = 20;

export const useChatStore = create((set, get) => ({
  socket,
  currentUser: null,
  isConnected: false,
  onlineUsers: new Set(),
  messages: [],

  // Set current user
  setUser: (userId) => set({ currentUser: userId }),

  // Initialize socket connection
  initSocket: () => {
    const userId = get().currentUser;
    if (!userId) return;

    if (!get().isConnected) {
      socket.auth = { userId };
      socket.connect();

      socket.emit("user_connected", userId);

      socket.on("connect", () => set({ isConnected: true }));

      socket.on("users_online", (users) =>
        set({ onlineUsers: new Set(users) })
      );

      socket.on("user_connected", (userId) =>
        set((state) => ({ onlineUsers: new Set([...state.onlineUsers, userId]) }))
      );

      socket.on("user_disconnected", (userId) =>
        set((state) => {
          const updated = new Set(state.onlineUsers);
          updated.delete(userId);
          return { onlineUsers: updated };
        })
      );

      // Receive message with queue logic
      socket.on("receive_message", (message) =>
        set((state) => {
          const updatedMessages = [...state.messages, message];
          if (updatedMessages.length > MAX_MESSAGES) {
            // Remove older messages from start
            updatedMessages.splice(0, updatedMessages.length - MAX_MESSAGES);
          }
          return { messages: updatedMessages };
        })
      );
    }
  },

  // Disconnect socket
  disconnectSocket: () => {
    if (get().isConnected) {
      socket.disconnect();
      set({ isConnected: false, onlineUsers: new Set() });
    }
  },

  // Send message
  sendMessage: (content) => {
    const senderId = get().currentUser;
    if (!senderId) return;
    socket.emit("send_message", { senderId, content });
  },
}));
