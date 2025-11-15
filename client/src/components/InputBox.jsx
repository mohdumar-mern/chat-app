export default function InputBox({ message, setMessage, sendMessage }) {
  return (
    <div className="flex gap-2 border-t p-2">
      <input
        className="flex-1 border rounded-lg p-2"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={sendMessage}
        className="bg-blue-600 text-white px-4 rounded-lg"
      >
        Send
      </button>
    </div>
  );
}
