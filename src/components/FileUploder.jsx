import React, { useState } from "react";

export const UploadDialog = ({ files, onFileChange, onUploadDone, onCancel }) => {
  const [filesManager, setFilesManager] = useState([]);

  // Handle adding new files (from input or drop)
  const addFiles = (newFiles) => {
    const uniqueFiles = [
      ...filesManager,
      ...newFiles.filter(
        (f) => !filesManager.some((file) => file.name === f.name)
      ),
    ];
    setFilesManager(uniqueFiles);
    onFileChange({ files: uniqueFiles });
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleRemoveFile = (idx) => {
    const newFiles = filesManager.filter((_, i) => i !== idx);
    setFilesManager(newFiles);
    onFileChange({ files: newFiles });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
          Upload Files
        </h2>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-full mb-4 p-6 border-2 border-dashed border-gray-400 rounded text-center text-gray-600 hover:border-gray-600 cursor-pointer"
        >
          Drag & Drop files here, or click below to select
        </div>

        {/* File Input */}
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="w-full mb-4 text-gray-600"
        />

        {/* File Preview */}
        {filesManager.length > 0 && (
          <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
            {filesManager.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between mb-1">
                <span className="text-gray-700 dark:text-gray-200">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setFilesManager([]);
              onCancel();
            }}
            className="hover:bg-gray-400 hover:text-black text-black dark:text-white px-4 py-2 rounded shadow"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUploadDone(filesManager);
              setFilesManager([]);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
