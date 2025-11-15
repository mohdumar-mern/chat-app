export default function MessageBubble({ message, isOwn }) {
  return (
    <div
      className={`max-w-[70%] p-2 rounded-xl my-1 ${
        isOwn ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-black"
      }`}
    >
      <p>{message.content}</p>
    </div>
  );
}
