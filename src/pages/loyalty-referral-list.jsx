import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {baseURL} from "../pages/baseurl/apiDomain";
import Pagination from "../components/reusable/Pagination";

const LoyaltyReferralList = () => {
  const [referrals, setReferrals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState("");
  const getPageFromStorage = () => {
    return parseInt(localStorage.getItem("referral_list_currentPage")) || 1;
  };
  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch(
          `${baseURL}referrals/get_all_referrals`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        if (!response.ok) {
          const errorMessage = await response.text();
          if (response.status === 401) {
            setError("Unauthorized: Please check your API key or token.");
          } else {
            setError(`HTTP error! status: ${response.status}`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReferrals(data.referrals || []);
        console.log(data.referrals);
        setPagination((prevState) => ({
          ...prevState,
          total_count: data.referrals.length,
          total_pages: Math.ceil(data.referrals.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch (error) {
        console.error("Error fetching referral data:", error);
        setError("Failed to fetch data.");
        setReferrals([]);
      } finally {
        setLoading(false); // Stop loading after fetching
      }
    };

    fetchReferrals();
  }, []);

  const handlePageChange = (pageNumber) => {
    setPagination((prevState) => ({
      ...prevState,
      current_page: pageNumber,
    }));
    localStorage.setItem("referral_list_currentPage", pageNumber);
  };

  // Update filteredReferrals to search all displayed columns
  const filteredReferrals = referrals.filter((referral) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return [
      referral.name,
      referral.email,
      referral.mobile,
      referral.referral_code,
      referral.project_name,
    ]
      .map((v) => (v !== null && v !== undefined ? String(v).toLowerCase() : ""))
      .some((v) => v.includes(q));
  });

  const totalFiltered = filteredReferrals.length;
  const totalPages = Math.ceil(totalFiltered / pageSize);

  const displayedReferrals = filteredReferrals.slice(
    (pagination.current_page - 1) * pageSize,
    pagination.current_page * pageSize
  );

  return (
    <div className="w-100">
      <div className="module-data-section container-fluid">
        <div className="card mt-3 mx-3">
          <div className="card-header">
            <h3 className="card-title">Loyalty Referrals</h3>
          </div>
          <div className="card-body">
            <p className="pointer">
              <span>Referrals</span> &gt; Manage Referrals
            </p>
            <div className="d-flex justify-content-between align-items-center">
          <div />
          <div className="d-flex align-items-center">
            <div className="d-flex align-items-center position-relative">
              <div className="position-relative me-3" style={{ width: "100%" }}>
                <input
                  className="form-control"
                  style={{
                    height: "35px",
                    paddingLeft: "30px",
                    textAlign: "left",
                  }}
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPagination((prev) => ({ ...prev, current_page: 1 }));
                  }}
                />
                <div
                  className="position-absolute"
                  style={{ top: "7px", left: "10px" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              className="purple-btn1 rounded-3 px-3"
              onClick={() => {/* search is live, so just keep focus */}}
            >
              Go!
            </button>
            <button
              className="purple-btn2 rounded-3 mt-2"
              onClick={() => {
                setSearchQuery("");
                setPagination((prev) => ({ ...prev, current_page: 1 }));
              }}
            >
              Reset
            </button>
          </div>
        </div>
        <div
          className="tbl-container mx-3 mt-4"
          style={{
            height: "100%",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <>
              <table className="w-100" style={{ color: '#000', fontWeight: '400', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '16%' }}>Sr No</th>
                    <th style={{ width: '16%' }}>Name</th>
                    <th style={{ width: '16%' }}>Email</th>
                    <th style={{ width: '16%' }}>Mobile No</th>
                    <th style={{ width: '16%' }}>Referral Code</th>
                    <th style={{ width: '16%' }}>Project Name</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#000', fontWeight: '400', fontSize: '13px' }}>
                  {displayedReferrals.length > 0 ? (
                    displayedReferrals.map((referral, index) => (
                      <tr key={referral.id}>
                        <td>{(pagination.current_page - 1) * pageSize + index + 1}</td>
                        <td>{referral.name}</td>
                        <td>{referral.email}</td>
                        <td>{referral.mobile}</td>
                        <td>{referral.referral_code || "N/A"}</td>
                        <td>{referral.project_name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No referrals found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Pagination Controls */}
              {!loading && totalFiltered > 0 && (
                <div className="d-flex align-items-center justify-content-between px-3 pagination-section mt-2">
                  <ul className="pagination justify-content-center d-flex">
                    <li className={`page-item ${pagination.current_page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.current_page === 1}
                      >
                        First
                      </button>
                    </li>
                    <li className={`page-item ${pagination.current_page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                      >
                        Prev
                      </button>
                    </li>
                    {Array.from(
                      { length: totalPages },
                      (_, idx) => idx + 1
                    ).map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${pagination.current_page === pageNumber ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.current_page === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === totalPages}
                      >
                        Next
                      </button>
                    </li>
                    <li className={`page-item ${pagination.current_page === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={pagination.current_page === totalPages}
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
                        totalFiltered
                      )}{" "}
                      to{" "}
                      {Math.min(
                        pagination.current_page * pageSize,
                        totalFiltered
                      )}{" "}
                      of {totalFiltered} entries
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default LoyaltyReferralList;

