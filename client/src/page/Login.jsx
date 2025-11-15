import { useState } from "react";
import { useLoginMutation } from "../api/apiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 🔹 Perform login request
      const data = await login(form).unwrap();
      console.log("Login response:", data);

      // ✅ Store user safely as JSON string
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // ✅ Dispatch credentials to Redux
      dispatch(
        setCredentials({
          token: data?.token || null,
          user: data?.user || null,
        })
      );

      // ✅ Navigate after successful login
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-80 bg-white border p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          className="border p-2 w-full mb-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full p-2 rounded-lg font-semibold transition-all duration-200"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>

        <p className="mt-3 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
