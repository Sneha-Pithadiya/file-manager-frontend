// fetch
  const fetchFiles = async (folderId = null) => {
    try {
      const url = folderId
        ? `http://127.0.0.1:8000/files?folder=${folderId}`
        : "http://127.0.0.1:8000/files";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch files");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Upload Files
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);

    const formData = new FormData();


    selectedFiles.forEach(file => formData.append("uploaded_file", file));
    formData.append(
      "parent_id",
      breadcrumb[breadcrumb.length - 1]?.id || ""
    );



    try {
      const res = await fetch("http://127.0.0.1:8000/files/upload", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }, // keep auth
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setMessage("Files uploaded successfully!");
      setSelectedFiles([]);
      fetchFiles(breadcrumb[breadcrumb.length - 1]?.id || null); // reload current folder

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Download file
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
      setMessage(err.message);
    }
  };
  // View Logs
  const handleViewLogs = async (fileId, fileName) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/log/${fileId}`, 
        {headers: { Authorization: `Bearer ${token}` }});
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

  const handleDeleteFile = async (fileId) => {
  try {
    console.log("Token:", token);

    const res = await fetch(`http://127.0.0.1:8000/files/delete/${fileId}`, {
      method: "DELETE",
       headers: { Authorization: `Bearer ${token}` } 
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to delete file");
    }

    setMessage("File Deleted Successfully");
  } catch (err) {
    setMessage(err.message);
  }
};


  //download logs
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

  // Create New Folder
  const handleNewFolderClick = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/files/folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: folderName,
          parent_id: breadcrumb[breadcrumb.length - 1]?.id,  // make sure id is number or null
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create folder");
      setMessage("Folder created successfully!");
      fetchFiles(breadcrumb[breadcrumb.length - 1].id);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFolderClick = async (folderId, folderName) => {
  try {
    await fetchFiles(folderId);  
    setBreadcrumb(prev => [...prev, { id: folderId, name: folderName }]);
  } catch (err) {
    console.error("Failed to open folder:", err);
  }
};


  // Handle Breadcrumb
  const handleBreadcrumbSelect = (item, index) => {
    setBreadcrumb(breadcrumb.slice(0, index + 1));
    fetchFiles(item.id || null);
    console.log('hi');
  };

  // Filter and Sort
  const filteredFiles = files
    .filter((file) => file.original_name)

    .filter((file) =>
      file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    .sort((a, b) => {
      if (sortOrder[0].dir === "asc")
        return a.original_name.localeCompare(b.original_name);
      return b.original_name.localeCompare(a.original_name);
    });

  // Format Date
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString() : "";


  //Action Icon show / hide

  const handleFileClick = (id) => {
    setIsClickFile(isClickFile === id ? null : id);
  }
