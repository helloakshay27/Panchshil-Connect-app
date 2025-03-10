import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectConfiguraionList = () => {
  const getPageFromStorage = () => {
    return parseInt(localStorage.getItem("testimonial_list_currentPage")) || 1;
  };

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const pageSize = 10; // Define page size
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfigurations();
  }, [pagination.current_page]);

  const fetchConfigurations = async () => {
    setLoading(true); // Set loading to true 
    try {
      const response = await axios.get(
        "http://panchshil-super.lockated.com/configuration_setups.json"
      );
      setConfigurations(response.data);
      setPagination((prev) => ({
        ...prev,
        total_count: response.data.length,
        total_pages: Math.ceil(response.data.length / pageSize),
      }));
    } catch (error) {
      console.error("Error fetching configurations:", error);
    } finally {
      setLoading(false); // Set loading to false 
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    localStorage.setItem("testimonial_list_currentPage", page);
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-4 mb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Project Configuration</h3>
              </div>
              <div className="card-body">
                {/* Loader rendered */}
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading data, please wait...</p>
                  </div>
                ) : (
                  <div className="tbl-container mt-4 ">
                    <table className="w-100">
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Name</th>
                          <th>Status</th>
                          <th>Attachment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {configurations
                          .slice(
                            (pagination.current_page - 1) * pageSize,
                            pagination.current_page * pageSize
                          )
                          .map((config, index) => (
                            <tr key={config.id}>
                              <td>
                                {(pagination.current_page - 1) * pageSize +
                                  index +
                                  1}
                              </td>
                              <td>{config.name}</td>
                              <td>{config.active ? "Active" : "Inactive"}</td>
                              <td>
                                <a
                                  href={config.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center px-3 mt-2">
                  <ul className="pagination justify-content-center d-flex">
                    <li
                      className={`page-item ${
                        pagination.current_page === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                      >
                        First
                      </button>
                    </li>
                    <li
                      className={`page-item ${
                        pagination.current_page === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1}
                      >
                        Prev
                      </button>
                    </li>
                    {Array.from(
                      { length: pagination.total_pages },
                      (_, index) => index + 1
                    ).map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          pagination.current_page === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        pagination.current_page === pagination.total_pages
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                          pagination.current_page === pagination.total_pages
                        }
                      >
                        Next
                      </button>
                    </li>
                    <li
                      className={`page-item ${
                        pagination.current_page === pagination.total_pages
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.total_pages)}
                        disabled={
                          pagination.current_page === pagination.total_pages
                        }
                      >
                        Last
                      </button>
                    </li>
                  </ul>
                  <div>
                    <p>
                      Showing{" "}
                      {Math.min(
                        (pagination.current_page - 1) * pageSize + 1 || 1,
                        pagination.total_count
                      )}{" "}
                      to{" "}
                      {Math.min(
                        pagination.current_page * pageSize,
                        pagination.total_count
                      )}{" "}
                      of {pagination.total_count} entries
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectConfiguraionList;
