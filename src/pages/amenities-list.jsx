import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { baseURL } from "./baseurl/apiDomain";

const AmenitiesList = () => {
  const [amenities, setAmenities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amenitiesPermissions, setAmenitiesPermissions] = useState({});

  const pageSize = 10;
  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("amenities_list_currentPage")) || 1;
  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const navigate = useNavigate();

  const getAmenitiesPermissions = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) return {};

      const permissions = JSON.parse(lockRolePermissions);
      return permissions.amenities || {}; // 👈 Fetching amenities-specific permissions
    } catch (e) {
      console.error("Error parsing lock_role_permissions:", e);
      return {};
    }
  };

  useEffect(() => {
    const permissions = getAmenitiesPermissions();
    console.log("Amenities permissions:", permissions);
    setAmenitiesPermissions(permissions);
  }, []);

  useEffect(() => {
    const fetchAmenities = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}amenity_setups.json`);
        const data = response.data.amenities_setups || [];

        setAmenities(data);
        setPagination({
          total_count: data.length,
          total_pages: Math.ceil(data.length / pageSize),
          current_page: getPageFromStorage(),
        });
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
    setPagination((prev) => ({ ...prev, current_page: page }));
    localStorage.setItem("amenities_list_currentPage", page);
  };

  const handleToggle = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    try {
      const response = await axios.put(`${baseURL}amenity_setups/${id}.json`, {
        amenity_setup: { active: updatedStatus },
      });

      if (response.status === 200) {
        setAmenities((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, active: updatedStatus } : item
          )
        );
        toast.success("Status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const handleNightModeToggle = async (id, currentNightMode) => {
    try {
      const updatedValue = !currentNightMode;

      await axios.put(
        `${baseURL}amenity_setups/${id}.json`,
        {
          amenity_setup: {
            night_mode: updatedValue,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // ✅ Update local state to reflect the new night_mode
      setAmenities((prevAmenities) =>
        prevAmenities.map((amenity) =>
          amenity.id === id ? { ...amenity, night_mode: updatedValue } : amenity
        )
      );

      toast.success(`Night Mode ${updatedValue ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error("Failed to toggle night mode");
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prevState) => ({ ...prevState, current_page: 1 }));
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this amenity?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${baseURL}amenity_setups/${id}.json`);
      toast.success("Amenity deleted successfully!");

      setAmenities((prevAmenities) =>
        prevAmenities.filter((amenity) => amenity.id !== id)
      );
      setPagination((prevState) => ({
        ...prevState,
        total_count: prevState.total_count - 1,
        total_pages: Math.ceil((prevState.total_count - 1) / pageSize),
      }));
    } catch (error) {
      toast.error("Error deleting amenity. Please try again.");
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("s[name_cont]", searchQuery);
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const filteredAmenities = amenities.filter((amenity) =>
    (amenity.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );
  const totalFiltered = filteredAmenities.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);

  const displayedAmenities = filteredAmenities
    .slice(
      (pagination.current_page - 1) * pageSize,
      pagination.current_page * pageSize
    )
    .sort((a, b) => (a.id || 0) - (b.id || 0));

  return (
    <div className="main-content">
      {/* <div className="website-content overflow-auto"> */}
      <div className="module-data-section container-fluid">
        <div className="d-flex justify-content-end px-4 pt-2 mt-3">
          <div className="col-md-4 pe-2 pt-2">
            <form
              onSubmit={handleSearchSubmit}
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
                  placeholder="Search"
                  fdprocessedid="u38fp"
                  value={searchQuery}
                  onChange={handleSearchChange}
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
          {amenitiesPermissions.create === "true" && (
            <div className="card-tools mt-1">
              <button
                className="purple-btn2 rounded-3"
                onClick={() => navigate("/setup-member/amenities")}
                aria-label="Add a new amenity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={26}
                  height={20}
                  fill="currentColor"
                  className="bi bi-plus"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                </svg>
                <span>Add</span>
              </button>
            </div>
          )}
        </div>
        <div className="module-data-section container-fluid">
          <div className="card mt-4 pb-4 mx-3">
            <div className="card-header">
              <h3 className="card-title">Amenities Setup List</h3>
            </div>
            <div className="card-body mt-4 pb-4 pt-0">
              {loading ? (
                <div className="text-center">
                  <div
                    className="spinner-border"
                    role="status"
                    style={{ color: "var(--red)" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="tbl-container mt-3 ">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Sr No</th>
                        <th>Name</th>

                        <th>Icon</th>
                        <th>Dark Mode Icon</th>
                        <th>Night Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedAmenities.length > 0 ? (
                        displayedAmenities.map((amenity, index) => (
                          <tr key={amenity.id}>
                            <td>
                              {amenitiesPermissions.update === "true" && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "1px",
                                    alignItems: "center",
                                  }}
                                >
                                  <button
                                    className="btn btn-link"
                                    onClick={() =>
                                      navigate(
                                        `/setup-member/edit-amenities/${amenity.id}`
                                      )
                                    }
                                    style={
                                      {
                                        // background: "none",
                                        // border: "none",
                                        // padding: "0",
                                        // display: "flex",
                                        // alignItems: "center",
                                        // justifyContent: "flex-start",
                                      }
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M13.93 6.46611L8.7982 11.5979C8.68827 11.7078 8.62708 11.862 8.62708 12.0183L8.67694 14.9367C8.68261 15.2495 8.93534 15.5023 9.24815 15.5079L12.1697 15.5578H12.1788C12.3329 15.5578 12.4803 15.4966 12.5879 15.3867L19.2757 8.69895C19.9341 8.0405 19.9341 6.96723 19.2757 6.30879L17.8806 4.91368C17.561 4.59407 17.1349 4.4173 16.6849 4.4173C16.2327 4.4173 15.8089 4.5941 15.4893 4.91368L13.93 6.46611C13.9334 6.46271 13.93 6.46271 13.93 6.46611ZM11.9399 14.3912L9.8274 14.3561L9.79227 12.2436L14.3415 7.69443L16.488 9.84091L11.9399 14.3912ZM16.3066 5.73151C16.5072 5.53091 16.8574 5.53091 17.058 5.73151L18.4531 7.12662C18.6593 7.33288 18.6593 7.66948 18.4531 7.87799L17.3096 9.0215L15.1631 6.87502L16.3066 5.73151Z"
                                        fill="#667085"
                                      />
                                      <path
                                        d="M7.42035 20H16.5797C18.4655 20 20 18.4655 20 16.5797V12.0012C20 11.6816 19.7393 11.4209 19.4197 11.4209C19.1001 11.4209 18.8395 11.6816 18.8395 12.0012V16.582C18.8395 17.8264 17.8274 18.8418 16.5797 18.8418H7.42032C6.17593 18.8418 5.16048 17.8298 5.16048 16.582V7.42035C5.16048 6.17596 6.17254 5.16051 7.42032 5.16051H12.2858C12.6054 5.16051 12.866 4.89985 12.866 4.58026C12.866 4.26066 12.6054 4 12.2858 4H7.42032C5.53449 4 4 5.53452 4 7.42032V16.5797C4.00227 18.4677 5.53454 20 7.42035 20Z"
                                        fill="#667085"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleToggle(amenity.id, amenity.active)
                                    }
                                    className="toggle-button"
                                    style={{
                                      border: "none",
                                      background: "none",
                                      cursor: "pointer",
                                      padding: 0,
                                      width: "70px",
                                    }}
                                  >
                                    {amenity.active ? (
                                      <svg
                                        width="40"
                                        height="25"
                                        fill="#de7008"
                                        className="bi bi-toggle-on"
                                        viewBox="0 0 16 16"
                                      >
                                        <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                                      </svg>
                                    ) : (
                                      <svg
                                        width="40"
                                        height="25"
                                        fill="#667085"
                                        className="bi bi-toggle-off"
                                        viewBox="0 0 16 16"
                                      >
                                        <path d="M11 4a4 4 0 0 1 0 8H8a5 5 0 0 0 2-4 5 5 0 0 0-2-4zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8M0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5" />
                                      </svg>
                                    )}
                                  </button>
                                  {/* <button
                                className="btn btn-link"
                                onClick={() => handleDelete(amenity.id)}
                                style={{
                                  background: "none",
                                    border: "none",
                                    padding: "0",
                                    
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  // fill="currentColor"
                                  className="bi bi-trash3"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                </svg>
                              </button> */}
                                </div>
                              )}
                            </td>
                            <td>
                              {(pagination.current_page - 1) * pageSize +
                                index +
                                1}
                            </td>
                            <td>{amenity.name || "-"}</td>

                            <td>
                              {amenity.icon_url ? (
                                <img
                                  src={amenity.icon_url}
                                  className="img-fluid rounded"
                                  alt={amenity.name || "No Name"}
                                  style={{
                                    maxWidth: "100px",
                                    maxHeight: "100px",
                                  }}
                                />
                              ) : (
                                <span>No Icon</span>
                              )}
                            </td>
                            <td>
                              {amenity.dark_mode_icon_url ? (
                                <img
                                  src={amenity.dark_mode_icon_url}
                                  className="img-fluid rounded"
                                  alt={amenity.name || "No Name"}
                                  style={{
                                    maxWidth: "100px",
                                    maxHeight: "100px",
                                  }}
                                />
                              ) : (
                                <span>No Icon</span>
                              )}
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  handleNightModeToggle(
                                    amenity.id,
                                    amenity.night_mode
                                  )
                                }
                                className="toggle-button"
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  width: "70px",
                                }}
                              >
                                {amenity.night_mode ? (
                                  <svg
                                    width="40"
                                    height="25"
                                    fill="green"
                                    className="bi bi-toggle-on"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="40"
                                    height="25"
                                    fill="#667085"
                                    className="bi bi-toggle-off"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M11 4a4 4 0 0 1 0 8H8a5 5 0 0 0 2-4 5 5 0 0 0-2-4zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8M0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5" />
                                  </svg>
                                )}
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
              <div className="d-flex align-items-center justify-content-between px-3 pagination-section">
                <ul className="pagination" role="navigation" aria-label="pager">
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    )
                  )}
                  <li
                    className={`page-item ${
                      pagination.current_page === totalPages ? "disabled" : ""
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
                      pagination.current_page === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(totalPages)}
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
      {/* </div> */}
    </div>
  );
};

export default AmenitiesList;
