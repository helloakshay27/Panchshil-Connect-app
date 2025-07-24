import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";

const SiteList = () => {
  const [siteList, setSiteList] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sitePermission, setSitePermission] = useState({});
  
  const getPageFromStorage = () => {
    return parseInt(localStorage.getItem("site_list_currentPage")) || 1;
  };
  
  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });
  
  const pageSize = 10;

  const getSitePermission = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) return {};
  
      const permissions = JSON.parse(lockRolePermissions);
      return permissions.site || {}; // Fetching site-specific permissions
    } catch (e) {
      console.error("Error parsing lock_role_permissions:", e);
      return {};
    }
  };

  useEffect(() => {
    const permissions = getSitePermission();
    console.log("Site permissions:", permissions);
    setSitePermission(permissions);
  }, []);

  useEffect(() => {
    const fetchSiteList = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}sites.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        console.log("Sites API response:", response.data); // Debug log
        
        // Handle both array and object with sites property formats
        const sites = Array.isArray(response.data) ? response.data : 
                     (response.data.sites ? response.data.sites : []);
        
        setSiteList(sites);
        setPagination({
          current_page: getPageFromStorage(),
          total_count: sites.length,
          total_pages: Math.ceil(sites.length / pageSize),
        });
      } catch (error) {
        console.error("Error fetching sites:", error);
        setSiteList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSiteList();
  }, []);

  const handlePageChange = (pageNumber) => {
    setPagination((prevState) => ({
      ...prevState,
      current_page: pageNumber,
    }));
    localStorage.setItem("site_list_currentPage", pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prevState) => ({ ...prevState, current_page: 1 }));
  };

  const filteredData = siteList.filter((site) =>
    site.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalFiltered = filteredData.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);

  const startIndex = (pagination.current_page - 1) * pageSize;

  const displayedSites = filteredData.slice(
    (pagination.current_page - 1) * pageSize,
    pagination.current_page * pageSize
  );

//   console.log("Navigating to site id:", site.id);


  return (
    <div className="main-content">
      <div className="module-data-section container-fluid">
        <div className="d-flex justify-content-end px-4">
          <div className="col-md-4 pe-2 mt-1">
            <form
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
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className="input-group-append">
                  <button
                    type="submit"
                    className="btn btn-md btn-default"
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
          { sitePermission.create === "true" && (
            <div className="card-tools">
              <button
                className="purple-btn2 rounded-3"
                onClick={() => navigate("/site-create")}
                
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

        <div className="card mx-3 mt-3">
          <div className="card-header">
            <h3 className="card-title">Site List</h3>
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
              <>
                <div className="tbl-container">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Sr No</th>
                        <th>Site Name</th>
                        <th>Company</th>
                        <th>Department</th>
                        <th>Project</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSites.length > 0 ? (
                        displayedSites.map((site, index) => (
                          <tr key={site.id}>
                            <td>
                              {sitePermission.update === "true" && (
                                <a href={`/site-edit/${site.id}`}>
                                    
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
                              )}
                            </td>
                            <td>{startIndex + index + 1}</td>
                            <td>{site.name || "-"}</td>
                            <td>{site.site_company_name || "-"}</td>
                            <td>{site.site_department_name || "-"}</td>
                            <td>{site.site_project_name || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No sites found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {displayedSites.length > 0 && (
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
                        >
                          Prev
                        </button>
                      </li>
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((pageNumber) => (
                        <li
                          key={pageNumber}
                          className={`page-item ${
                            pagination.current_page === pageNumber
                              ? "active"
                              : ""
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
                          pagination.current_page === totalPages
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
                          pagination.current_page === totalPages
                            ? "disabled"
                            : ""
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
                      {pagination.total_count > 0 ? (
                        <>
                          Showing{" "}
                          {pagination.total_count === 0 ? 0 : startIndex + 1} to{" "}
                          {Math.min(
                            startIndex + displayedSites.length,
                            pagination.total_count
                          )}{" "}
                          of {pagination.total_count} entries
                        </>
                      ) : (
                        "No entries found"
                      )}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteList;