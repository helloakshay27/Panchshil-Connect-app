import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";
import toast from "react-hot-toast";

const FaqList = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [subCategoryId, setSubCategoryId] = useState(null);
  const [toggleLoading, setToggleLoading] = useState({}); // Track loading state for individual toggles
  
  const navigate = useNavigate();
  const location = useLocation();

  const getPageFromStorage = () => {
    return parseInt(localStorage.getItem("faq_list_currentPage")) || 1;
  };
  
  const [currentPage, setCurrentPage] = useState(getPageFromStorage());
  const pageSize = 10;

useEffect(() => {
  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const params = {};
      const urlParams = new URLSearchParams(location.search);
      const searchParam = urlParams.get("s[question_cont]");
      if (searchParam) {
        params["s[question_cont]"] = searchParam;
      }
      const response = await axios.get(
        `${baseURL}faqs.json`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params,
        }
      );
      if (response.data && response.data.faqs) {
        setFaqs(response.data.faqs);
        setCategoryId(response.data.faq_category_id);
        setSubCategoryId(response.data.faq_sub_category_id);
      } else {
        setFaqs([]);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error.response || error);
      setError("Failed to fetch FAQs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  fetchFaqs();

  // Parse search query from URL if any
  const params = new URLSearchParams(location.search);
  const searchParam = params.get("s[question_cont]");
  if (searchParam) {
    setSearchQuery(searchParam);
  }
}, [location.search]);

  const handlePageChange = (pageNumber) => {
    // Ensure page is within valid range
    const validPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(validPage);
    localStorage.setItem("faq_list_currentPage", validPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    localStorage.setItem("faq_list_currentPage", 1);
    
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("s[question_cont]", searchQuery);
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleToggleEvent = async (id, currentStatus) => {
    toast.dismiss();
    // Set loading state for this specific FAQ
    setToggleLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      // Fixed: Remove the extra slash from the URL
      const response = await axios.put(
        `${baseURL}faqs/${id}.json`,
        { 
          faq: { // Wrap the data in 'faq' object as expected by Rails
            active: !currentStatus 
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      // Update the FAQ in the state immediately for better UX
      setFaqs(faqs.map(faq => 
        faq.id === id ? { ...faq, active: !currentStatus } : faq
      ));
      
      // Clear any previous errors
      setError(null);
       toast.success("Status Updated successfully!");
      
    } catch (error) {
      console.error("Error toggling FAQ status:", error);
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Server error: ${error.response.status}`;
        setError(`Failed to update FAQ status: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        setError("Failed to update FAQ status: No response from server");
      } else {
        // Something else happened
        setError("Failed to update FAQ status: " + error.message);
      }
    } finally {
      // Clear loading state for this specific FAQ
      setToggleLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Filter data by question or answer
  const filteredData = faqs.filter(
    (faq) => 
      !searchQuery || 
      (faq.question && 
       faq.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (faq.answer && 
       faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (faq.faq_tag && 
       faq.faq_tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate pagination values
  const totalFiltered = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  
  // Ensure current page is valid after filtering
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
      localStorage.setItem("faq_list_currentPage", 1);
    }
  }, [totalPages, currentPage]);

  // Get current page data
  const startIndex = (currentPage - 1) * pageSize;
  const displayedFaqs = filteredData.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid">
        <div className="d-flex justify-content-end px-4 pt-2 mt-3">
          <div className="col-md-4 pe-2 pt-2">
            <form
              onSubmit={handleSearchSubmit}
              acceptCharset="UTF-8"
              method="get"
            >
              <div className="input-group">
                <input
                  type="text"
                  name="s[question_cont]"
                  id="s_question_cont"
                  className="form-control tbl-search table_search"
                  placeholder="Search FAQs..."
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
          <div className="card-tools mt-1">
            <button
              className="purple-btn2 rounded-3"
              fdprocessedid="xn3e6n"
              onClick={() => navigate("/faq-create")}
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
              <h3 className="card-title">FAQ List</h3>
              {categoryId && (
                <p className="mb-0">Category ID: {categoryId}</p>
              )}
              {subCategoryId && (
                <p className="mb-0">Sub Category ID: {subCategoryId}</p>
              )}
            </div>
            <div className="card-body mt-3 pb-4 pt-0">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
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
                <div className="tbl-container mt-3">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Sr No</th>
                         <th>FAQ Category</th>
                        <th>Question</th>
                        <th>Answer</th>
                       
                        {/* <th>Site ID</th> */}
                        {/* <th>Tags</th> */}
                        {/* <th>Status</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedFaqs.length > 0 ? (
                        displayedFaqs.map((faq, index) => (
                          <tr key={faq.id || index}>
                            <td>
                              <div className="d-flex gap-2">
                               <a
                                    href=""
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigate(`/faq-edit/${faq.id}`);
                                    }}
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
                                 <button
                                    onClick={() =>
                                      handleToggleEvent(faq.id, faq.active)
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
                                    {faq.active ? (
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
                              </div>
                            </td>
                            <td>{startIndex + index + 1}</td>
                            <td>{faq.faq_category_name || "-"}</td>
                            <td>{faq.question || "-"}</td>
                            <td>
                              <div 
                                style={{ 
                                  maxWidth: '300px', 
                                  wordWrap: 'break-word',
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                {faq.answer || "-"}
                              </div>
                            </td>
                           
                            {/* <td>{faq.site_id || "-"}</td>
                            <td>{faq.faq_tag || "-"}</td> */}
                            {/* <td>
                              <span className={`badge ${faq.active ? 'bg-success' : 'bg-secondary'}`}>
                                {faq.active ? 'Active' : 'Inactive'}
                              </span>
                            </td> */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            {searchQuery ? 'No FAQs found matching your search.' : 'No FAQs found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && totalFiltered > 0 && (
                <div className="d-flex align-items-center justify-content-between px-3 pagination-section">
                  <ul className="pagination" role="navigation" aria-label="pager">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        First
                      </button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                    </li>
                    {Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, i) => {
                        // Show pages around current page
                        let pageToShow;
                        if (totalPages <= 5) {
                          pageToShow = i + 1;
                        } else {
                          const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                          pageToShow = startPage + i;
                        }
                        return pageToShow;
                      }
                    ).map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${currentPage === pageNumber ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        Last
                      </button>
                    </li>
                  </ul>
                  <p>
                    Showing {totalFiltered > 0 ? startIndex + 1 : 0} to{" "}
                    {Math.min(startIndex + pageSize, totalFiltered)} of{" "}
                    {totalFiltered} entries
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqList;