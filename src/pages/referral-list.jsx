import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Referrallist = () => {
  const [referrals, setReferrals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_count: 0,
    total_pages: 0,
  });
  const pageSize = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await fetch(
          "https://panchshil-super.lockated.com/referrals.json",
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
        setPagination((prevState) => ({
          ...prevState,
          total_count: data.referrals.length,
          total_pages: Math.ceil(data.referrals.length / pageSize),
        }));
      } catch (error) {
        console.error("Error fetching referral data:", error);
        setError("Failed to fetch data.");
        setReferrals([]);
      }
    };

    fetchReferrals();
  }, []);

  const handlePageChange = (pageNumber) => {
    setPagination((prevState) => ({
      ...prevState,
      current_page: pageNumber,
    }));
  };

  const filteredReferrals = referrals.filter((referral) =>
    referral.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedReferrals = filteredReferrals.slice(
    (pagination.current_page - 1) * pageSize,
    pagination.current_page * pageSize
  );

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section p-3">
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="d-flex justify-content-end px-4 pt-2 mt-3">
            <div className="col-md-4 pe-2 pt-2">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control tbl-search table_search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            </div>
            <div className="card-tools mt-1">
              <button
                className="purple-btn2 rounded-3"
                onClick={() => navigate("/referral-create")}
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

          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Referral List</h3>
            </div>
            <div className="card-body mt-4 pb-4 pt-0">
              <div className="tbl-container mt-4 ">
                <table className="w-100">
                  <thead>
                    <tr>
                      <th>Sr No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile No</th>
                      <th>Referral Code</th>
                      <th>Project Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedReferrals.length > 0 ? (
                      displayedReferrals.map((referral, index) => (
                        <tr key={referral.id}>
                          <td>
                            {(pagination.current_page - 1) * pageSize +
                              index +
                              1}
                          </td>
                          <td>{referral.name}</td>
                          <td>{referral.email}</td>
                          <td>{referral.mobile}</td>
                          <td>{referral.referral_code || "N/A"}</td>
                          <td>{referral.project_name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No referrals found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center px-3 mt-2">
              <ul className="pagination justify-content-center d-flex">
                {/* First Button */}
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

                {/* Previous Button */}
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

                {/* Dynamic Page Numbers */}
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

                {/* Next Button */}
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

                {/* Last Button */}
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
  );
};

export default Referrallist;
