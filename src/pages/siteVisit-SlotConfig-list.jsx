import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getPageFromStorage = () => {
  return parseInt(localStorage.getItem("siteSlotVisitCurrentPage")) || 1;
};

const SiteVisitSlotConfigList = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

const [formData, setFormData] = useState({
  active: true
  });
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://panchshil-super.lockated.com/site_schedule/all_site_schedule_slots.json",
        {
          headers: {
            Authorization: `Bearer 4DbNsI3Y_weQFh2uOM_6tBwX0F9igOLonpseIR0peqs`,
            "Content-Type": "application/json",
          },
        }
      );

      const fetchedSlots = response.data.slots || [];
      setSlots(fetchedSlots);

      setPagination({
        current_page: getPageFromStorage(),
        total_count: fetchedSlots.length,
        total_pages: Math.ceil(fetchedSlots.length / pageSize),
      });
    } catch (error) {
      console.error("Error fetching site visit slots:", error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setPagination((prevState) => ({
      ...prevState,
      current_page: pageNumber,
    }));
    localStorage.setItem("siteSlotVisitCurrentPage", pageNumber);
  };

  const filteredSlots = slots.filter((slot) =>
    (slot.project_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFiltered = filteredSlots.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  const displayedSlots = filteredSlots.slice(
    (pagination.current_page - 1) * pageSize,
    pagination.current_page * pageSize
  );


  const handleSubmit = async (e) => {

    const data = new FormData();

    try {
      const response = await axios.put(
        `https://panchshil-super.lockated.com/site_schedules/${selectedId}.json`,
        postData,
        {
          headers: {
            Authorization: `Bearer 4DbNsI3Y_weQFh2uOM_6tBwX0F9igOLonpseIR0peqs`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Slot created successfully!");
      console.log("Data successfully submitted:", response.data);
      navigate("/setup-member/siteVisit-SlotConfig-list");
    } catch (error) {
      console.error(
        "Error submitting data:",
        error.response?.data || error.message
      );
      toast.error("Failed to create slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleToggle = async (slotId, currentStatus) => {
    try {
      const updatedStatus = currentStatus ? 0 : 1; // Convert true/false to 1/0 if needed
  
      const postData = {
        active: updatedStatus,
      };
  
      console.log("Sending payload:", JSON.stringify(postData));
  
      await axios.put(
        `https://panchshil-super.lockated.com/site_schedules/${slotId}.json`,
        postData,
        {
          headers: {
            Authorization: `Bearer 4DbNsI3Y_weQFh2uOM_6tBwX0F9igOLonpseIR0peqs`,
            "Content-Type": "application/json",
          },
        }
      );
  
      // ✅ Update UI after successful API call
      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot.id === slotId ? { ...slot, active: updatedStatus } : slot
        )
      );
  
      console.log("Status updated successfully!");
    } catch (error) {
      console.error("Error updating slot status:", error.response?.data || error);
    }
  };
  
  

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section p-3">
          <div className="d-flex justify-content-end px-4 pt-2 mt-3">
            <div className="col-md-4 pe-2 pt-2">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control tbl-search table_search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((prev) => ({ ...prev, current_page: 1 }));
                  }}
                />
                <div className="input-group-append">
                  <button type="submit"  className="btn btn-md btn-default"
                      fdprocessedid="2wqzh">
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
            </div>
            <div className="card-tools mt-1">
              <button
                className="purple-btn2 rounded-3"
                onClick={() => navigate("/setup-member/siteslot-create")}
              >
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  fill="currentColor"
                  className="bi bi-plus"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                </svg>
                Add
              </button>
            </div>
          </div>

          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Site Slot List</h3>
            </div>
            <div className="card-body mt-3 pb-4 pt-0">
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
                <div className="tbl-container mt-4 ">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Sr No</th>
                        <th>Project Name</th>
                        <th>Scheduled Date</th>
                        <th>Active</th>
                        <th>Start Time & End Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSlots.length > 0 ? (
                        displayedSlots.map((slot, index) => (
                          <tr key={slot.id || index}>
                            <td>
                              {(pagination.current_page - 1) * pageSize +
                                index +
                                1}
                            </td>
                            <td>{slot.project_name || "N/A"}</td>
                            <td>{slot.scheduled_date || "N/A"}</td>
                            <td>
                                <button
                                  onClick={() =>
                                    handleToggle(
                                      slot.id,
                                      slot.active
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
                                  {slot.active ? (
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
                              </td>
                            <td>
                              {slot.start_time} to {slot.end_time}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center px-3 mt-2">
                <ul className="pagination justify-content-center d-flex">
                  {/* First */}
                  <li
                    className={`page-item ${
                      pagination.current_page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={() => handlePageChange(1)}>
                      First
                    </button>
                  </li>

                  {/* Previous */}
                  <li
                    className={`page-item ${
                      pagination.current_page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                    >
                      Prev
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
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
                    )
                  )}

                  {/* Next */}
                  <li
                    className={`page-item ${
                      pagination.current_page === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                    >
                      Next
                    </button>
                  </li>

                  {/* Last */}
                  <li
                    className={`page-item ${
                      pagination.current_page === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                      Last
                    </button>
                  </li>
                </ul>

                {/* Entries Info */}
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
  );
};

export default SiteVisitSlotConfigList;
