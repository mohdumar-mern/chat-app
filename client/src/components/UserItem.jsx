export default function UserItem({ user, onSelect }) {
  return (
    <div
      onClick={() => onSelect(user)}
      className="p-3 border-b hover:bg-gray-100 cursor-pointer flex justify-between"
    >
      <p>{user.name}</p>
      <span
        className={`w-2 h-2 rounded-full ${
          user.isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      ></span>
    </div>
  );
}
