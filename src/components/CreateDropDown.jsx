import { useState, useRef, useEffect } from "react";
import { FaFolderPlus, FaPlus } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";

export default function CreateDropdown({ onNewFolderClick, onNewFileClick }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close 
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center px-4 py-2 bg-purple-500 border border-purple-500 text-white rounded shadow hover:bg-purple-600 transition"
      >
        <FaPlus className="mr-2" /> Create
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
          <li>
            <button
              className="w-full flex text-left px-4 py-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                onNewFolderClick();
                setOpen(false);
              }}
            >
             <FaFolderPlus className="mr-2 mt-1 text-yellow-500" /> Create Folder
            </button>
          </li>
          <li>
            <button
              className="w-full flex text-left px-4 text-gray-400 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                onNewFileClick();
                setOpen(false);
              }}
            >
             <FaFileCirclePlus  className="mr-2 mt-1 text-blue-500"/> Create File
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
