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
 const searchTimeout = useRef(null);

 const handleRemoveFile = (index) => {
 // This logic correctly updates the state (via onFileChange)
 const updatedFiles = files.filter((_, i) => i !== index);
 onFileChange({ files: updatedFiles });
 };

 const handleSearch = (query) => {
 const sanitizedQuery = query.trim();

 if (searchTimeout.current) {
  clearTimeout(searchTimeout.current);
 }

 searchTimeout.current = setTimeout(async () => {
  if (!sanitizedQuery) {
  setSearchResults([]);
  onSearchChange("");
  return;
  }

  setLoading(true);
  try {
  const response = await fetch(`http://127.0.0.1:8000/files/search/${encodeURIComponent(query)}`);

  const data = await response.json();
  setSearchResults(data.results || []);
  onSearchChange(sanitizedQuery);
  } catch (err) {
  console.error("Search API error:", err);
  setSearchResults([]);
  } finally {
  setLoading(false);
  }
 }, 300);
 };

 const handleUploadDone = () => {
 setDialogVisible(false);
 onUploadComplete?.();
 };

 const fileManagerContent = searchResults.length > 0 ? searchResults : files;

 return (
 <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-gray-800 shadow rounded border-gray-500 mb-4">
  <FaSearch className="text-gray-400" />
  <input
  type="text"
  placeholder="Search files, folders ..."
  className="w-1/3 py-1 px-3 rounded focus:outline-none dark:text-gray-100"
  onChange={(e) => handleSearch(e.target.value)}
  />
        
    

  {loading && <span className="ml-2 text-gray-500">Searching...</span>}

  <div className="flex ml-auto items-center gap-2">
    <div className="flex items-center gap-2 text-white text-sm">
        <span className="text-gray-400">Folder Search</span>
        <label htmlFor="global-search-toggle" className="flex items-center cursor-pointer">
            <input
                type="checkbox"
                id="global-search-toggle"
                checked={isGlobalSearch}
                onChange={(e) => setIsGlobalSearch(e.target.checked)}
                className="hidden"
            />
            <div className={`w-14 h-5 flex items-center rounded-full p-1 transition duration-200 ${isGlobalSearch ? 'bg-blue-500' : 'bg-gray-400'}`}>
                <div className={`bg-white w-2 h-3 p-2 rounded-full shadow-md transform transition duration-200 ${isGlobalSearch ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
        </label>
        <span className="text-gray-400">All Folders</span>
    </div>
  <CreateDropdown
   onNewFolderClick={onNewFolderClick}
   onNewFileClick={onNewFileClick}
  />

  <button
   onClick={() => {
   setFiles([]); 
   setDialogVisible(true);
   }}
   className="flex items-center px-4 py-2 bg-gray-500 border border-gray-600 text-white rounded shadow hover:bg-gray-700 transition"
  >
   <FaCloudUploadAlt className="mr-2" /> Upload
  </button>
  <button onClick={viewRecycleBin} className="flex items-center px-2 py-3 bg-red-500 border border-red-600 text-white rounded shadow hover:bg-gray-700 transition" >
   <FaTrashRestoreAlt />
  </button>

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
       <span className="truncate">{file.path || file.name}</span>
       
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