import React, { useEffect, useState } from "react";
import { BreadcrumbComponent } from "../components/BreadCrumbsComponents";
import { FileManagerToolbar } from "../components/FileManagerToolbar";
import { getFileIcon } from "../helper/Fileicons";
import { FaAudioDescription, FaCopy, FaCut, FaDownload, FaEdit, FaEllipsisV, FaEye, FaPaste, FaStar, FaTrash, FaWrench, FaUndo, FaTrashAlt, FaPlus, FaFolderPlus } from "react-icons/fa";
import CreateFolder from "../components/CreateFolder";
import { FaEllipsis, FaXmark, FaExclamation, FaTriangleExclamation, FaCloudArrowUp, FaFileCirclePlus } from "react-icons/fa6";
import { BiLeftArrowCircle, BiRightArrowCircle } from "react-icons/bi";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [copiedFiles, setCopiedFiles] = useState([]);
  const [cutFiles, setCutFiles] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [properitesModalOpen, setProperitesModalOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [currentProperties, setCurrentProperties] = useState([]);
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileId, setCurrentFileId] = useState(null);

  const [breadcrumb, setBreadcrumb] = useState([{ name: "", id: null }]);
  const [showDetails, setShowDetails] = useState(true);
  const [viewType, setViewType] = useState("grid");
  const [sortOrder, setSortOrder] = useState([{ dir: "asc" }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClickFile, setIsClickFile] = useState(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isStar, setIsStar] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
const [fileToRename, setFileToRename] = useState({ id: null, filename: '', newName: '' });  

  const token = localStorage.getItem("token");

  useEffect(() => {
    const lastId = breadcrumb[breadcrumb.length - 1]?.id || 0;
    fetchFiles(lastId);
  }, [breadcrumb, currentPage, searchQuery, isGlobalSearch]);


  const handleDownload = async (fileId, fileName) => {
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
      a.download = fileName || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setTimeout(() => setMessage(""), 2000);;
    }
  };

  const handleViewProperties = async (fileId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/properties?file_id=${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      setCurrentProperties([data]);
      setProperitesModalOpen(true);
    } catch (err) {
      setMessage(err.message);
    }
  };


  const handleViewLogs = async (fileId, fileName) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/log/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.ok ? await res.json() : { logs: [] };

      setCurrentLogs(data.logs || []);
    } catch (err) {
      setCurrentLogs([]);
    } finally {
      setCurrentFileName(fileName);
      setCurrentFileId(fileId);
      setLogModalOpen(true);
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


  const handleCreateFile = async () => {
    if (!fileName.trim()) return alert("File name is required");

    const parentId = breadcrumb[breadcrumb.length - 1]?.id || null;

    try {
      const res = await fetch(`http://127.0.0.1:8000/files/createfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fileName.trim(),
          parent_id: parentId, // <-- important
        }),
      });

      if (!res.ok) throw new Error("Failed to create file");

      const newFile = await res.json();
      setFiles((prev) => [...prev, newFile]); 
      setShowFileModal(false);
      setFileName("");
    } catch (err) {
      console.error(err.message);
      setMessage(err.message);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const openRenameModal = (fileId, currentFilename) => {
    setFileToRename({ id: fileId, fileName: currentFilename, newName: fileName });
    setShowRenameModal(true);
    setIsClickFile(null); 
  };

  const handleRenameSubmit = async () => {
    const { id: fileId, filename: currentFilename, newName } = fileToRename;
    if (!newName.trim() || newName === currentFilename) {
      setShowRenameModal(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/files/rename?file_id=${fileId}&new_name=${encodeURIComponent(newName)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Rename failed");
      }

      const data = await response.json();
      showMessage(data.message || "File renamed successfully!");

      const parentId = breadcrumb[breadcrumb.length - 1]?.id || 0;
      fetchFiles(parentId); // Refresh files
    } catch (error) {
      showMessage(error.message || "Rename failed.");
    } finally {
      setShowRenameModal(false);
      setFileToRename({ id: null, fileName: '', newName: '' });
    }
  };

  const sortedFiles = files
    .filter((file) => file.display_name)
    .sort((a, b) => {
      if (sortOrder[0].dir === "asc") {
        return a.display_name.localeCompare(b.display_name);
      }
      return b.display_name.localeCompare(a.display_name);
    });

  const filteredFiles = sortedFiles;

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString() : "";

  const handleFileClick = (id) => {
    setIsClickFile(isClickFile === id ? null : id);
  }

const fetchFiles = async (folderId = null) => {
    try {
        let url;
        const query = searchQuery.trim();
        const targetFolderId = folderId !== null ? folderId : (breadcrumb[breadcrumb.length - 1]?.id || 0);

        if (targetFolderId === "recyclebin") {
            url = `http://127.0.0.1:8000/files/recyclebin`;
        } 
        else if (query && isGlobalSearch) {
            url = `http://127.0.0.1:8000/files/search/${encodeURIComponent(query)}`;
        } 
        else { 
             url = targetFolderId
                ? `http://127.0.0.1:8000/files/folder/${targetFolderId}`
                : `http://127.0.0.1:8000/files/folder/0`;
        }

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch files");

        const rawData = await res.json();
        let data;

        if (targetFolderId === "recyclebin" || (query && isGlobalSearch)) {
            data = Array.isArray(rawData?.results) ? rawData.results : [];
        } else {
            data = Array.isArray(rawData) ? rawData : [];
        }
        
        const updatedData = data.map(file => { 
            const name = file.filename || "";
            const isFolder = file.is_folder;

            return {
                ...file,
                display_name: isFolder ? name : name.replace(/\.[^/.]+$/, ""),
            };
        });
        
        setFiles(updatedData); 

    } catch (err) {
        console.error("Error fetching files:", err);
        setMessage("Failed to load files.");
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
  const handleGoParent = () => {
    if (breadcrumb.length <= 1) return; 

    const parentIndex = breadcrumb.length - 2;
    const parentItem = breadcrumb[parentIndex];
    handleBreadcrumbSelect(parentItem, parentIndex);
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

      const folderPath = breadcrumb[breadcrumb.length - 1]?.id;
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

      const folderPath = breadcrumb[breadcrumb.length - 1]?.id;
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

  const showMessage = (msg) => {
    setMessage(msg);
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
          file_ids: targetFiles.map(f => f.id),
          destination_folder_id: destinationFolderId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `Failed to ${isCut ? "move" : "copy"} files`);
      }

      const data = await res.json();
      const count = isCut ? data.moved_files.length : data.copied_files.length;
      showMessage(`${count} item(s) ${isCut ? "moved" : "pasted"}!`);

      fetchFiles(destinationFolderId);

      setCopiedFiles([]);
      setCutFiles([]);
      setSelectedFiles([]);
    } catch (err) {
      showMessage(err.message);
    }
  };


  const handleClose = () => {
    setSelectedFiles([]);
  }

  const handleToggleStar = async (fileId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/star?file_id=${fileId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Star API response:", data);

      if (!res.ok || !data.id) throw new Error("Invalid response from server");

      setFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, is_star: data.is_star } : f)
      );
    } catch (err) {
      console.error("Star toggle error:", err);
    }
  };

  const handleViewRecycleBin = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/recyclebin`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch recycle bin items");

      const items = Array.isArray(data.results) ? data.results : data;

      setFiles(items);

      setBreadcrumb([{ name: "Recycle Bin", id: "recyclebin" }]);
    } catch (err) {
      console.error("Recycle Bin fetch error:", err.message);
      setMessage("Failed to load recycle bin items.");
      setTimeout(() => setMessage(""), 2000);
    }
  };
  const handlePermanentDelete = async (fileId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/permenent_delete/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to permanently delete file");
      }
      setMessage("File permanently deleted");
      const folderPath = breadcrumb[breadcrumb.length - 1]?.id;
      fetchFiles(folderPath);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTimeout(() => setMessage(""), 2000);
    }
  };

const handleRestoreFile = async (fileId) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/files/restore/${fileId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to restore file");
    }
    setMessage("File restored successfully");
    const folderPath = breadcrumb[breadcrumb.length - 1]?.id;
    fetchFiles(folderPath);
  } catch (err) {
    setMessage(err.message);
  } finally {   
    setTimeout(() => setMessage(""), 2000);
  }
};
  return (
    <div className="min-h-screen p-8 bg-gray-500 dark:bg-gray-900 transition-colors ">


      <FileManagerToolbar
        files={selectedFiles} 
        setFiles={setSelectedFiles} 
        onFileChange={({ files: newFiles }) => { 
          setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(newFiles)]);
        }}
        onClearFileList={() => setSelectedFiles([])}
        onUploadComplete={handleUpload}
        onNewFileClick={() => setShowFileModal(true)}
        onNewFolderClick={onNewFolderClick}
        onViewChange={({ view }) => setViewType(view)}
        onSortChange={({ direction }) => setSortOrder([{ dir: direction }])}
        onSearchChange={setSearchQuery}
        onSwitchChange={(e) => setShowDetails(e.target.checked)}
 isGlobalSearch={isGlobalSearch}
 setIsGlobalSearch={setIsGlobalSearch}
        sort={sortOrder}
        splitItems={[]}
        viewRecycleBin={handleViewRecycleBin} 
      />



      <BreadcrumbComponent
        data={breadcrumb}
        onBreadcrumbSelect={handleBreadcrumbSelect}
        onGoParent={handleGoParent}
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
                  className="ml-4 px-3 bg-green-200 dark:bg-green-700 rounded hover:bg-green-300 dark:hover:bg-green-600 text-gray-200"
                >
                  <FaPaste />
                </button>
              )}
              <button className="ml-4 bg-gray-700 text-red-200 px-3 rounded" onClick={handleClose}>X</button>

            </div>

          </div>
        )}

        <div
          className={
            viewType === "grid"
              ? `grid ${filteredFiles.length === 0 ? "grid-cols-1" : "grid-cols-7"} gap-2`
              : "  bg-white dark:bg-gray-800 shadow-md rounded-lg p-2"
          }
        >
          {filteredFiles.length === 0 ? (
            <div className="flex gap-5 justify-center items-center flex-col text-center p-4 text-gray-500 dark:text-gray-300 h-100 text-lg">
              <div>
                <FaTriangleExclamation size={"50"} />
              </div>
              Empty Folder
              <div className="flex gap-2">
                <button onClick={onNewFolderClick} className="flex items-center p-2 bg-purple-600 border border-purple-600 text-white rounded shadow hover:bg-purple-700 transition">
                  <FaFolderPlus className="inline mr-2 font-normal" />
                  Folder
                </button>
                <button
                  onClick={() => setShowFileModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 border border-green-600 text-white rounded shadow hover:bg-green-700 transition"
                >
                  <FaFileCirclePlus className="inline mr-2 font-normal" />
                  File
                </button>



              </div>
            </div>
          ) : (
            filteredFiles.map((file) =>

              viewType === "grid" ? (
                <div
                  key={file.id}
                  className={`relative p-2 rounded flex flex-col items-center text-center cursor-pointer 
 hover:bg-gray-50 dark:hover:bg-gray-700
 ${selectedFiles.some((f) => f.id === file.id)
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.some((f) => f.id === file.id)}
                    onChange={() => handleSelectFile(file)}
                    className="absolute top-2 left-2 w-4 h-4 opacity-0 hover:opacity-100 transition-opacity"
                  />

                  <div
                    className="text-white text-right flex justify-end ms-auto hover:bg-gray-800 rounded-2xl p-2"
                    onClick={() => handleFileClick(file.id)}
                  >
                    <FaEllipsis />
                  </div>

                  <div className="mb-2">{getFileIcon(file, 40)}</div>

                  <div key={file.id} className=" text-xs mb-2">
                    <p
                      className="text-gray-900 dark:text-gray-500 cursor-pointer whitespace-normal text-xs w-40 break-words"
                      onClick={() =>
                        file.is_folder && handleFolderClick(file.id, file.display_name)
                      }
                    >
                      {file.display_name}
                    </p>


                  </div>


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

                        {breadcrumb[breadcrumb.length - 1]?.id === "recyclebin" ? (
                          <>
                            <div className="flex justify-between items-center mb-4 text-sm">
                              <button
                                onClick={() => handleRestoreFile(file.id)}
                                className="flex text-gray-500 hover:text-green-300"
                              >
                                <FaUndo className="mr-2" /> Restore
                              </button>
                            </div>

                            <div className="flex justify-between items-center mb-4 text-sm">
                              <button
                                onClick={() => handlePermanentDelete(file.id)}
                                className="flex text-gray-500 hover:text-red-300"
                              >
                                <FaTrashAlt className="mr-2" /> Permanent Delete
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-4 text-sm">
                              <button
                                onClick={() => handleDownload(file.id, file.display_name)}
                                className="flex text-gray-500 hover:text-green-200"
                              >
                                <FaDownload className="mr-2" /> Download
                              </button>
                            </div>

                            <div className="flex justify-between items-center mb-4 text-sm">
                              <button
                                onClick={() => openRenameModal(file.id, file.fileName)} 
                                className="flex text-gray-500 hover:text-pink-200"
                              >
                                <FaEdit className="mr-2" /> Rename
                              </button>
                            </div>

                            <div className="flex justify-between items-center mb-4 text-sm">
                              <button
                                onClick={() => handleViewLogs(file.id, file.display_name)}
                                className="flex text-gray-500 hover:text-blue-200"
                              >
                                <FaEye className="mr-2" /> Details
                              </button>
                            </div>

                            <div className="flex justify-between items-center mb-4 text-sm">
                              <button
                                onClick={() => handleDeleteFile(file.id, file.display_name)}
                                className="flex text-gray-500 hover:text-red-200"
                              >
                                <FaTrash className="mr-2" /> Delete
                              </button>
                            </div>


                            {/* <div className="flex justify-between items-center mb-4 text-sm">
 <button
onClick={() => handleToggleStar(file.id)}
className={`text-sm flex items-center ${file.is_star ? "text-yellow-400" : "text-gray-400"
 }`}
 >
<FaStar className="mr-2" />
{file.is_star ? "Unstar" : "Star"}
 </button>
</div> */}

                            <div className="flex justify-between items-center mb-4 text-sm">
                              <button
                                onClick={() => handleViewProperties(file.id)}
                                className="flex text-gray-500 hover:text-red-200"
                              >
                                <FaWrench className="mr-2 mt-1" /> Properties
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <tr
                  key={file.id}
                  className={`border-b border-gray-300 dark:border-gray-700 ${selectedFiles.some((f) => f.id === file.id)
                    ? "bg-blue-50 dark:bg-gray-700"
                    : ""
                    }`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedFiles.some((f) => f.id === file.id)}
                      onChange={() => handleSelectFile(file)}
                      className="appearance-none h-4 w-4 border border-gray-300 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* File name */}
                  <td className="px-3 py-2 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300 cursor-pointer">
                    {getFileIcon(file, 25)}
                    <div
                      className="truncate max-w-xs"
                      onClick={() =>
                        file.is_folder && handleFolderClick(file.id, file.display_name)
                      }
                    >
                      {file.display_name} <span className="text-xs text-gray-500 dark:text-gray-400">{file.size}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-500">
                    {file.path}
                  </td>

                  {/* Three-dot menu */}
                  <td className="px-3 py-2 relative text-right">
                    <button
                      onClick={() =>
                        setSelectedMenu(selectedMenu === file.id ? null : file.id)
                      }
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded"
                    >
                      <FaEllipsisV size={16} />
                    </button>

                    {/* Dropdown menu */}
                    {selectedMenu === file.id && (
                       <div className="absolute bottom-0  right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg z-20 overflow-hidden">
                        {/* Close button */}
                        <div className="flex justify-end border-b border-gray-200 dark:border-gray-700">
                          <button
                            className="text-red-400 rounded-full p-1 m-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setSelectedMenu(false)}
                          >
                            <FaXmark size={12} />
                          </button>
                        </div>
                         {breadcrumb[breadcrumb.length - 1]?.id === "recyclebin" ?(
                          <><div className="flex flex-col text-sm text-gray-800 dark:text-gray-300">
                          <button
                            onClick={() => handleRestoreFile(file.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FaTrashAlt /> Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(file.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FaTrashAlt /> PermanentDelete
                          </button>
                          
                        </div></>
                          ):(<>
                          <div className="flex flex-col text-sm text-gray-800 dark:text-gray-300">
                          <button
                            onClick={() => handleDownload(file.id, file.display_name)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FaDownload /> Download
                          </button>
                          <button
                            onClick={() => handleViewLogs(file.id, file.display_name)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FaEye /> View Logs
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id, file.display_name)}
                            className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-700 flex items-center gap-2"
                          >
                            <FaTrash /> Delete
                          </button>
                          <button
                            onClick={() => openRenameModal(file.id, file.fileName)} 
                            className="w-full text-left px-4 py-2 hover:bg-pink-100 dark:hover:bg-pink-700 flex items-center gap-2"
                          >
                            <FaEdit /> Rename
                          </button>
                          <button
                            onClick={() => handleViewProperties(file.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FaWrench /> Properties
                          </button>
                        </div>
                          </>)}

                        {/* Action buttons */}
                        
                      </div>
                     
                    )}
                  </td>
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

      {logModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-500">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 ">
                {currentFileName} - Logs
              </h2>
              <button
                onClick={() => setLogModalOpen(false)}
                className="text-red-500 px-1 font-bold text-xl hover:text-red-700 dark:hover:text-red-400 transition"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="max-h-96 overflow-y-auto pb-2 text-sm">
              {currentLogs.length > 0 ? (
                currentLogs.map((log, index) => (
                  <div
                    key={index}
                    className="p-2 text-gray-700 dark:text-gray-200"
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

            {/* Footer */}
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


      {properitesModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg relative">


            <div className="max-h-96 overflow-y-auto pb-2 text-sm">

              {currentProperties.length > 0 ? (
                <div className="grid gap-4">
                  {currentProperties.map((prop, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md p-3 "
                    >
                      <div className="flex items-center mb-4 pb-3 border-b border-gray-500 p-3">
                        {getFileIcon(prop, 30)}
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 ms-2">
                          {prop.name} - Properties
                        </h2>
                        <button
                          onClick={() => setProperitesModalOpen(false)}
                          className="text-red-500 px-1 font-bold text-xl hover:text-red-700 dark:hover:text-red-400 transition ms-auto"
                        >
                          ×
                        </button>
                      </div>


                      {/* File Info Table */}
                      <div className="overflow-x-auto p-3">
                        <table className="min-w-full text-gray-700 dark:text-gray-300 text-sm">
                          <tbody>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <td className="font-medium px-4 py-2">Size:</td>
                              <td className="px-4 py-2">{prop.size}</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <td className="font-medium px-4 py-2">Location:</td>
                              <td className="px-4 py-2">{prop.absolute_path}</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <td className="font-medium px-4 py-2">Created:</td>
                              <td className="px-4 py-2">{prop.created_at}</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <td className="font-medium px-4 py-2">Modified:</td>
                              <td className="px-4 py-2">{prop.modified_at}</td>
                            </tr>
                            <tr>
                              <td className="font-medium px-4 py-2">Accessed:</td>
                              <td className="px-4 py-2">{prop.accessed_at}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-300 text-center py-6">
                  No Properties found.
                </p>
              )}

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
      {showFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-gray-800 rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Create New File</h3>

            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              className="w-full border text-white border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
            />



            <div className="flex justify-end gap-2">
              <button
                onClick={handleCreateFile}
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Done
              </button>
              <button
                onClick={() => { setShowFileModal(false); setFileName(""); }}
                className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-gray-800 rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Rename Item</h3>
            <p className="text-sm text-gray-400 mb-2">Current Name: **{fileToRename.filename}**</p>
            <input
              type="text"
              value={fileToRename.newName}
              onChange={(e) => setFileToRename(prev => ({ ...prev, newName: e.target.value }))}
              placeholder="Enter new name"
              className="w-full border text-white border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
            />
            <div className="flex justify-end gap-2">
<button
    onClick={handleRenameSubmit}
    className="bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 disabled:opacity-50"
    disabled={!fileToRename.newName.trim() || fileToRename.newName === fileToRename.filename}
>
    Rename
</button>
              <button
                onClick={() => { setShowRenameModal(false); setFileToRename({ id: null, fileName: '', newName: '' }); }}
                className="bg-gray-300 text-gray-700 p-2 rounded shadow hover:bg-gray-400"
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