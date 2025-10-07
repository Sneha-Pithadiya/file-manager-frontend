import React, { useState } from "react";
import CreateDropdown from "./CreateDropDown";
import {
  FaArrowUp,
  FaArrowDown,
  FaTh,
  FaList,
  FaSearch,
  FaCloudUploadAlt,
  FaTrash,
} from "react-icons/fa";
import { ProgressBar } from "./ProgressBar";

export const FileManagerToolbar = ({
  files,
  setFiles,
  onFileChange,
  onClearFileList,
  onUploadComplete,
  onNewFolderClick,
  onNewFileClick,
  onViewChange,
  onSortChange,
  onSearchChange,
  sort = [{ dir: "asc" }],
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [view, setView] = useState("grid");

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFileChange({ files: updatedFiles });
  };

  const handleSearch = (query) => {
    // Always pass string to prevent .toLowerCase() errors
    const sanitizedQuery = query.trim();
    onSearchChange(sanitizedQuery);
  };

  const handleUploadDone = () => {
    setDialogVisible(false);
    onUploadComplete?.();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-gray-800 shadow rounded mb-4">
      {/* Search Input */}
      <FaSearch className="text-gray-400" />
      <input
        type="text"
        placeholder="Search files, folders, or path (e.g., n/m/4)..."
        className="w-1/3 py-1 px-3 rounded focus:outline-none dark:text-gray-100"
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Toolbar Actions */}
      <div className="flex ml-auto items-center gap-2">
        {/* Create Dropdown */}
        <CreateDropdown
          onNewFolderClick={onNewFolderClick}
          onNewFileClick={onNewFileClick}
        />

        {/* Upload Button */}
        <button
          onClick={() => setDialogVisible(true)}
          className="flex items-center px-4 py-2 bg-gray-500 border border-gray-600 text-white rounded shadow hover:bg-gray-700 transition"
        >
          <FaCloudUploadAlt className="mr-2" /> Upload
        </button>

        {/* Upload Dialog */}
        {dialogVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative">
              <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
                Upload Files
              </h2>

              {/* Drag & Drop Area */}
              <div
                className="w-full h-40 mb-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFiles = Array.from(e.dataTransfer.files);
                  onFileChange({ files: [...(files || []), ...droppedFiles] });
                }}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FaCloudUploadAlt className="text-gray-500 text-7xl" />
                <p className="pt-3 text-gray-500 dark:text-gray-400">
                  Drag & Drop or{" "}
                  <span className="text-gray-700 dark:text-gray-200">choose file</span>{" "}
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
                  onFileChange({ files: [...(files || []), ...selectedFiles] });
                  e.target.value = "";
                }}
              />

              {/* Selected Files */}
              {files?.length > 0 && (
                <div className="p-2 mb-4 bg-gray-50 dark:bg-gray-900 border rounded max-h-40 overflow-y-auto">
                  <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
                    Selected Files:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {files.map((file, index) => (
                       <div className="bg-gray-800 text-gray-200 rounded shadow-sm p-2">
                         <li
                        key={index}
                        className="flex items-center justify-between  "
                      >
                        <span className="truncate">{file.name}</span>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove file"
                        >
                          <FaTrash />
                        </button>
                       
                      </li>
                       <ProgressBar initial={0} speed={100 } className />

                       </div>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dialog Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    onClearFileList?.();
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

        {/* Sorting */}
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded shadow ${
              sort[0].dir === "asc" ? "border text-white" : "bg-gray-800 border-gray-800 text-gray-500"
            }`}
            onClick={() => onSortChange({ direction: "asc" })}
          >
            <FaArrowUp />
          </button>
          <button
            className={`px-3 py-2 rounded shadow ${
              sort[0].dir === "desc" ? "border text-white" : "bg-gray-800 border-gray-800 text-gray-500"
            }`}
            onClick={() => onSortChange({ direction: "desc" })}
          >
            <FaArrowDown />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 ml-4">
          <button
            className={`px-3 py-3 rounded shadow ${
              view === "grid" ? "border text-white" : "bg-gray-800 border-gray-800 text-gray-500"
            }`}
            onClick={() => {
              setView("grid");
              onViewChange({ view: "grid" });
            }}
          >
            <FaTh />
          </button>
          <button
            className={`px-3 py-3 rounded shadow ${
              view === "list" ? "border text-white" : "bg-gray-800 border-gray-800 text-gray-500"
            }`}
            onClick={() => {
              setView("list");
              onViewChange({ view: "list" });
            }}
          >
            <FaList />
          </button>
        </div>
      </div>
      
    </div>
  );
};
