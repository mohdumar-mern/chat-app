import { useState } from "react";
import { useRegisterMutation } from "../api/apiSlice";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await register(form).unwrap();
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="w-80 border p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-4 rounded"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          {isLoading ? "Loading..." : "Register"}
        </button>
        <p className="mt-3 text-sm text-center">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
