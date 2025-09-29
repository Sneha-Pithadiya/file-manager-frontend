import React from "react";
import { FaFile, FaFolder } from "react-icons/fa"; // File & folder icons

export const ListView = ({ data = [], onItemClick, onDoubleClick, onContextMenu }) => {
  const handleClick = (event, item) => {
    if (onItemClick) onItemClick({ dataItem: item, event });
  };

  const handleDoubleClick = (event, item) => {
    if (onDoubleClick) onDoubleClick({ dataItem: item, event });
  };

  const handleRightClick = (event, item) => {
    event.preventDefault();
    if (onContextMenu) onContextMenu({ dataItem: item, event });
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg min-h-[300px]">
      {data.length === 0 && (
        <p className="text-gray-500 dark:text-gray-300 w-full text-center py-20">
          No files or folders
        </p>
      )}
      {data.map((item, index) => {
        const name = item.original_name || item.filename;
        const isFolder = item.is_folder;

        return (
          <div
            key={index}
            className={`flex flex-col items-center justify-center w-24 p-3 rounded-lg cursor-pointer transition 
              hover:bg-blue-100 dark:hover:bg-gray-700
              ${item.selected ? "bg-blue-200 dark:bg-gray-600" : ""}`}
            onClick={(e) => handleClick(e, item)}
            onDoubleClick={(e) => handleDoubleClick(e, item)}
            onContextMenu={(e) => handleRightClick(e, item)}
          >
            <div className="text-4xl mb-2">
              {isFolder ? <FaFolder className="text-yellow-500" /> : <FaFile className="text-gray-500" />}
            </div>
            <span className="text-sm text-center text-gray-800 dark:text-gray-100 truncate">
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
