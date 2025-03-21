import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectDetailsList = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getPageFromStorage = () => {
    return (
      parseInt(localStorage.getItem("project_details_list_currentPage")) || 1
    );
  };
  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_pages: 5,
    total_count: 50, // total number of entries
  });

  const [expandedConfigs, setExpandedConfigs] = useState({});

  const toggleExpand = (index) => {
    setExpandedConfigs((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle the specific configuration's expansion
    }));
  };

  const [loading, setLoading] = useState(false);

  const pageSize = 10; // Items per page

  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    const url = "https://panchshil-super.lockated.com/get_projects_all.json";

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const projectsData = response.data?.projects || [];
      setProjects(projectsData);

      setPagination({
        current_page: getPageFromStorage(),
        total_count: projectsData.length,
        total_pages: Math.ceil(projectsData.length / pageSize),
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Unable to fetch project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prevState) => ({ ...prevState, current_page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Instead of fetching new data, we'll update the URL params like BannerList
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("s[name_cont]", searchQuery);
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pagination.total_pages) {
      setPagination({
        ...pagination,
        current_page: pageNumber,
      });
      localStorage.setItem("project_details_list_currentPage", pageNumber);
    }
  };

  // Filter projects based on search query (client-side filtering like BannerList)
  const filteredProjects = searchQuery
    ? projects.filter((project) =>
        (project.project_name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        )
      )
    : projects;

  // Update pagination based on filtered results
  const totalFilteredPages = Math.ceil(filteredProjects.length / pageSize);

  // Get the current page of projects to display
  const displayedProjects = filteredProjects.slice(
    (pagination.current_page - 1) * pageSize,
    pagination.current_page * pageSize
  );

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="d-flex justify-content-end px-4 pt-2 mt-3 ">
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
                      value={searchQuery}
                      onChange={handleSearchChange}
                      name="s[name_cont]"
                      id="s_name_cont"
                      className="form-control tbl-search table_search"
                      placeholder="Search"
                      fdprocessedid="u38fp"
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
                </form>{" "}
              </div>
              <div className="card-tools mt-1">
                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() => navigate("/project-create")}
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
            </div>
            <div className="module-data-section container-fluid">
            <div className="card mt-4 pb-4 mx-3">
                <div className="card-header">
                  <h3 className="card-title">Project List</h3>
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
                      <table className="w-110" style={{ width: "max-content" }}>
                        <thead>
                          <tr>
                            <th>Sr No</th>
                            <th>Project Name</th>
                            <th>Property Type</th>
                            <th>SFDC Project ID</th>
                            <th>Project Construction Status</th>
                            <th>Configuration Type</th>
                            <th>Price Onward</th>
                            <th>Project Size (Sq. Mtr)</th>
                            <th>Project Size (Sq. Ft)</th>
                            <th>Rera Carpet Area (Sq. M)</th>
                            <th>Rera Carpet Area (Sq. Ft)</th>
                            <th>Number Of Towers</th>
                            <th>Number Of Units</th>
                            <th>Rera Number</th>
                            <th>Amenities</th>
                            <th>Specifications</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedProjects?.map((project, index) => (
                            <tr key={index}>
                              <td>
                                {(pagination.current_page - 1) * pageSize +
                                  index +
                                  1}
                              </td>
                              <td>{project?.project_name || "N/A"}</td>
                              <td>{project?.property_type || "N/A"}</td>
                              <td>{project?.SFDC_Project_Id || "N/As"}</td>
                              <td>
                                {project?.Project_Construction_Status || "N/A"}
                              </td>

                              <td style={{ width: "200px" }}>
                                {project?.configurations?.length > 0
                                  ? project?.configurations.map(
                                      (configurations, idx) => (
                                        <div key={idx}>
                                          {configurations.name}{" "}
                                          <img
                                            src={configurations.icon_url}
                                            alt={configurations.name}
                                            style={{
                                              width: "20px",
                                              marginLeft: "5px",
                                            }}
                                          />
                                        </div>
                                      )
                                    )
                                  : "No Configuration Type"}
                              </td>

                              <td>{project?.price || "N/A"}</td>
                              <td>{project?.project_size_sq_mtr || "N/A"}</td>
                              <td>{project?.project_size_sq_ft || "N/A"}</td>
                              <td>
                                {project?.rera_carpet_area_sq_mtr || "N/A"}
                              </td>
                              <td>{project?.rera_carpet_area_sqft || "N/A"}</td>
                              <td>{project?.no_of_towers || "N/A"}</td>
                              <td>{project?.no_of_apartments || "N/A"}</td>
                              <td>{project?.rera_number || "N/A"}</td>
                              <td style={{ width: "200px" }}>
                                {project?.amenities?.length > 0
                                  ? project?.amenities.map((amenity, idx) => (
                                      <div key={idx}>
                                        {amenity.name}{" "}
                                        <img
                                          src={amenity.icon_url}
                                          alt={amenity.name}
                                          style={{
                                            width: "20px",
                                            marginLeft: "5px",
                                          }}
                                        />
                                      </div>
                                    ))
                                  : "No amenities"}
                              </td>
                              <td>
                                {project?.specifications?.length > 0
                                  ? project?.specifications.map((spec, idx) => (
                                      <div key={idx}>{spec.name}</div>
                                    ))
                                  : "No specifications"}
                              </td>
                              <td>
                                <a
                                  href={`/project-edit/${project?.id || "N/A"}`}
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
                                </a>
                                <a
                                  href={`/project-details/${project?.id || "N/A"}`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-eye"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"></path>
                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"></path>
                                  </svg>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="d-flex align-items-center justify-content-between px-3 pagination-section">
                  
                    <ul className="pagination" role="navigation" aria-label="pager">
                      {/* First Page Button */}
                      <li
                        className={`page-item ${
                          pagination.current_page === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.current_page === 1}
                        >
                          First
                        </button>
                      </li>

                      {/* Previous Page Button */}
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

                      {/* Page Number Buttons */}
                      {Array.from(
                        {
                          length: Math.ceil(filteredProjects.length / pageSize),
                        },
                        (_, index) => index + 1
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

                      {/* Next Page Button */}
                      <li
                        className={`page-item ${
                          pagination.current_page === totalFilteredPages
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
                            pagination.current_page === totalFilteredPages
                          }
                        >
                          Next
                        </button>
                      </li>

                      {/* Last Page Button */}
                      <li
                        className={`page-item ${
                          pagination.current_page === totalFilteredPages
                            ? "disabled"
                            : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(totalFilteredPages)}
                          disabled={
                            pagination.current_page === totalFilteredPages
                          }
                        >
                          Last
                        </button>
                      </li>
                    </ul>

                    {/* Showing Entries Information */}
                    <div>
                      <p>
                        Showing{" "}
                        {filteredProjects.length > 0
                          ? Math.min(
                              (pagination.current_page - 1) * pageSize + 1,
                              filteredProjects.length
                            )
                          : 0}{" "}
                        to{" "}
                        {Math.min(
                          pagination.current_page * pageSize,
                          filteredProjects.length
                        )}{" "}
                        of {filteredProjects.length} entries
                      </p>
                    </div>
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

export default ProjectDetailsList;
