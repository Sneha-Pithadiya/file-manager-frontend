// FileManagerToolbar.jsx
import React, { useState } from "react";
import { FaArrowUp, FaArrowDown, FaTh, FaList, FaPlus, FaUpload, FaSearch, FaCloudUploadAlt } from 'react-icons/fa';

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
        <FaSearch className="text-gray-200"/>
        <input
          type="text"
          placeholder="Search files , folders ..."
          className="pr-3 py-1 rounded  focus:outline-none focus:ring-none   dark:text-gray-100 w-1/2 "
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="flex ml-auto ">
      {/* New Folder Button */}
      <button
        onClick={onNewFolderClick}
        className="hover:bg-purple-600 border border-purple-500 bg-purple-500 text-white px-4 py-2 rounded shadow transition flex mx-2"
      >
       <FaPlus className="mr-2 mt-1"/> Create Folder
      </button>

      {/* Upload Button */}
      <button
        onClick={() => setDialogVisible(!dialogVisible)}
        className="border border-gray-600 hover:bg-gray-700 bg-gray-500 text-white px-4 py-2 rounded shadow transition flex mx-2"
      >
       <FaCloudUploadAlt className="mr-2 mt-1"/> Upload
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
              className="w-full mb-4 text-gray-600 "
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={()=>setDialogVisible(!dialogVisible)}
                className=" hover:bg-gray-400 hover:text-black text-black dark:text-white px-4 py-2 rounded shadow"
              >
               Cancel
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
      {/* create new folder */}
      {/* Sorting Buttons */}
      <div className="flex gap-2 mx-2">
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
      </div>
    </div>
  );
};
