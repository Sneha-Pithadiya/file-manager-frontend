import React, { useEffect, useState } from "react";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileId, setCurrentFileId] = useState(null); 

  const token = localStorage.getItem("token");

  const fetchFiles = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch files");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
  if (!selectedFile) return;
  setLoading(true);
  const formData = new FormData();
  formData.append("uploaded_file", selectedFile);

  try {
    const res = await fetch("http://127.0.0.1:8000/files/upload", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Upload failed");

    setMessage(`${selectedFile.name} uploaded successfully!`);
    setSelectedFile(null); 
    fetchFiles(); 

    
    setTimeout(() => setMessage(""), 3000);
  } catch (err) {
    setMessage(err.message);
    setTimeout(() => setMessage(""), 3000); 
  } finally {
    setLoading(false);
  }
};

  const handleDownload = async (fileId, originalName) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = originalName || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleViewLogs = async (fileId, fileName) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/log/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch logs");

      const data = await res.json();
      setCurrentLogs(data.logs || []);
      setCurrentFileName(fileName);
      setCurrentFileId(fileId); 
      setLogModalOpen(true);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const downloadLogs = async () => {
    if (!currentFileId) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/log/${currentFileId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentFileName}_log.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleString() : "");

  return (
   <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900 transition-colors">
  <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
    File Manager
  </h1>

  {/* Message */}
  {message && (
    <div className="mb-4 p-3 rounded shadow text-white bg-red-500 dark:bg-red-600">
      {message}
    </div>
  )}

  {/* Upload Section */}
  <div className="mb-6 flex items-center justify-center gap-3">
    <input
      type="file"
      onChange={handleFileChange}
      className="border p-2 rounded w-60 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button
      onClick={handleUpload}
      disabled={loading}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-50 transition"
    >
      {loading ? "Uploading..." : "Upload"}
    </button>
  </div>

  {/* File Table */}
  <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
    <table className="w-full table-auto border rounded">
      <thead className="bg-gray-200 dark:bg-gray-700">
        <tr>
          <th className="px-4 py-3 text-left text-gray-800 dark:text-gray-100">Name</th>
          <th className="px-4 py-3 text-left text-gray-800 dark:text-gray-100">Type</th>
          <th className="px-4 py-3 text-left text-gray-800 dark:text-gray-100">Uploaded By</th>
          <th className="px-4 py-3 text-left text-gray-800 dark:text-gray-100">Uploaded At</th>
          <th className="px-4 py-3 text-gray-800 dark:text-gray-100">Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center p-4 text-gray-500 dark:text-gray-300">
              No files or folders uploaded yet.
            </td>
          </tr>
        ) : (
          files.map((file) => (
            <tr
              key={file.id}
              className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td className="px-4 py-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                {file.is_folder ? (
                  <span className="material-icons text-yellow-500">folder</span>
                ) : (
                  <span className="material-icons text-gray-500">insert_drive_file</span>
                )}
                <button
                  onClick={() => handleViewLogs(file.id, file.original_name)}
                  className="text-blue-500 hover:underline font-medium"
                >
                  {file.original_name}
                </button>
              </td>
              <td className="px-4 py-2 text-gray-800 dark:text-gray-100">
                {file.is_folder ? "Folder" : "File"}
              </td>
              <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{file.uploaded_by}</td>
              <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{formatDate(file.uploaded_at)}</td>
              <td className="px-4 py-2 flex gap-2 justify-center">
                <button
                  onClick={() => handleDownload(file.id, file.original_name)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow transition"
                >
                  Download
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Log Modal */}
  {logModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {currentFileName} - Logs
          </h2>
          <button
            onClick={() => setLogModalOpen(false)}
            className="text-red-500 font-bold text-xl hover:text-red-700 dark:hover:text-red-400 transition"
          >
            ×
          </button>
        </div>

        {/* Logs Container */}
        <div className="max-h-96 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-700">
          {currentLogs.length > 0 ? (
            currentLogs.map((log, index) => (
              <div
                key={index}
                className="p-2 border-b last:border-b-0 text-gray-700 dark:text-gray-200"
              >
                {log}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-300 text-center py-4">No logs found.</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setLogModalOpen(false)}
            className="bg-gray-300 hover:bg-gray-400 text-black dark:text-white px-4 py-2 rounded shadow transition"
          >
            Close
          </button>
          <button
            onClick={downloadLogs}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition"
          >
            Download Logs
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
}
