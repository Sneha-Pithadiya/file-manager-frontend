import React, { useState, useEffect, useRef } from "react";
import CreateDropdown from "./CreateDropDown";
import SyncButton from "./SyncButtons";
import {
  FaArrowUp,
  FaArrowDown,
  FaTh,
  FaList,
  FaSearch,
  FaCloudUploadAlt,
  FaTrash,
  FaRecycle,
  FaTrashAlt,
  FaTrashRestore,
  FaTrashRestoreAlt,
} from "react-icons/fa";
import { ProgressBar } from "./ProgressBar";
import { FaTrashCan, FaTrashCanArrowUp } from "react-icons/fa6";

export const FileManagerToolbar = ({
  files, // Files selected for upload (prop)
  setFiles,
  onFileChange,
  onClearFileList,
  onUploadComplete,
  onNewFolderClick,
  onNewFileClick,
  onViewChange,
  onSortChange,
  onSearchChange,
  viewRecycleBin,
  isGlobalSearch,
  setIsGlobalSearch,
  sort = [{ dir: "asc" }],
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [view, setView] = useState("grid");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const searchTimeout = useRef(null);

  // user me
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData); // This will contain the 'role'
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchUser();
  }, []);

  // removefile
  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFileChange({ files: updatedFiles });
  };

  //  handlesearch this is globel search

  const handleSearch = (query) => {
    const sanitizedQuery = query.trim();

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      if (!sanitizedQuery) {
        onSearchChange("");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/files/search/${encodeURIComponent(
            sanitizedQuery
          )}`
        );
        const data = await response.json();

        // Update the parent state with the results
        onSearchChange(sanitizedQuery, data.results || []);
      } catch (err) {
        console.error("Search API error:", err);
      } finally {
        setLoading(false);
      }
    }, 400); // Slightly higher debounce for better performance
  };

  // handleupload
  const handleUploadDone = () => {
    setDialogVisible(false);
    onUploadComplete?.();
  };

  const fileManagerContent = searchResults.length > 0 ? searchResults : files;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-gray-800 shadow rounded border-gray-500 mb-4">
      <div className="flex items-center w-210 relative">
        <FaSearch className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search file / folder here..."
          className="w-full py-2 pl-10 pr-3 rounded  focus:outline-none dark:text-gray-100"
          onChange={(e) => handleSearch(e.target.value)}
        />
        {loading && (
          <span className="absolute right-3 text-xs text-gray-500 animate-pulse">
            Searching...
          </span>
        )}
      </div>

      <div className="flex ml-auto items-center gap-2">
        <CreateDropdown
          onNewFolderClick={onNewFolderClick}
          onNewFileClick={onNewFileClick}
        />

        <button
          onClick={() => {
            setFiles([]);
            setDialogVisible(true);
          }}
          title="Upload File/Folder"
          className="flex items-center px-4 py-2 bg-blue-600 border border-blue-600 text-gray-200 hover:text-white rounded hover:border-blue-800 hover:bg-blue-800 transition"
        >
          <FaCloudUploadAlt />
        </button>
        {currentUser?.role === "admin" && (
          <>
            <SyncButton />{" "}
            <button
              onClick={viewRecycleBin}
              className="flex items-center px-4 py-2 bg-red-500 border border-red-600 text-white rounded  hover:border-red-700 shadow hover:bg-red-700 transition"
            >
              <FaTrashRestoreAlt />
            </button>{" "}
          </>
        )}

        {dialogVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
              <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
                Upload Files
              </h2>

              <div
                className="w-full h-40 mb-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFiles = Array.from(e.dataTransfer.files);
                  onFileChange({ files: droppedFiles });
                }}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FaCloudUploadAlt className="text-gray-500 text-7xl" />
                <p className="pt-3 text-gray-600 dark:text-gray-400">
                  Drag & Drop or{" "}
                  <span className="text-gray-700 dark:text-gray-200">
                    choose file
                  </span>{" "}
                  to upload
                </p>
              </div>

              <input
                id="fileInput"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files);
                  onFileChange({ files: selectedFiles });
                  e.target.value = "";
                }}
              />

              {files?.length > 0 && (
                <div className="p-2 mb-4 bg-gray-50 dark:bg-gray-900 border rounded max-h-40 overflow-y-auto">
                  <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
                    Files:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {files.map((file, index) => (
                      <div
                        key={file.id || index}
                        className="bg-gray-800 text-gray-200 rounded shadow-sm p-2"
                      >
                        <li className="flex items-center justify-between">
                          <span className="truncate">
                            {file.path || file.name}
                          </span>

                          <button
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove file"
                          >
                            <FaTrash />
                          </button>
                        </li>

                        <ProgressBar initial={0} speed={100} />
                      </div>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setFiles([]);
                    setDialogVisible(false);
                  }}
                  className="px-4 py-2 bg-gray-700 text-black dark:text-white rounded shadow hover:bg-gray-400 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadDone}
                  className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          className={`px-4 py-2 rounded shadow border transition-all flex items-center justify-center ${
            sort[0].dir
              ? "text-white border-gray-600 bg-gray-700"
              : "bg-gray-800 border-gray-800 text-gray-500"
          } hover:bg-gray-600`}
          onClick={() => {
            const newDirection = sort[0].dir === "asc" ? "desc" : "asc";
            onSortChange({ direction: newDirection });
          }}
          title={`Sort ${sort[0].dir === "asc" ? "Descending" : "Ascending"}`}
        >
          {/* Only the Icon is rendered now */}
          {sort[0].dir === "asc" ? (
            <FaArrowUp size={18} />
          ) : (
            <FaArrowDown size={18} />
          )}
        </button>

        <button
          className="px-4 py-2.5 rounded shadow border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center gap-2"
          onClick={() => {
            const nextView = view === "grid" ? "list" : "grid";
            setView(nextView);
            onViewChange({ view: nextView });
          }}
          title={
            view === "grid" ? "Switch to List View" : "Switch to Grid View"
          }
        >
          {/* The icon changes based on the CURRENT view */}
          {view === "grid" ? (
            <>
              <FaList className="text-blue-400" />
            </>
          ) : (
            <>
              <FaTh className="text-blue-400" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
