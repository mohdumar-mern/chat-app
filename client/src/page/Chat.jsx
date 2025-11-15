import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetMessagesQuery } from "../api/apiSlice";
import { useSelector } from "react-redux";
import { socket } from "../utils/socket";
import MessageBubble from "../components/MessageBubble";
import InputBox from "../components/InputBox";

export default function Chat() {
  const { id: conversationId } = useParams(); // ✅ URL param is conversationId
  const { data: initialMessages = [] } = useGetMessagesQuery(conversationId);
  const user = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ✅ Load initial messages when fetched
  useEffect(() => {
    if (initialMessages?.length) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // ✅ Setup socket join and message listener
  useEffect(() => {
    if (!user?._id) return;

    // Join this conversation room
    socket.emit("join:conversation", { conversationId });

    const handleNewMessage = (msg) => {
      // ✅ msg.message because backend emits { message }
      if (msg?.message?.conversation === conversationId) {
        setMessages((prev) => [...prev, msg.message]);
      }
    };

    socket.on("message:new", handleNewMessage);

    // Cleanup when component unmounts or user changes
    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [conversationId, user?._id]);

  // ✅ Send message handler
  const sendMessage = () => {
    if (!text.trim()) return;

    // must match backend expectation → { conversationId, senderId, text }
    const payload = {
      conversationId,
      senderId: user._id,
      text,
    };

    socket.emit("message:send", payload);

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now(),
        conversation: conversationId,
        sender: user,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);

    setText("");
  };

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col border rounded-lg shadow">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length > 0 ? (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg._id || i}
              message={msg}
              isOwn={
                msg.sender?._id === user._id || msg.sender === user._id
              }
            />
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">
            No messages yet
          </p>
        )}
      </div>

      {/* Input box */}
      <InputBox
        message={text}
        setMessage={setText}
        sendMessage={sendMessage}
      />
    </div>
  );
}
