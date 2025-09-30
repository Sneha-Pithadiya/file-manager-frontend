import React, { useEffect, useState } from "react";
import { BreadcrumbComponent } from "../components/BreadCrumbsComponents";
import { FileManagerToolbar } from "../components/FileManagerToolbar";
import { getFileIcon } from "../helper/Fileicons";
import { FaCross, FaDownload, FaEye, FaTrash } from "react-icons/fa";
import CreateFolder from "../components/CreateFolder";
import { FaEllipsis, FaXmark } from "react-icons/fa6";

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
  const [isClickFile, setIsClickFile] = useState(false);

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
  const handleFolderClick = async (folderId, folderName) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/folder/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFiles(data); // update your frontend state
      setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
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


  //Action Icon show / hide

  const handleFileClick = (id) => {
    setIsClickFile(isClickFile === id ? null : id);

  }
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
              <div onClick={() => file.is_folder && handleFolderClick(file.id, file.original_name)}

                key={file.id}
                className=" border-gray-500 p-4 rounded shadow flex flex-col items-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="text-white text-right flex justify-end ms-auto hover:bg-gray-800  rounded-2xl p-2" onClick={() => handleFileClick(file.id)}><FaEllipsis /></div>
                <div className="mb-2">
                  {getFileIcon(file, 40)} {/* size 40px */}
                </div>
                <p className="text-gray-900 dark:text-gray-500 text-xs">
                  {file.original_name}
                </p>
                {isClickFile === file.id && (
                  <div className=" flex items-center justify-center relative z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg m-2 absolute   w-50 max-w-lg p-6 ">
                      <div className="flex justify-between items-center mb-4 text-sm pb-2 text-end text-right">

                        <button className="text-red-400 bg-gray-700 rounded-xl ml-2 px-2 py-1 text-end" onClick={() => setIsClickFile(false)}><FaXmark /></button>
                      </div>
                      <div className="flex justify-between items-center mb-4 text-sm ">

                        <button
                          onClick={() =>
                            handleDownload(file.id, file.original_name)
                          }
                          className=" flex text-gray-500 hover:text-green-200"
                        >
                          <FaDownload className="mr-2" /> Download
                        </button>
                      </div>
                      <div className="flex justify-between items-center mb-4 text-sm">

                        <button
                          onClick={() => handleViewLogs(file.id, file.original_name)}
                          className=" flex text-gray-500 hover:text-blue-200"
                        >
                          <FaEye className="mr-2" /> Details
                        </button>
                      </div>

                      <div className="flex justify-between items-center mb-4 text-sm">

                        <button
                          onClick={() => handleViewLogs(file.id, file.original_name)}
                          className=" flex text-gray-500 hover:text-red-200"
                        >
                          <FaTrash className="mr-2" /> Delete
                        </button>
                      </div>


                      {/* <div className="mt-4 flex justify-end gap-3">
                        <button
                          onClick={() => setIsClickFile(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-black dark:text-white px-4 py-2 rounded shadow transition"
                        >
                          Close
                        </button>
                       
                      </div> */}
                    </div>

                  </div>

                )}
              </div>
            ) : (
              <>
                <table className=" w-full">
                  <tbody>

                    {files.map((file) => (
                      <tr key={file.id} className="border-b border-gray-700 py-3 w-full">
                        <td className="px-4 py-2 flex items-center gap-2 text-gray-800 dark:text-gray-500">
                          {getFileIcon(file, 20)} {/* icon size 20 */}
                          <div className="text-xs">{file.original_name}</div>
                        </td>
                        <td className="px-4 py-2 text-gray-500">{file.uploaded_by}{file.uploaded_at}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleDownload(file.id, file.original_name)}
                            className="hover:text-green-400 text-gray-500 px-3 py-1 rounded shadow"
                          >
                            <FaDownload />
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleViewLogs(file.id, file.original_name)}
                            className="hover:text-blue-400 text-gray-500 px-3 py-1 rounded shadow"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>



              </>


            )
          )
        )}
      </div>

      {/* Log Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <div className="flex justify-between items-center mb-4 border-b border-gray-500 pb-3">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 ">
                {currentFileName} - Logs
              </h2>
              <button
                onClick={() => setLogModalOpen(false)}
                className="text-red-500   px-1 font-bold text-xl hover:text-red-700 dark:hover:text-red-400 transition"
              >
                ×
              </button>

            </div>

            <div className="max-h-96 overflow-y-auto border-b  border-gray-500  pb-2  text-sm">
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
                onClick={downloadLogs}
                className="bg-green-500 flex hover:bg-green-600 text-white px-4 py-2 rounded shadow transition"
              >
                <FaDownload className="mr-2 mt-1" /> Log File
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
