// BreadcrumbComponent.jsx
import React from "react";

export const BreadcrumbComponent = ({ data = [], onBreadcrumbSelect }) => {
  return (
    <nav className="flex text-gray-700 dark:text-gray-300 text-sm mb-4" aria-label="Breadcrumb">
      {data.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <button
            onClick={() => onBreadcrumbSelect(item, index)}
            className="hover:underline focus:outline-none"
          >
            {item.name}
          </button>
          {index < data.length - 1 && <span className="mx-2">/</span>}
        </div>
      ))}
    </nav>
  );
};
