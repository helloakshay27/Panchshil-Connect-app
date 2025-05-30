import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Only show the last segment as breadcrumb
  const last = pathnames[pathnames.length - 1];

  return (
    <nav aria-label="breadcrumb" className="mx-2">
      <ol className="breadcrumb">
        {last && (
          <li className="breadcrumb-item active" aria-current="page">
            {last}
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
