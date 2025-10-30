import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/solid";

import DarkModeToggle from "../components/DarkModeToggle";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      body: formData, // send as FormData
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Login failed");

    setMessage("Login successful!");
    localStorage.setItem("token", data.access_token);
    setUsername("");
    setPassword("");
    navigate("/files");
  } catch (err) {
    setMessage(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md relative">
         <DarkModeToggle />
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Login</h1>

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

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-300 mr-2" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="flex items-center border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <LockClosedIcon className="w-5 h-5 text-gray-400 dark:text-gray-300 mr-2" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-300 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
