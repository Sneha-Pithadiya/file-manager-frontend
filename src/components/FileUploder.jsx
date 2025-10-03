import React, { useState } from "react";
import axios from "axios";

const FileUpload = ({ multiple = false }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    if (multiple) {
      setFiles([...e.target.files]);
    } else {
      setFiles([e.target.files[0]]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return alert("Please select a file first");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setUploading(true);
      setProgress(0);

      await axios.post("http://127.0.0.1:8000/file/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((100 * event.loaded) / event.total));
          }
        },
      });

      alert("Upload successful!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`p-4 border rounded-lg shadow-md w-96 bg-white dropzone ${isDragActive ? 'active' : ''}`}
    >
      <input
        {...getInputProps()}
        type="file"
        multiple
        webkitdirectory="true"
        onChange={handleFileChange}
        className="mb-2"
      />
      <p>Drag & drop files or folders here, or click to select</p>


      {files.length > 0 && (
        <ul className="text-sm text-gray-600 mb-2">
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}

      {uploading && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{progress}%</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default FileUpload;
