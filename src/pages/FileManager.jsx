import React, { useEffect, useState } from "react";
import { BreadcrumbComponent } from "../components/BreadCrumbsComponents";
import { FileManagerToolbar } from "../components/FileManagerToolbar";
import { getFileIcon } from "../helper/Fileicons";
import { FaDownload, FaEye } from "react-icons/fa";
import CreateFolder from "../components/CreateFolder";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileId, setCurrentFileId] = useState(null);

  const [breadcrumb, setBreadcrumb] = useState([{ name: "Home", id: null }]);
  const [showDetails, setShowDetails] = useState(true);
  const [viewType, setViewType] = useState("grid");
  const [sortOrder, setSortOrder] = useState([{ dir: "asc" }]);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  // fetch
  const fetchFiles = async (folderId = null) => {
    try {
      const url = folderId
        ? `http://127.0.0.1:8000/files?folder=${folderId}`
        : "http://127.0.0.1:8000/files";
      const res = await fetch(url, {
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

  // Upload Files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);

    const formData = new FormData();

    selectedFiles.forEach(file => formData.append("uploaded_file", file));



    try {
      const res = await fetch("http://127.0.0.1:8000/files/upload", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }, // keep auth
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setMessage("Files uploaded successfully!");
      setSelectedFiles([]);
      fetchFiles(breadcrumb[breadcrumb.length - 1]?.id || null); // reload current folder

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Download file
  const handleDownload = async (fileId, originalName) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/download/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
  // View Logs
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

  //download logs
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

  // Create New Folder
  const handleNewFolderClick = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/files/folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: folderName,
          parent_id: breadcrumb[breadcrumb.length - 1]?.id || null,  // make sure id is number or null
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create folder");
      setMessage("Folder created successfully!");
      fetchFiles(breadcrumb[breadcrumb.length - 1].id || null);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(""), 3000);
    }
  };
  //open folder
  const handleFolderClick = async (folderId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/folder/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFiles(data); // update your frontend state
      setBreadcrumb(prev => [...prev, { id: folderId, name: data.name || "Folder" }]);
    } catch (err) {
      console.error("Failed to open folder:", err);
    }
  };

  // Handle Breadcrumb
  const handleBreadcrumbSelect = (item, index) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1));
    fetchFiles(item.id || null);
  };

  // Filter and Sort
  const filteredFiles = files
    .filter((file) =>
      file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder[0].dir === "asc")
        return a.original_name.localeCompare(b.original_name);
      return b.original_name.localeCompare(a.original_name);
    });

  // Format Date
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString() : "";

  return (
    <div className="min-h-screen p-8 bg-gray-500 dark:bg-gray-900 transition-colors">
      {/* <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        File Manager
      </h1> */}


      {/* Message */}
      {message && (
        <div className="mb-4 p-3 w-50 rounded border border-green-200 shadow text-white bg-white-500 dark:bg-white-600">
          {message}
        </div>
      )}

      {/* Toolbar */}
      <FileManagerToolbar
        files={selectedFiles}
        onFileChange={({ files }) => setSelectedFiles(Array.from(files))}
        onClearFileList={() => setSelectedFiles([])}
        onUploadComplete={handleUpload}
        onNewFolderClick={handleNewFolderClick}
        onViewChange={({ view }) => setViewType(view)}
        onSortChange={({ direction }) => setSortOrder([{ dir: direction }])}
        onSearchChange={setSearchQuery}
        onSwitchChange={(e) => setShowDetails(e.target.checked)}
        sort={sortOrder}
        splitItems={[]} // optional
      />

      {/* Breadcrumb */}
      <BreadcrumbComponent
        data={breadcrumb}
        onBreadcrumbSelect={handleBreadcrumbSelect}
      />

      {/* Files Grid/List */}
      <div
        className={
          viewType === "grid"
            ? "grid grid-cols-8 gap-3"
            : "overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg"
        }
      >
        {filteredFiles.length === 0 ? (
          <p className="text-center p-4 text-gray-500 dark:text-gray-300">
            No files or folders uploaded yet.
          </p>
        ) : (
          filteredFiles.map((file) =>
            viewType === "grid" ? (
              <div onClick={() => file.type === "folder" && handleFolderClick(file.id)}
                key={file.id}
                className=" border-gray-500 p-4 rounded shadow flex flex-col items-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="mb-2">
                  {getFileIcon(file, 40)} {/* size 40px */}
                </div>
                <p className="text-gray-900 dark:text-gray-500 text-xs">
                  {file.original_name}
                </p>
                {/* <div className="mt-2 flex gap-2">
                  {!file.is_folder && (
                    <button
                      onClick={() =>
                        handleDownload(file.id, file.original_name)
                      }
                      className="text-green-800 hover:text-green-600  px-2 py-1 rounded shadow"
                    >
                      <FaDownload />
                    </button>
                  )}
                  <button
                    onClick={() => handleViewLogs(file.id, file.original_name)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded shadow"
                  >
                    <FaEye />
                  </button>
                </div> */}
              </div>
            ) : (
              <tr key={file.id}>
                <td className="px-4 py-2 flex items-center gap-2 text-gray-800 dark:text-gray-500">
                  <div className="mb-2">
                    {getFileIcon(file, 20)} {/* size 40px */}
                  </div>

                  <div className="text-xs"> {file.original_name}</div>

                </td>
                {/* <td className="px-4 py-2 text-gray-800 dark:text-gray-100">
                  {file.is_folder ? "Folder" : "File"}
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-gray-100">
                  {file.uploaded_by}
                </td>
                <td className="px-4 py-2 text-gray-800 dark:text-gray-100">
                  {formatDate(file.uploaded_at)}
                </td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                 
                    <button
                      onClick={() =>
                        handleDownload(file.id, file.original_name)
                      }
                      className="bg-green-800 hover:bg-green-600 text-white px-3 py-1 rounded shadow"
                    >
                      <FaDownload />
                    </button>
                 
                  <button
                    onClick={() => handleViewLogs(file.id, file.original_name)}
                    className="bg-blue-800 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
                  >
                   <FaEye />
                  </button>
                </td> */}
              </tr>
            )
          )
        )}
      </div>

      {/* Log Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
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
                <p className="text-gray-500 dark:text-gray-300 text-center py-4">
                  No logs found.
                </p>
              )}
            </div>

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
