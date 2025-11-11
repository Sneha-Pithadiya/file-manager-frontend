import React from "react";

import { FaArrowLeft, FaArrowUp, FaGreaterThan } from "react-icons/fa"; 

export const BreadcrumbComponent = ({ data = [], onBreadcrumbSelect, onGoParent }) => {
  const allCrumbs = [{ id: "0", name: "upload" }, ...data.filter(item => item.name)];

  const canGoParent = allCrumbs.length > 1;

  return (
    <nav
      className="flex items-center text-gray-700 dark:text-gray-300 text-sm p-1 mb-2 border border-gray-800 dark:border-gray-800 rounded   "
      aria-label="Breadcrumb"
    >
      <button
        onClick={onGoParent}
        disabled={!canGoParent}
        className={` rounded  dark:hover:text-gray-700 text-gray-400 me-2  ${!canGoParent ? "opacity-40 cursor-not-allowed" : ""
          }`}
      >
        <FaArrowUp />
      </button>
        {allCrumbs.length === 0 && <span className="text-gray-500">No breadcrumbs</span>}
      {allCrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <button
            onClick={() => onBreadcrumbSelect(item, index)}
            className="hover:underline focus:outline-none"
          >
            {item.name}
          </button>
          {index < allCrumbs.length - 1 && <span className="mx-2 text-xs text-gray-400"><FaGreaterThan /></span>}
        </div>
      ))}

    </nav>
  );
};

