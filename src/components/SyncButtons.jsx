import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FaRotate, FaRotateLeft, FaRotateRight } from 'react-icons/fa6';
const SyncButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage(null);

    try {
      // Get your token from local storage or context
      const token = localStorage.getItem("token"); 

      const response = await fetch("http://127.0.0.1:8000/files/sync-disk-to-db", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`"${data.created_entries}",Data Sync Successfully..` );
        // Optional: Trigger a refresh of your file list here
        // window.location.reload(); 
      } else {
        setMessage("Sync failed" );
      }
    } catch (err) {
      setMessage("Network error" );
    } finally {
      setTimeout(() => setMessage(""), 2000);
      setIsSyncing(false)
    }
  };

  return (
    <div >
      <button 
        onClick={handleSync} 
        disabled={isSyncing}
        className="flex items-center px-4 py-2 bg-cyan-600 border border-cyan-600 text-white rounded shadow hover:bg-cyan-800 hover:border-cyan-800 transition"
      >
        {isSyncing ? (

<FaRotateRight />) : (
<FaRotate />        )}
      </button>

      {/* Feedback Messages */}
      {message && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg text-white shadow-lg w-full max-w-lg p-6 relative">
            {message}
          </div>
        </div>

      )}
    </div>
  );
};

export default SyncButton;