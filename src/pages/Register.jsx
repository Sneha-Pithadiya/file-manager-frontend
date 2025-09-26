import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import DarkModeToggle from "../components/DarkModeToggle"; 

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");

      setMessage(" Registered successfully! You can login now.");
      setUsername("");
      setPassword("");
      setFullName("");

      navigate("/login");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
    
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md relative">
        <DarkModeToggle /> {/* Dark/Light toggle */}

        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Register
        </h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.startsWith("")
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            } transition`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-300 mr-2" />
            <input
              className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Username */}
          <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-300 mr-2" />
            <input
              className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <LockClosedIcon className="w-5 h-5 text-gray-400 dark:text-gray-300 mr-2" />
            <input
              type="password"
              className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-semibold transition"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div></>
    
  );
}
