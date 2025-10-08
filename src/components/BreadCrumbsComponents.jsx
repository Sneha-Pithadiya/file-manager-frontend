import React from "react";

export const BreadcrumbComponent = ({ data = [], onBreadcrumbSelect }) => {
  // Always prepend "Upload" breadcrumb
  const allCrumbs = [{ id: "0", name: "Upload" }, ...data.filter(item => item.name)];

  return (
    <nav
      className="flex text-gray-700 dark:text-gray-300 text-sm mb-2"
      aria-label="Breadcrumb"
    >
      {allCrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <button
            onClick={() => onBreadcrumbSelect(item, index)}
            className="hover:underline focus:outline-none"
          >
            {item.name}
          </button>
          {index < allCrumbs.length - 1 && <span className="mx-2">/</span>}
        </div>
      ))}
    </nav>
  );
};
