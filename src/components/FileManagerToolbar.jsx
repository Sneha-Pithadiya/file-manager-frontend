// FileManagerToolbar.jsx
import React, { useState } from "react";
import { FaArrowUp, FaArrowDown, FaTh, FaList } from 'react-icons/fa';

export const FileManagerToolbar = ({
  files,
  onFileChange,
  onClearFileList,
  onUploadComplete,
  onNewFolderClick,
  onViewChange,
  onSortChange,
  onSearchChange,
  onSwitchChange,
  sort = [{ dir: "asc" }],
  splitItems = [],
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [view, setView] = useState("grid");
  const [isVisibleAction, setIsVisibleAction] = useState(false)


  const handleFileSelect = (e) => {
    onFileChange({ files: e.target.files });
  };

  const handleUploadDone = () => {
    setDialogVisible(false);
    onUploadComplete();
  };
   const toggleActionVisiblity = () =>{
    setIsVisibleAction(!isVisibleAction);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mx-0 mb-4 p-3 bg-white dark:bg-gray-800 shadow rounded">
      {/* New Folder Button */}
      <button
        onClick={onNewFolderClick}
        className="border border-blue-800 hover:bg-gray-600 text-white px-4 py-2 rounded shadow transition"
      >
        New Folder
      </button>

      {/* Upload Button */}
      <button
        onClick={() => setDialogVisible(!dialogVisible)}
        className="border border-green-800 hover:bg-gray-600 text-white px-4 py-2 rounded shadow transition"
      >
        Upload
      </button>

      {/* Upload Dialog */}
      {dialogVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
              Upload Files
            </h2>

            <input
              type="file"
              
              multiple
              onChange={handleFileSelect}
              className="w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={onClearFileList}
                className="bg-gray-300 hover:bg-gray-400 text-black dark:text-white px-4 py-2 rounded shadow"
              >
                Clear List
              </button>
              <button
                onClick={handleUploadDone}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Buttons */}
      <div className="flex gap-2">
        <button
          className={`px-3 py-3 rounded shadow ${
            sort[0].dir === "asc" ? "border text-white" : "bg-gray-800 border border-gray-800 text-gray-500"
          }`}
          onClick={() => onSortChange({ direction: "asc" })}
        >
           <FaArrowUp  />
        </button>
        <button
          className={`px-3 py-1 rounded shadow ${
            sort[0].dir === "desc" ? "border text-white" : "bg-gray-800 border border-gray-800 text-gray-500"
          }`}
          onClick={() => onSortChange({ direction: "desc" })}
        >
<FaArrowDown />        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 ml-4">
        <button
          className={`px-3 py-3 rounded shadow  ${
            view === "grid" ? "border text-white" : "bg-gray-800 border border-gray-800 text-gray-500"
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
            view === "list" ? "border text-white" : "bg-gray-800 border border-gray-800 text-gray-500"
          }`}
          onClick={() => {
            setView("list");
            onViewChange({ view: "list" });
          }}
        >
          <FaList />
        </button>
      </div>
       

      {/* Details Switch
      <div className="flex items-center gap-2 ml-4">
        <label className="text-gray-700 dark:text-gray-300">View Details</label>
        <input type="checkbox" defaultChecked onChange={onSwitchChange} />
      </div> */}

      {/* Search Input */}
      <div className="ml-auto">
        <input
          type="text"
          placeholder="Search"
          className="px-3 py-1 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
