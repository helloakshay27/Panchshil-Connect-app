import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AmenitiesList = () => {
  const [toggleStates, setToggleStates] = useState([true, false]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_count: 0,
    total_pages: 0,
  });
  const pageSize = 10; // Number of items per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAmenities = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/amenity_setups.json"
        );
        const data = response.data.amenities_setups;

        if (Array.isArray(data)) {
          setAmenities(data);
          setPagination((prev) => ({
            ...prev,
            total_count: data.length,
            total_pages: Math.ceil(data.length / pageSize),
          }));
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("Error fetching amenities:", err);
        setError("Failed to fetch amenities data");
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
    }));
  };

  const displayedAmenities = amenities
    .slice(
      (pagination.current_page - 1) * pageSize,
      pagination.current_page * pageSize
    )
    .sort((a, b) => (a.id || 0) - (b.id || 0)); // Sort amenities by ID (ascending)

  const handleToggle = (index) => {
    setToggleStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state))
    );
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="d-flex justify-content-end px-4 pt-2 mt-3">
            <div className="col-md-4 pe-2 pt-2">
              <form
                action="/pms/departments"
                acceptCharset="UTF-8"
                method="get"
              >
                <div className="input-group">
                  <input
                    type="text"
                    name="s[name_cont]"
                    id="s_name_cont"
                    className="form-control tbl-search table_search"
                    placeholder="Type your keywords here"
                  />
                  <div className="input-group-append">
                    <button type="submit" className="btn btn-md btn-default">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.66927 13.939C3.9026 13.939 0.835938 11.064 0.835938 7.53271C0.835938 4.00146 3.9026 1.12646 7.66927 1.12646C11.4359 1.12646 14.5026 4.00146 14.5026 7.53271C14.5026 11.064 11.4359 13.939 7.66927 13.939ZM7.66927 2.06396C4.44927 2.06396 1.83594 4.52021 1.83594 7.53271C1.83594 10.5452 4.44927 13.0015 7.66927 13.0015C10.8893 13.0015 13.5026 10.5452 13.5026 7.53271C13.5026 4.52021 10.8893 2.06396 7.66927 2.06396Z"
                          fill="#8B0203"
                        />
                        <path
                          d="M14.6676 14.5644C14.5409 14.5644 14.4143 14.5206 14.3143 14.4269L12.9809 13.1769C12.7876 12.9956 12.7876 12.6956 12.9809 12.5144C13.1743 12.3331 13.4943 12.3331 13.6876 12.5144L15.0209 13.7644C15.2143 13.9456 15.2143 14.2456 15.0209 14.4269C14.9209 14.5206 14.7943 14.5644 14.6676 14.5644Z"
                          fill="#8B0203"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="card-tools mt-1">
              <button
                className="purple-btn2 rounded-3"
                onClick={() => navigate("/amenities")}
                aria-label="Add a new amenity"
              >
                <span>Add</span>
              </button>
            </div>
          </div>
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Amenities List</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-danger">{error}</p>
              ) : (
                <div className="tbl-container mt-4 px-1">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Site Name</th>
                        <th>Icon</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedAmenities.length > 0 ? (
                        displayedAmenities.map((amenity, index) => (
                          <tr key={index}>
                            <td>{amenity.name || "No Name"}</td>
                            <td></td>
                            <td>
                              {amenity.icon_url ? (
                                <img
                                  src={amenity.icon_url}
                                  alt={amenity.name || "No Name"}
                                  width="50"
                                  height="50"
                                />
                              ) : (
                                <span>No Icon</span>
                              )}
                            </td>
                            <td>
                              <button
                                aria-label={`Edit ${amenity.name || "No Name"}`}
                                style={{ background: "none", border: "none" }}
                                onClick={() =>
                                  navigate(`/edit-amenities/${amenity.id}`)
                                }
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center" }}>
                            No amenities found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {/* Pagination */}
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <ul className="pagination">
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
                    >
                      Prev
                    </button>
                  </li>
                  {Array.from(
                    { length: pagination.total_pages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        pagination.current_page === page ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
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
                    >
                      Last
                    </button>
                  </li>
                </ul>
                <p>
                  Showing{" "}
                  {Math.min(
                    (pagination.current_page - 1) * pageSize + 1,
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
  );
};

export default AmenitiesList;
