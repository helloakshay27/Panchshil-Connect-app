import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "../mor.css";
import { baseURL } from "./baseurl/apiDomain";
import toast from "react-hot-toast";
// Import toast if using react-hot-toast
// import toast from 'react-hot-toast';

const TestimonialList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [testimonialPermissions, setTestimonialPermissions] = useState({});
  const [activeToastId, setActiveToastId] = useState(null); // Add this state

  const getPageFromStorage = () => {
    return parseInt(localStorage.getItem("testimonial_list_currentPage")) || 1;
  };

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const pageSize = 10;
  const navigate = useNavigate();

  const getTestimonialPermissions = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) return {};

      const permissions = JSON.parse(lockRolePermissions);
      return permissions.testimonial || {};
    } catch (e) {
      console.error("Error parsing lock_role_permissions:", e);
      return {};
    }
  };

  useEffect(() => {
    setTestimonialPermissions(getTestimonialPermissions());
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(
          `${baseURL}testimonials.json?company_id=1`
        );
        setTestimonials(response.data.testimonials || []);
        setPagination((prevState) => ({
          ...prevState,
          total_count: response.data.testimonials.length,
          total_pages: Math.ceil(response.data.testimonials.length / pageSize),
          current_page: getPageFromStorage(),
        }));
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch testimonials.");
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredTestimonials = searchQuery
    ? testimonials.filter(
        (testimonial) =>
          testimonial.user_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          testimonial.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : testimonials;

  const handlePageChange = (pageNumber) => {
    setPagination((prevState) => ({
      ...prevState,
      current_page: pageNumber,
    }));
    localStorage.setItem("testimonial_list_currentPage", pageNumber);
  };

  const displayedTestimonials = filteredTestimonials
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(
      (pagination.current_page - 1) * pageSize,
      pagination.current_page * pageSize
    );

  // Fixed toggle function for testimonials
  const handleToggle = async (id, currentStatus) => {
    toast.dismiss();
    const updatedStatus = !currentStatus;

    // Dismiss any existing toast first (if using toast)
    if (activeToastId) {
      // toast.dismiss(activeToastId);
    }

    try {
      await axios.put(
        `${baseURL}testimonials/${id}.json`,
        { testimonial: { active: updatedStatus } }, // Changed from 'project' to 'testimonial'
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // Update testimonials state instead of projects
      setTestimonials((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, active: updatedStatus } : item
        )
      );

      // Show success message (uncomment if using toast)
      // const newToastId = toast.success("Status updated successfully!", {
      //   duration: 3000,
      //   position: "top-center",
      //   id: `toggle-${id}`,
      // });
      // setActiveToastId(newToastId);
      toast.success("Status updated successfully!");
      console.log("Status updated successfully!");
    } catch (error) {
      console.error("Error toggling banner status:", error);
      toast.error("Limit reached: only 5 active banners allowed. Please deactivate one before activating another.");

      // Show error message (uncomment if using toast)
      // const newToastId = toast.error("Failed to update status.", {
      //   duration: 3000,
      //   position: "top-center",
      //   id: `toggle-error-${id}`,
      // });
      // setActiveToastId(newToastId);
    }
  };

const handleToggleShow = async (id, currentStatus) => {
  const updatedStatus = !currentStatus;

  // Dismiss any existing toast first
  if (activeToastId) {
    toast.dismiss(activeToastId);
  }

  try {
    await axios.put(
      `${baseURL}testimonials/${id}.json`,
      { testimonial: { show_on_home: updatedStatus } },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    setTestimonials((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, show_on_home: updatedStatus } : item
      )
    );

    const newToastId = toast.success("Status updated successfully!", {
      duration: 3000,
      position: "top-center",
      id: `toggle-${id}`,
    });

    setActiveToastId(newToastId);
  } catch (error) {
    console.error("Error updating status:", error);

    let errorMessage = "An error occurred.";
    if (error.response && error.response.status === 400) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        errorMessage = errors.join(" "); // Combine all error messages
      } else if (typeof errors === "string") {
        errorMessage = errors;
      }
    }

    const newToastId = toast.error(errorMessage, {
      duration: 3000,
      position: "top-center",
      id: `toggle-error-${id}`,
    });

    setActiveToastId(newToastId);
  }
};

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid">
        <div className="d-flex justify-content-end px-4 pt-2 mt-3 ">
          <div className="col-md-4 pe-2 pt-2">
            <form action="/pms/departments" acceptCharset="UTF-8" method="get">
              <div className="input-group">
                <input
                  type="text"
                  name="s[name_cont]"
                  id="s_name_cont"
                  className="form-control tbl-search table_search"
                  placeholder="Search"
                  fdprocessedid="u38fp"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <div className="input-group-append">
                  <button
                    type="submit"
                    className="btn btn-md btn-default"
                    fdprocessedid="2wqzh"
                  >
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
          {testimonialPermissions.create === "true" && (
            <div className="card-tools mt-1">
              <button
                className="purple-btn2 rounded-3"
                fdprocessedid="xn3e6n"
                onClick={() => navigate("/testimonials")}
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
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Testimonials List</h3>
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
                        <th>User Name</th>
                        <th>Content</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Show on Home</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedTestimonials.length > 0 ? (
                        displayedTestimonials.map((testimonial, index) => (
                          <tr key={testimonial.id}>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "1px",
                                  padding: "2px",
                                }}
                              >
                                {/* {testimonialPermissions.update === "true" && ( */}
                                  <button
                                    className="btn btn-link"
                                    onClick={() =>
                                      navigate("/testimonial-edit", {
                                        state: { testimonial },
                                      })
                                    }
                                    // style={{
                                    //   background: "none",
                                    //   border: "none",
                                    //   padding: "0",
                                    //   display: "flex",
                                    //   alignItems: "center",
                                    //   justifyContent: "flex-start",
                                    //   marginRight: "10px",
                                    // }}
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
                                {/* )} */}
                                {testimonialPermissions.show === "true" && (
                                  <button
                                    onClick={() =>
                                      handleToggle(
                                        testimonial.id,
                                        testimonial.active
                                      )
                                    }
                                    className="toggle-button"
                                    style={{
                                      border: "none",
                                      background: "none",
                                      cursor: "pointer",
                                      padding: 0,
                                      width: "35px",
                                    }}
                                  >
                                    {testimonial.active ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
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
                                        xmlns="http://www.w3.org/2000/svg"
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
                                )}
                              </div>
                            </td>
                            <td>
                              {(pagination.current_page - 1) * pageSize +
                                index +
                                1}
                            </td>
                            <td>{testimonial.user_name || "-"}</td>
                            <td>{testimonial.content || "-"}</td>
                            <td>
                              {new Date(
                                testimonial.created_at
                              ).toLocaleString()}
                            </td>
                            <td>
                              {new Date(
                                testimonial.updated_at
                              ).toLocaleString()}
                            </td>
                             <td>
                               <button
                                    onClick={() =>
                                      handleToggleShow(testimonial.id, testimonial.show_on_home)
                                    }
                                    className="toggle-button"
                                    style={{
                                      border: "none",
                                      background: "none",
                                      cursor: "pointer",
                                      padding: 0,
                                      width: "35px",
                                    }}
                                  >
                                    {testimonial.show_on_home ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
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
                                        xmlns="http://www.w3.org/2000/svg"
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
                          <td colSpan="6" className="text-center">
                            No testimonials available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
  );
};

export default TestimonialList;
