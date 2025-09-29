import React, { useState } from "react";

const CreateFolder = ({ parentId = null, onFolderCreated }) => {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const token = localStorage.getItem("token"); 
    if (!token) {
      setError("You are not logged in!");
      return;
    }

    if (!folderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/files/folders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: folderName.trim(),
          parent_id: parentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to create folder");

      setFolderName("");
      if (onFolderCreated) onFolderCreated(data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md bg-white w-64">
      <input
        type="text"
        value={folderName}
        placeholder="Enter folder name"
        onChange={(e) => setFolderName(e.target.value)}
        className="w-full px-2 py-1 border rounded-md mb-2"
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Folder"}
      </button>
    </div>
  );
};

export default CreateFolder;
