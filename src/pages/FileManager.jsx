import React, { useEffect, useState } from "react";
import { BreadcrumbComponent } from "../components/BreadCrumbsComponents";
import { FileManagerToolbar } from "../components/FileManagerToolbar";
import { getFileIcon } from "../helper/Fileicons";
import {
  FaAudioDescription,
  FaFolderOpen,
  FaTrashRestoreAlt,
  FaCopy,
  FaCut,
  FaDownload,
  FaEdit,
  FaEllipsisV,
  FaEye,
  FaPaste,
  FaStar,
  FaTrash,
  FaWrench,
  FaUndo,
  FaTrashAlt,
  FaPlus,
  FaFolderPlus,
} from "react-icons/fa";
import CreateFolder from "../components/CreateFolder";
import {
  FaEllipsis,
  FaXmark,
  FaExclamation,
  FaTriangleExclamation,
  FaCloudArrowUp,
  FaFileCirclePlus,
} from "react-icons/fa6";
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
  const [fileToRename, setFileToRename] = useState({
    id: null,
    filename: "",
    newName: "",
  });
  // Add these with your other states
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    file: null,
  });
  const clickTimer = React.useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const lastId = breadcrumb[breadcrumb.length - 1]?.id || 0;
    fetchFiles(lastId);
  }, [breadcrumb, currentPage, searchQuery, isGlobalSearch]);

  // download file / folder
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
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // viewProperties
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

  // viewlogs

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

  // downloadlogs
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
  // foldercreate model open
  const onNewFolderClick = () => {
    setShowModal(true);
  };

  // create folder
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

  // create file
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
          parent_id: parentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create file");

      const folderPath = parentId;
      await fetchFiles(folderPath);

      setShowFileModal(false);
      setFileName("");
    } catch (err) {
      console.error(err.message);
      setMessage(err.message);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // rename model open
  const openRenameModal = (fileId, currentFilename) => {
    setFileToRename({
      id: fileId,
      fileName: currentFilename,
      newName: currentFilename,
    });
    setShowRenameModal(true);
    setIsClickFile(null);
  };

  // hadlerename
  const handleRenameSubmit = async () => {
    // 1. Get the original file object to check if it's a folder or file
    const originalFile = files.find((f) => f.id === fileToRename.id);
    const { id: fileId, fileName: currentFilename } = fileToRename;
    let newName = fileToRename.newName;

    if (!newName?.trim()) {
      setShowRenameModal(false);
      return;
    }

    // 2. Logic to preserve extension for files
    if (originalFile && !originalFile.is_folder) {
      // Get extension from the original database filename (e.g., ".png")
      const extension = currentFilename.slice(
        ((currentFilename.lastIndexOf(".") - 1) >>> 0) + 2
      );

      // Check if the user already typed the extension. If not, add it.
      if (
        extension &&
        !newName.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
      ) {
        newName = `${newName}.${extension}`;
      }
    }

    // 3. Prevent unnecessary API calls
    if (newName === currentFilename) {
      setShowRenameModal(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/files/rename?file_id=${fileId}&new_name=${encodeURIComponent(
          newName
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Rename failed");
      }

      const data = await response.json();
      showMessage("File renamed successfully!");

      const parentId = breadcrumb[breadcrumb.length - 1]?.id || 0;
      fetchFiles(parentId);
    } catch (error) {
      showMessage(error.message || "Rename failed.");
    } finally {
      setShowRenameModal(false);
      setFileToRename({ id: null, fileName: "", newName: "" });
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

  // file click
  const handleFileClick = (id) => {
    setIsClickFile(isClickFile === id ? null : id);
  };

  // fetchFiles
  const fetchFiles = async (folderId = null) => {
    try {
      let url;
      const query = searchQuery.trim();
      // Determine current folder from breadcrumbs or param
      const currentFolderId = breadcrumb[breadcrumb.length - 1]?.id || 0;
      const targetFolderId = folderId !== null ? folderId : currentFolderId;

      // 1. GLOBAL SEARCH PRIORITY
      // If user typed something, we ignore the folder and search everywhere
      if (query) {
        url = `http://127.0.0.1:8000/files/search/${encodeURIComponent(query)}`;
      }
      // 2. RECYCLE BIN
      else if (targetFolderId === "recyclebin") {
        url = `http://127.0.0.1:8000/files/recyclebin`;
      }
      // 3. NORMAL FOLDER VIEW
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

      if (query || targetFolderId === "recyclebin") {
        data = Array.isArray(rawData?.results)
          ? rawData.results
          : Array.isArray(rawData)
          ? rawData
          : [];
      } else {
        data = Array.isArray(rawData) ? rawData : [];
      }

      const updatedData = data.map((file) => {
        const name = file.filename || "";
        const isFolder = file.is_folder;

        return {
          ...file,
          display_name: isFolder ? name : name.replace(/\.[^/.]+$/, ""),
        };
      });

      setFiles(updatedData); // Update your state with the search or folder results
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };
  // folder open on click
  const handleFolderClick = (folderId, folderName) => {
    setBreadcrumb((prev) => [...prev, { name: folderName, id: folderId }]);
  };
  // breadcrumb
  const handleBreadcrumbSelect = (item, index) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);

    fetchFiles(item.id);
  };
  // parent folder click
  const handleGoParent = () => {
    if (breadcrumb.length <= 1) return;

    const parentIndex = breadcrumb.length - 2;
    const parentItem = breadcrumb[parentIndex];
    handleBreadcrumbSelect(parentItem, parentIndex);
  };

  // handleUploaddone
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

  //handledeletefile bulk
  const handleDeleteFile = async (fileId = null) => {
    if (selectedFiles.length === 0) {
      setMessage("Select files/folders to delete!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    try {
      for (const file of selectedFiles) {
        const res = await fetch(
          `http://127.0.0.1:8000/files/delete/${file.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to delete file");
        }
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

  // handlesingledeletefile
  const handleSingleDeleteFile = async (fileId = null) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/delete/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.detail || `Failed to delete file: ${file.filename}`
        );
      }

      // After deletion
      setMessage("File deleted successfully");

      const folderPath = breadcrumb[breadcrumb.length - 1]?.id;
      fetchFiles(folderPath);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // select files
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

  // copy files
  const handleCopy = () => {
    if (selectedFiles.length === 0) {
      return;
    }
    setCopiedFiles([...selectedFiles]);
    setMessage(`${selectedFiles.length} item(s) copied!`);
    setTimeout(() => setMessage(""), 2000);
  };

  // cut file
  // const handleCut = () => {
  //   if (selectedFiles.length === 0) {
  //     setMessage("Select files/folders to cut!");
  //     setTimeout(() => setMessage(""), 2000);
  //     return;
  //   }

  //   setCutFiles([...selectedFiles]);
  //   setCopiedFiles([]);
  //   setMessage(`${selectedFiles.length} item(s) cut!`);
  //   setTimeout(() => setMessage(""), 2000);
  // };
  const handleCut = () => {
  if (selectedFiles.length === 0) return;

  setCutFiles([...selectedFiles]);
  setCopiedFiles([]);
  showMessage(`${selectedFiles.length} item(s) cut!`);
  // DO NOT call setSelectedFiles([]); here yet. 
  // Let the user see what is selected until they paste or click away.
};

  // showmessage error/success
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  //paste files/folders
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
        throw new Error(
          err.detail || `Failed to ${isCut ? "move" : "copy"} files`
        );
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

  // close three dots menu
  const handleClose = () => {
    setSelectedFiles([]);
  };

  const handleToggleStar = async (fileId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/star?file_id=${fileId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("Star API response:", data);

      if (!res.ok || !data.id) throw new Error("Invalid response from server");

      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, is_star: data.is_star } : f))
      );
    } catch (err) {
      console.error("Star toggle error:", err);
    }
  };

  //view recyclebin
  const handleViewRecycleBin = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/recyclebin`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || "Failed to fetch recycle bin items");

      const items = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      setFiles(items);

      setBreadcrumb([{ name: "Recycle Bin", id: "recyclebin" }]);
    } catch (err) {
      console.error("Recycle Bin fetch error:", err.message);
      setMessage("Failed to load recycle bin items.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  //peremenent delete
  const handlePermanentDelete = async (fileId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/permenent_delete/${fileId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.detail || "Failed to permanently delete file"
        );
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

  //restore file
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
      const folderPath = breadcrumb[breadcrumb.length - 2]?.id;
      fetchFiles(folderPath);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // bulk restore file
  const handleMultipleRestoreFile = async () => {
    if (selectedFiles.length === 0) {
      setMessage("Select files/folders to Restore !");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    try {
      for (const file of selectedFiles) {
        const res = await fetch(
          `http://127.0.0.1:8000/files/restore/${file.id}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to Restore  file");
        }
      }
      setMessage("Files/ Folders Restored");

      setSelectedFiles([]);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTimeout(() => setMessage(""), 2000);
      setSelectedFiles([]);
    }
  };
  //bulk permenent delete
  const handleMultiplePermanentDelete = async () => {
    if (selectedFiles.length === 0) {
      setMessage("Select files/folders to permanently delete!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    try {
      for (const file of selectedFiles) {
        const res = await fetch(
          `http://127.0.0.1:8000/files/permenent_delete/${file.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.detail || "Failed to permanently delete file"
          );
        }
      }
      setMessage("Files/ Folders Permanently deleted");
      const folderPath = breadcrumb[breadcrumb.length - 1]?.id;
      fetchFiles(folderPath);
      setSelectedFiles([]);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTimeout(() => setMessage(""), 2000);
      setSelectedFiles([]);
    }
  };

  const clickTimeout = React.useRef(null);
  const handleFileClickAction = (e, file) => {
    e.stopPropagation();

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }

    clickTimeout.current = setTimeout(() => {
      handleSelectFile(file);
      setIsClickFile(null);
      setContextMenu({ visible: false, x: 0, y: 0, file: null });
      clickTimeout.current = null;
    }, 250);
  };

  const handleFileDoubleClickAction = (e, file) => {
    e.stopPropagation();

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }

    if (file.is_folder) {
      handleFolderClick(file.id, file.display_name); //
    } else {
      handleDownload(file.id, file.display_name); //
    }
  };
  const handleContextMenuAction = (e, file) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedFiles([file]);

    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      file: file,
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isFileItem = e.target.closest(".file-item");
      const isContextMenu = e.target.closest(".context-menu");
      const isToolbarAction =
        e.target.closest("button") || e.target.closest(".manager-toolbar");

      if (!isFileItem && !isContextMenu && !isToolbarAction) {
        setContextMenu({ visible: false, x: 0, y: 0, file: null });
        setSelectedFiles([]); // Only clear if clicking actual empty space
        setIsClickFile(null);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);
  return (
    <div className="min-h-screen p-8 bg-gray-500 dark:bg-gray-900 transition-colors ">
      <FileManagerToolbar
        files={selectedFiles}
        setFiles={setSelectedFiles}
        onFileChange={({ files: newFiles }) => {
          setSelectedFiles((prevFiles) => [
            ...prevFiles,
            ...Array.from(newFiles),
          ]);
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
        {selectedFiles.length > 0 &&
        breadcrumb[breadcrumb.length - 1]?.id !== "recyclebin" ? (
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
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents clearing selection
                      handleCut();
                    }}
                    className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-200"
                  >
                    <FaCut />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents clearing selection
                      handleCopy();
                    }}
                    className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-200"
                  >
                    <FaCopy />
                  </button>{" "}
                  <button
                    onClick={handleDeleteFile}
                    className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-200"
                  >
                    <FaTrash />
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
              <button
                className="ml-4 bg-gray-700 text-red-200 px-3 rounded"
                onClick={handleClose}
              >
                X
              </button>
            </div>
          </div>
        ) : selectedFiles.length > 0 &&
          breadcrumb[breadcrumb.length - 1]?.id === "recyclebin" ? (
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
                    onClick={handleMultipleRestoreFile}
                    className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-200"
                  >
                    <FaUndo />
                  </button>
                  <button
                    onClick={handleMultiplePermanentDelete}
                    className="ml-4 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-200"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              )}

              <button
                className="ml-4 bg-gray-700 text-red-200 px-3 rounded"
                onClick={handleClose}
              >
                X
              </button>
            </div>
          </div>
        ) : null}

        <div
          className={
            viewType === "grid"
              ? `grid ${
                  filteredFiles.length === 0 ? "grid-cols-1" : "grid-cols-7"
                } gap-2`
              : "  bg-white dark:bg-gray-800 shadow-md rounded-lg p-2"
          }
        >
          {filteredFiles.length === 0 ? (
            <div className="flex gap-5 justify-center items-center flex-col text-center p-4 text-gray-500 dark:text-gray-300 h-100 text-lg">
              {breadcrumb[breadcrumb.length - 1]?.id === "recyclebin" ? (
                <>
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                    <FaTrashRestoreAlt size={"50"} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Recycle Bin is empty</h3>
                    <p className="text-sm text-gray-400">
                      Items you delete will appear here.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-full">
                    <FaFolderOpen size={"50"} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">This folder is empty</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Start by adding a new file or folder.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            filteredFiles.map((file) =>
              viewType === "grid" ? (
                <div
                  key={file.id}
                  className={`relative p-2 rounded flex flex-col items-center text-center cursor-pointer 
 hover:bg-gray-50 dark:hover:bg-gray-700
 ${
   selectedFiles.some((f) => f.id === file.id)
     ? "bg-gray-100 dark:bg-gray-700"
     : ""
 }`}
                >
                  <div
                    key={file.id}
                    className={`file-item relative p-2 rounded flex flex-col items-center text-center cursor-default transition-all
      ${
        selectedFiles.some((f) => f.id === file.id)
          ? "bg-blue-100 dark:bg-gray-700 ring-2 ring-blue-500"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
                    onClick={(e) => handleFileClickAction(e, file)}
                    onDoubleClick={(e) => handleFileDoubleClickAction(e, file)}
                    onContextMenu={(e) => handleContextMenuAction(e, file)}
                  >
                    <div className="mb-2 pointer-events-none">
                      {getFileIcon(file, 40)}
                    </div>
                    <div className="text-xs mb-2 pointer-events-none">
                      <p className="text-gray-900 dark:text-gray-300 w-40 break-words">
                        {file.display_name}
                      </p>
                    </div>
                  </div>{" "}
                </div>
              ) : (
                <tr
                  key={file.id}
                  className={`file-item group transition-all duration-150 select-none border-b border-gray-100 dark:border-gray-800/50 cursor-default relative
    ${
      selectedFiles.some((f) => f.id === file.id)
        ? "bg-blue-50 dark:bg-blue-900/30" // This highlights the FULL background
        : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
    }`}
                  onClick={(e) => handleFileClickAction(e, file)}
                  onDoubleClick={(e) => handleFileDoubleClickAction(e, file)}
                  onContextMenu={(e) => handleContextMenuAction(e, file)}
                >
                  {/* Selection Indicator Bar (Visual Polish) */}
                  {selectedFiles.some((f) => f.id === file.id) && (
                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 z-10" />
                  )}

                  {/* File Name & Icon */}
                  <td className="pl-6 py-3 flex items-center gap-3">
                    <div className="flex-shrink-0 pointer-events-none">
                      {getFileIcon(file, 24)}
                    </div>
                    <div className="flex flex-col min-w-0 pointer-events-none">
                      <span
                        className={`text-sm font-medium truncate transition-colors ${
                          selectedFiles.some((f) => f.id === file.id)
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {file.display_name}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase">
                        {file.size || "---"}
                      </span>
                    </div>
                  </td>

                  {/* Path Cell */}
                  <td
                    className={`px-3 py-3 text-xs font-mono pointer-events-none italic ${
                      selectedFiles.some((f) => f.id === file.id)
                        ? "text-blue-500/70 dark:text-blue-400/50"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {file.path}
                  </td>

                  {/* Actions */}
                  <td className="pr-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenuAction(e, file);
                      }}
                      className={`p-2 rounded-full transition-all ${
                        selectedFiles.some((f) => f.id === file.id)
                          ? "opacity-100 text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/50"
                          : "opacity-0 group-hover:opacity-100 text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <FaEllipsisV size={14} />
                    </button>
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
                              <td className="font-medium px-4 py-2">
                                Location:
                              </td>
                              <td className="px-4 py-2">
                                {prop.absolute_path}
                              </td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <td className="font-medium px-4 py-2">
                                Created:
                              </td>
                              <td className="px-4 py-2">{prop.created_at}</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <td className="font-medium px-4 py-2">
                                Modified:
                              </td>
                              <td className="px-4 py-2">{prop.modified_at}</td>
                            </tr>
                            <tr>
                              <td className="font-medium px-4 py-2">
                                Accessed:
                              </td>
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
            <h3 className="text-lg font-semibold mb-4 text-gray-300">
              Create New Folder
            </h3>
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
                onClick={() => {
                  setShowModal(false);
                  setFolderName("");
                }}
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
            <h3 className="text-lg font-semibold mb-4 text-gray-300">
              Create New File
            </h3>

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
                onClick={() => {
                  setShowFileModal(false);
                  setFileName("");
                }}
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
            <h3 className="text-lg font-semibold mb-4 text-gray-300">
              Rename Item
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Current Name: <b>{fileToRename.fileName}</b>
            </p>
            <input
              type="text"
              value={fileToRename.newName}
              onChange={(e) =>
                setFileToRename((prev) => ({
                  ...prev,
                  newName: e.target.value,
                }))
              }
              placeholder="Enter new name"
              className="w-full border text-white border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleRenameSubmit}
                className="bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 disabled:opacity-50"
                disabled={
                  !fileToRename.newName.trim() ||
                  fileToRename.newName === fileToRename.filename
                }
              >
                Rename
              </button>
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setFileToRename({ id: null, fileName: "", newName: "" });
                }}
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

      {contextMenu.visible && (
        <div
          className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()} // Prevent closing menu when clicking options
        >
          {breadcrumb[breadcrumb.length - 1]?.id === "recyclebin" ? (
            <>
              <button
                onClick={() => {
                  handleRestoreFile(contextMenu.file.id);
                  setContextMenu({ visible: false });
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white flex items-center"
              >
                <FaUndo className="mr-2" /> Restore
              </button>
              <button
                onClick={() => {
                  handlePermanentDelete(contextMenu.file.id);
                  setContextMenu({ visible: false });
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white flex items-center"
              >
                <FaTrashAlt className="mr-2" /> Permanent Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  handleDownload(
                    contextMenu.file.id,
                    contextMenu.file.display_name
                  );
                  setContextMenu({ visible: false });
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white flex items-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={() => {
                  openRenameModal(
                    contextMenu.file.id,
                    contextMenu.file.display_name
                  );
                  setContextMenu({ visible: false });
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white flex items-center"
              >
                <FaEdit className="mr-2" /> Rename
              </button>
              <button
                onClick={() => {
                  handleViewLogs(
                    contextMenu.file.id,
                    contextMenu.file.display_name
                  );
                  setContextMenu({ visible: false });
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white flex items-center"
              >
                <FaEye className="mr-2" /> Details
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => {
                  handleSingleDeleteFile(contextMenu.file.id);
                  setContextMenu({ visible: false });
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
