import React, { useEffect, useState } from "react";
import { BreadcrumbComponent } from "../components/BreadCrumbsComponents";
import { FileManagerToolbar } from "../components/FileManagerToolbar";
import { getFileIcon } from "../helper/Fileicons";
import { FaCopy, FaCross, FaCut, FaDownload, FaEdit, FaEye, FaPaste, FaStar, FaStarAndCrescent, FaTrash } from "react-icons/fa";
import CreateFolder from "../components/CreateFolder";
import { FaEllipsis, FaTextSlash, FaXmark } from "react-icons/fa6";
import { BiLeftArrow, BiLeftArrowCircle, BiRightArrow, BiRightArrowCircle } from "react-icons/bi";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [copiedFiles, setCopiedFiles] = useState([]);
  const [cutFiles, setCutFiles] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileId, setCurrentFileId] = useState(null);

  const [breadcrumb, setBreadcrumb] = useState([{ name: "", id: null }]);
  const [showDetails, setShowDetails] = useState(true);
  const [viewType, setViewType] = useState("grid");
  const [sortOrder, setSortOrder] = useState([{ dir: "asc" }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClickFile, setIsClickFile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isStar, setIsStar] = useState(false);



  const token = localStorage.getItem("token");

  useEffect(() => {
    const lastId = breadcrumb[breadcrumb.length - 1]?.id || 0;
    fetchFiles(lastId);
  }, [breadcrumb, currentPage]);


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
      setTimeout(() => setMessage(""), 2000);;
    }
  };

  const handleViewLogs = async (fileId, fileName) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/log/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } });
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
  const onNewFolderClick = () => {
    setShowModal(true);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setMessage("Folder name cannot be empty!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      const parentId = breadcrumb[breadcrumb.length - 1]?.id || null;

      const res = await fetch("http://127.0.0.1:8000/files/folder", {
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

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create folder");
      }

      setMessage(`Folder "${data.name}" created successfully!`);
      fetchFiles(parentId);
      setShowModal(false);
      setFolderName("");
    } catch (err) {
      setMessage(err.message || "Error creating folder");
    } finally {
      setTimeout(() => setMessage(""), 2000);
    }
  };


  const handleNewFileClick = async () => {
    const folderName = prompt("Enter file name with extention like (File.txt):");
    if (!folderName || folderName.trim() === "") {
      setMessage("Folder name cannot be empty!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      const parentId = breadcrumb[breadcrumb.length - 1]?.id || null;

      const res = await fetch("http://127.0.0.1:8000/files/createfile", {
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

      if (!res.ok) {
        throw new Error(data.detail || "Failed to create folder");
      }

      setMessage(`Folder "${data.name}" created successfully!`);

      fetchFiles(parentId);

    } catch (err) {
      setMessage(err.message || "Error creating folder");
    } finally {
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleRename = async (fileId, originalName) => {
    try {
      const newName = prompt("Enter a new name:", originalName);
      if (!newName || newName === originalName) return;

      const response = await fetch(`http://localhost:8000/files/rename?file_id=${fileId}&new_name=${encodeURIComponent(newName)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        alert(`Error: ${text}`);
        return;
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Rename failed:", error);
      alert("Rename failed. Check console for details.");
    }
  };

  const queryStr = (searchQuery || "").toString().toLowerCase();

  const filteredFiles = files
    .filter((file) => file.display_name)
    .filter((file) =>
      file.display_name.toLowerCase().includes(queryStr)
    )
    .sort((a, b) => {
      if (sortOrder[0].dir === "asc") {
        return a.display_name.localeCompare(b.display_name);
      }
      return b.display_name.localeCompare(a.display_name);
    });


  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString() : "";

  const handleFileClick = (id) => {
    setIsClickFile(isClickFile === id ? null : id);
  }

  const fetchFiles = async (folderId = null) => {
    try {
      const url = folderId
        ? `http://127.0.0.1:8000/files/folder/${folderId}`
        : `http://127.0.0.1:8000/files/folder/0`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch files");

      const data = await res.json();
      const updatedData = data.map(file => {
        const name = file.original_name || ""; // fallback
        const isFolder = file.is_folder;

        return {
          ...file,
          display_name: isFolder ? name : name.replace(/\.[^/.]+$/, ""),
        };
      });
      setFiles(updatedData);
    } catch (err) {
      console.error(err);
      setMessage("");
      setFiles([]);
    }
  };


  const handleFolderClick = (folderId, folderName) => {
    setBreadcrumb((prev) => [...prev, { name: folderName, id: folderId }]);
  };


  const handleBreadcrumbSelect = (item, index) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);

    fetchFiles(item.id);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("uploaded_file", file));
    const parentId = breadcrumb[breadcrumb.length - 1]?.id;
    if (parentId != null) formData.append("parent_id", parentId);

    try {
      const res = await fetch("http://127.0.0.1:8000/files/upload", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setMessage("Files uploaded successfully!");
      setSelectedFiles([]);

      const folderPath = breadcrumb.map((b) => b.name).join("/");
      fetchFiles(folderPath);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/delete/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to delete file");
      }

      setMessage("File deleted successfully");

      const folderPath = breadcrumb.map((b) => b.name).join("/");
      fetchFiles(folderPath);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleSelectFile = (file) => {
    setSelectedFiles((prev) => {
      const exists = prev.find((f) => f.id === file.id);
      if (exists) {
        return prev.filter((f) => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleCopy = () => {
    if (selectedFiles.length === 0) {
      setMessage("Select files/folders to copy!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    setCopiedFiles([...selectedFiles]);
    setMessage(`${selectedFiles.length} item(s) copied!`);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleCut = () => {
    if (selectedFiles.length === 0) {
      setMessage("Select files/folders to cut!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    setCutFiles([...selectedFiles]);
    setCopiedFiles([]);
    setMessage(`${selectedFiles.length} item(s) cut!`);
    setTimeout(() => setMessage(""), 2000);
  };

  const handlePaste = async () => {
    if (copiedFiles.length === 0 && cutFiles.length === 0) return;

    const destinationFolderId = breadcrumb[breadcrumb.length - 1]?.id || null;

    const isCut = cutFiles.length > 0;
    const targetFiles = isCut ? cutFiles : copiedFiles;

    try {
      const endpoint = isCut
        ? "http://127.0.0.1:8000/files/move"
        : "http://127.0.0.1:8000/files/copy";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          file_ids: targetFiles.map((f) => f.id),
          destination_folder_id: destinationFolderId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Failed to ${isCut ? "move" : "copy"} files`);
      }

      const data = await res.json();
      setMessage(
        `${isCut ? data.moved_files.length : data.copied_files.length} item(s) ${isCut ? "moved" : "pasted"
        }!`
      );
      setTimeout(() => setMessage(""), 2000);

      fetchFiles(destinationFolderId);

      setCopiedFiles([]);
      setCutFiles([]);
      setSelectedFiles([]);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
  }

 const handleStar = async (fileId) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/files/star?file_id=${fileId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to star file");

    const data = await res.json();
    console.log(data.message);

    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === fileId ? { ...f, is_star: data.is_star } : f
      )
    );
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="min-h-screen p-8 bg-gray-500 dark:bg-gray-900 transition-colors  ">


      {/* Toolbar */}
      <FileManagerToolbar
        files={selectedFiles}
        onFileChange={({ files }) => setSelectedFiles(Array.from(files))}
        onClearFileList={() => setSelectedFiles([])}
        onUploadComplete={handleUpload}
        onNewFileClick={handleNewFileClick}
        onNewFolderClick={onNewFolderClick}
        onViewChange={({ view }) => setViewType(view)}
        onSortChange={({ direction }) => setSortOrder([{ dir: direction }])}
        onSearchChange={setSearchQuery}
        onSwitchChange={(e) => setShowDetails(e.target.checked)}
        sort={sortOrder}
        splitItems={[]}
      />

      {/* Breadcrumb */}
      <BreadcrumbComponent
        data={breadcrumb}
        onBreadcrumbSelect={handleBreadcrumbSelect}
      />

      <div>
        {selectedFiles.length > 0 && (
          <div className="p-3 mb-5 bg-gray-100 dark:bg-gray-800 text-sm font-medium flex justify-between items-center">
            {selectedFiles.length > 0 ? (
              <span className="text-white">
                {selectedFiles.filter((f) => f.is_folder).length} folder(s) and{" "}
                {selectedFiles.filter((f) => !f.is_folder).length} file(s)
                selected
              </span>
            ) : (
              <span>No files selected</span>
            )}
            <div className="flex">
              {selectedFiles.length > 0 && (

                <div>
                  <button
                    onClick={handleCut}
                    className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-200"
                  >
                    <FaCut />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-200"
                  >
                    <FaCopy />
                  </button>
                </div>
              )}

              {(cutFiles.length > 0 || copiedFiles.length > 0) && (
                <button
                  onClick={handlePaste}
                  className="ml-4 px-3  bg-green-200 dark:bg-green-700 rounded hover:bg-green-300 dark:hover:bg-green-600 text-gray-200"
                >
                  <FaPaste />
                </button>
              )}
              <button className="ml-4 bg-gray-700 text-red-200 px-3  rounded" onClick={handleClose}>X</button>

            </div>

          </div>
        )}

        {/* Files Grid/List */}
        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-10 gap-3"
              : "overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg"
          }
        >
          {filteredFiles.length === 0 ? (
            <p className="text-center p-4 text-gray-500 dark:text-gray-300">
              File / Folder Not Found !
            </p>
          ) : (
            filteredFiles.map((file) =>

              viewType === "grid" ? (
                <div
                  key={file.id}
                  className={`relative p-4 rounded flex flex-col items-center text-center cursor-pointer 
       hover:bg-gray-50 dark:hover:bg-gray-700
       ${selectedFiles.some((f) => f.id === file.id)
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                    }`}
                >
                  {/* Checkbox on hover */}
                  <input
                    type="checkbox"
                    checked={selectedFiles.some((f) => f.id === file.id)}
                    onChange={() => handleSelectFile(file)}
                    className="absolute top-2 left-2 w-4 h-4 opacity-0 hover:opacity-100 transition-opacity"
                  />

                  {/* More icon */}
                  <div
                    className="text-white text-right flex justify-end ms-auto hover:bg-gray-800 rounded-2xl p-2"
                    onClick={() => handleFileClick(file.id)}
                  >
                    <FaEllipsis />
                  </div>

                  {/* File Icon */}
                  <div className="mb-2">{getFileIcon(file, 40)}</div>

               <div key={file.id} className="flex items-center justify-between text-xs mb-2">
  {/* File name */}
  <span
    className="text-gray-900 dark:text-gray-500 cursor-pointer"
    onClick={() =>
      file.is_folder && handleFolderClick(file.id, file.display_name)
    }
  >
    {file.display_name}
  </span>

  {/* Star button */}
  <button onClick={() => handleStar(file.id)}>
    <FaStar
      className={`ml-2 cursor-pointer transition-colors duration-200 ${
        file.is_star ? "text-yellow-500" : "text-white"
      }`}
    />
  </button>
</div>


                  {/* File Actions Popup */}
                  {isClickFile === file.id && (
                    <div className="flex items-center justify-center relative z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg m-2 absolute w-50 max-w-lg p-6">
                        <div className="flex justify-end mb-4 text-sm pb-2">
                          <button
                            className="text-red-400 bg-gray-700 rounded-xl ml-2 px-2 py-1"
                            onClick={() => setIsClickFile(false)}
                          >
                            <FaXmark />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-sm">
                          <button
                            onClick={() =>
                              handleDownload(file.id, file.display_name)
                            }
                            className="flex text-gray-500 hover:text-green-200"
                          >
                            <FaDownload className="mr-2" /> Download
                          </button>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-sm">
                          <button
                            onClick={() =>
                              handleRename(file.id, file.original_name)
                            }
                            className="flex text-gray-500 hover:text-pink-200"
                          >
                            <FaEdit className="mr-2" /> Rename
                          </button>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-sm">
                          <button
                            onClick={() =>
                              handleViewLogs(file.id, file.display_name)
                            }
                            className="flex text-gray-500 hover:text-blue-200"
                          >
                            <FaEye className="mr-2" /> Details
                          </button>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-sm">
                          <button
                            onClick={() =>
                              handleDeleteFile(file.id, file.display_name)
                            }
                            className="flex text-gray-500 hover:text-red-200"
                          >
                            <FaTrash className="mr-2" /> Delete
                          </button>
                        </div>


                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <tr
                  key={file.id}
                  className={`border-b border-gray-700 py-3 w-full p-3 
       ${selectedFiles.some((f) => f.id === file.id)
                      ? "bg-blue-100 dark:bg-gray-700"
                      : ""
                    }`}
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedFiles.some((f) => f.id === file.id)}
                      onChange={() => handleSelectFile(file)}
                      className="appearance-none text-xs h-3 w-3 border border-gray-300 rounded checked:bg-blue-500 checked:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2 flex items-center gap-2 text-gray-800 dark:text-gray-500 cursor-pointer">
                    {getFileIcon(file, 20)}
                    <div
                      className="text-xs"
                      onClick={() =>
                        file.is_folder &&
                        handleFolderClick(file.id, file.display_name)
                      }
                    >
                      {file.display_name} {file.size} <button onClick={() => handleStar(file.id)}>
                        <FaStar className={`ml-2 cursor-pointer ${file.is_star ? "text-white" : "text-yellow-500"}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {file.uploaded_by}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        handleDownload(file.id, file.display_name)
                      }
                      className="hover:text-green-400 text-gray-500 rounded text-xs"
                    >
                      <FaDownload />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        handleViewLogs(file.id, file.display_name)
                      }
                      className="hover:text-blue-400 text-gray-500 text-xs rounded"
                    >
                      <FaEye />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        handleDeleteFile(file.id, file.display_name)
                      }
                      className="flex text-gray-500 hover:text-red-200 text-xs"
                    >
                      <FaTrash className="mr-2" />
                    </button>
                  </td>
                  <td className="
                  px-4 py-2"> <button
                      onClick={() =>
                        handleRename(file.id, file.original_name)
                      }
                      className="flex text-gray-500 hover:text-pink-200"
                    >
                      <FaEdit className="mr-2" />
                    </button></td>
                </tr>
              )
            )
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-4 page-control">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            <BiLeftArrowCircle />
          </button>
          <span className="px-3 py-1 text-gray-300">
            {" "}
            <span className="text-green-500">{currentPage}</span> / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            <BiRightArrowCircle />
          </button>
        </div>
      )}

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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-gray-800 rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Create New Folder</h3>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full border text-white border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCreateFolder}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Done
              </button>
              <button
                onClick={() => { setShowModal(false); setFolderName(""); }}
                className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {message && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg text-white shadow-lg w-full max-w-lg p-6 relative">
            {message}
          </div>
        </div>

      )}
    </div>
  );
}
