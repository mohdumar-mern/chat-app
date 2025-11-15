import { useGetUsersQuery } from "../api/apiSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserItem from "../components/UserItem";

export default function Home() {
  const { data: users = [] } = useGetUsersQuery();
  console.log(users)
  const currentUser = useSelector((s) => s.auth.user);
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto bg-white h-screen border">
      <h2 className="text-xl font-bold p-4 border-b">Chats</h2>
      {users
        .filter((u) => u._id !== currentUser?._id)
        .map((u) => (
          <UserItem key={u._id} user={u} onSelect={() => navigate(`/chat/${u._id}`)} />
        ))}
    </div>
  );
}
