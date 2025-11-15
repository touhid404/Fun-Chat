import React, { useState, useEffect, useRef, useMemo } from "react";
import { useChatStore } from "../../store/useChatStore";

function getRandomAvatar(seed) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

// Custom hook to generate avatar from seed
export function useDummyAvatar(seed) {
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!seed) return;
    setAvatar(getRandomAvatar(seed));
  }, [seed]);

  return avatar;
}

const SocketStatus = () => {
  const {
    setUser,
    currentUser,
    initSocket,
    isConnected,
    onlineUsers,
    messages,
    sendMessage,
    disconnectSocket,
  } = useChatStore();

  const [userIdInput, setUserIdInput] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize socket after user sets ID
  useEffect(() => {
    if (currentUser) initSocket();
  }, [currentUser]);

  const handleConnect = () => {
    if (!userIdInput.trim()) return alert("Enter user ID");
    setUser(userIdInput);
  };

  const handleDisconnect = () => {
    disconnectSocket();
  };

  const handleSend = () => {
    if (!msgInput.trim()) return;
    sendMessage(msgInput);
    setMsgInput("");
  };

  // Memoized avatars
  const onlineUserAvatars = useMemo(() => {
    const map = {};
    onlineUsers.forEach((u) => {
      map[u] = getRandomAvatar(u);
    });
    return map;
  }, [onlineUsers]);

  const messageAvatars = useMemo(() => {
    const map = {};
    messages.forEach((m) => {
      if (m.type !== "info") {
        map[m.senderId] = getRandomAvatar(m.senderId);
      }
    });
    return map;
  }, [messages]);

  return (
  <div className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[600px] h-[700px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
    

    {/* User login / info */}
    <div className="p-5 border-b border-gray-200">
      {!currentUser ? (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter User ID"
            className="border border-gray-300 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
          />
          <button
            onClick={handleConnect}
            className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition"
          >
            Connect
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center bg-indigo-50 px-4 py-2 rounded-xl">
          <p className="text-gray-700 text-sm md:text-base">
            Logged in as: <span className="font-semibold">{currentUser}</span>
          </p>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 text-white px-3 py-1 rounded-xl hover:bg-red-700 transition text-sm"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>

    

    {/* Online Users */}
    <div className="px-5 py-1 border-b border-gray-200">
       <span
        className={
          isConnected
            ? "text-green-600 font-semibold"
            : "text-red-600 font-semibold"
        }
      >
        {isConnected ? "Connected Now" : "Disconnected"}
      </span>
     
      <div className="flex flex-wrap gap-3">
        {[...onlineUsers].map((u) => (
          <div
            key={u}
            className="flex flex-col items-center"
          >
            <img
              src={onlineUserAvatars[u]}
              alt="avatar"
              className="bg-blue-100 p-1 w-12 h-12 rounded-full"
            />
            <span className="text-sm  text-gray-700">{u}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-5 bg-gray-50" style={{ maxHeight: "500px" }}>
      <ul className="flex flex-col gap-4">
        {messages.map((m, i) => {
          if (m.type === "info") {
            return (
              <li key={i} className="text-center text-gray-400 text-sm italic">
                {m.content}
              </li>
            );
          }

          const isOwnMessage = m.senderId === currentUser;
          const avatar = messageAvatars[m.senderId];

          return (
            <li
              key={i}
              className={`flex gap-3 items-end ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!isOwnMessage && (
                <img src={avatar} alt="avatar" className="w-9 h-9 rounded-full" />
              )}
              <div
                className={`px-5 py-3 rounded-3xl max-w-[70%] shadow-md break-words ${
                  isOwnMessage
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                {!isOwnMessage && (
                  <p className="font-semibold text-sm mb-1">{m.senderId}</p>
                )}
                <p className="text-sm">{m.content}</p>
              </div>
              {isOwnMessage && (
                <img src={avatar} alt="avatar" className="w-9 h-9 rounded-full" />
              )}
            </li>
          );
        })}
        <div ref={messagesEndRef} />
      </ul>
    </div>

    {/* Send Message */}
    {currentUser && (
      <div className="px-5 py-4 border-t border-gray-200 flex gap-3 bg-white">
        <input
          type="text"
          placeholder="Write a message..."
          className="border border-gray-300 px-4 py-3 rounded-2xl flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={msgInput}
          onChange={(e) => setMsgInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-5 py-3 rounded-2xl hover:bg-indigo-700 transition font-semibold"
        >
          Send
        </button>
      </div>
    )}
  </div>
);

};

export default SocketStatus;
