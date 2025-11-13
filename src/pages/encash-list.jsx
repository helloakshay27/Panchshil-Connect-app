import React, { useState, useEffect } from "react";
// import "../styles/style.css";
import { Link } from "react-router-dom";
// import SubHeader from "../components/SubHeader";
import axios from "axios";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { baseURL } from "./baseurl/apiDomain";
import Pagination from "../components/reusable/Pagination";

const EncashList = () => {
  const [encashRequests, setEncashRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [transactionMode, setTransactionMode] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const storedValue = sessionStorage.getItem("selectedId");
  const token = localStorage.getItem("access_token");

  const fetchEncashRequests = async () => {
    try {
      const response = await axios.get(
        `${baseURL}encash_requests.json?is_admin=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setEncashRequests(response.data);
      setFilteredItems(response.data);
      console.log("Encash Requests", response.data);
    } catch (err) {
      setError("Failed to fetch encash requests.");
      console.error("Error fetching encash requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncashRequests();
  }, [token]);

  const handleStatusChange = async (id, status) => {
    if (status === "completed") {
      // Open modal for completed status
      const request = encashRequests.find(req => req.id === id);
      setSelectedRequest(request);
      setShowModal(true);
    }
    // For "requested" status, no action needed as per requirements
  };

  const handleCompleteRequest = async () => {
    if (!selectedRequest || !transactionMode || !transactionNumber) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await axios.put(
        `${baseURL}encash_requests/${selectedRequest.id}.json?access_token=${token}`,
        {
          encash_request: {
            status: "completed",
            transaction_mode: transactionMode,
            transaction_number: transactionNumber
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setShowModal(false);
      setTransactionMode("");
      setTransactionNumber("");
      setSelectedRequest(null);

      // Refresh data from API after update
      setLoading(true);
      await fetchEncashRequests();

      alert("Request completed successfully!");
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = () => {
    const filtered = encashRequests.filter((request) =>
      `${request.person_name} ${request.account_number} ${request.status}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
    setCurrentPage(1);
    setSuggestions([]);
  };

  const handleSearchInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const filteredSuggestions = encashRequests.filter((request) =>
        `${request.person_name} ${request.account_number} ${request.status}`
          .toLowerCase()
          .includes(term.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      const selectedItem = suggestions[selectedIndex];
      setSearchTerm(selectedItem.person_name);
      setFilteredItems([selectedItem]);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (request) => {
    setSearchTerm(request.person_name);
    setSuggestions([]);
    setFilteredItems([request]);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilteredItems(encashRequests);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const Pagination = ({ currentPage, totalPages, totalEntries, onPageChange }) => {
    const startEntry = totalEntries > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);

    return (
      <div className="d-flex justify-content-between align-items-center px-3 mt-2">
        <ul className="pagination justify-content-center d-flex">
          <li
            className={`page-item ${
              currentPage === 1 ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
          </li>
          <li
            className={`page-item ${
              currentPage === 1 ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
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
                currentPage === pageNumber ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </li>
        </ul>
        <p className="text-center" style={{ marginTop: "10px", color: "#555" }}>
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="w-100">
        <div className="module-data-section mt-2">
          {/* <p className="pointer">
            <span>Encash</span> &gt; Encash List
          </p> */}
          <div className="card mt-3 mx-3">
            <div className="card-header mb-0">
              <h3 className="card-title">Encash Requests</h3>
            </div>
            <div className="card-body">

          <div className="d-flex justify-content-end align-items-center">
            <div className="d-flex align-items-center">
              <div className="input-group me-3">
                <input
                  type="text"
                  className="form-control tbl-search table_search"
                  placeholder="Search by name or description"
                  value={searchTerm}
                  onChange={(e) => {
                    handleSearchInputChange(e);
                    handleSearch();
                  }}
                  onKeyDown={handleKeyDown}
                />
                <div className="input-group-append">
                  <button type="button" className="btn btn-md btn-default">
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
                {suggestions.length > 0 && (
                  <ul className="search-suggestions position-absolute" style={{
                    top: "100%",
                    left: "0",
                    width: "100%",
                    zIndex: 1000,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    listStyle: "none",
                    padding: "0",
                    margin: "0"
                  }}>
                    {suggestions.map((request, index) => (
                      <li
                        key={request.id}
                        className={`search-suggestion-item ${selectedIndex === index ? "selected" : ""}`}
                        onClick={() => handleSuggestionClick(request)}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
                      >
                        {request.person_name} - {request.account_number}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div
            className="tbl-container mt-4"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : currentItems.length > 0 ? (
              <>
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <table className="w-100" style={{ color: '#000', fontWeight: '400', fontSize: '13px' }}>
                    <colgroup>
                      <col style={{ width: "80px" }} />
                      <col style={{ width: "150px" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "150px" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "150px" }} />
                      <col style={{ width: "180px" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "150px" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "center" }}>ID</th>
                        <th style={{ textAlign: "center" }}>Person Name</th>
                        <th style={{ textAlign: "center" }}>Points</th>
                        <th style={{ textAlign: "center" }}>Fee</th>
                        <th style={{ textAlign: "center" }}>Amount</th>
                        <th style={{ textAlign: "center" }}>Account Number</th>
                        <th style={{ textAlign: "center" }}>IFSC Code</th>
                        <th style={{ textAlign: "center" }}>Branch</th>
                        <th style={{ textAlign: "center" }}>Created At</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center" }}>Transaction</th>
                      </tr>
                    </thead>
                    <tbody
                      style={{
                        color: "#000",
                        fontWeight: "400",
                        fontSize: "13px",
                      }}
                    >
                      {currentItems.map((request) => (
                        <tr key={request.id}>
                          <td style={{ textAlign: "center" }}>{request.id}</td>
                          <td>{request.person_name}</td>
                          <td style={{ textAlign: "right" }}>{request.points_to_encash.toLocaleString()}</td>
                          <td style={{ textAlign: "right" }}>{formatCurrency(request.facilitation_fee)}</td>
                          <td style={{ textAlign: "right" }}>{formatCurrency(request.amount_payable)}</td>
                          <td>{request.account_number}</td>
                          <td>{request.ifsc_code}</td>
                          <td>{request.branch_name}</td>
                          <td>{formatDate(request.created_at)}</td>
                          <td style={{ textAlign: "center" }}>
                            {/* {request.status === "completed" ? (
                              <div>
                                <span className="badge bg-success mb-1">Completed</span>
                                <div>
                                  <small className="d-block">{request.transaction_mode}</small>
                                  <small className="text-muted">{request.transaction_number}</small>
                                </div>
                              </div>
                            ) : ( */}
                              <select
                                className="form-select form-select-sm"
                                value={request.status}
                                onChange={(e) => handleStatusChange(request.id, e.target.value)}
                                style={{
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  backgroundColor: request.status === "completed" ? "#d4edda" : "#fff3cd",
                                border: request.status === "completed" ? "1px solid #c3e6cb" : "1px solid #ffeaa7",
                              }}
                              >
                                <option value="requested">Requested</option>
                                <option value="completed">Completed</option>
                              </select>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {request.transaction_mode && request.transaction_number ? (
                              <div>
                                <small className="d-block">{request.transaction_mode}</small>
                                <small className="text-muted">{request.transaction_number}</small>
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalEntries={filteredItems.length}
                />
              </>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "16px",
                  color: "#555",
                  fontWeight: "500",
                  backgroundColor: "#f9f9f9",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                }}
              >
                No encash requests found. Adjust your search to see results.
              </div>
            )}
          </div>

          {/* Complete Request Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Complete Encash Request</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedRequest && (
                <div>
                  <div className="mb-3">
                    <h6>Request Details:</h6>
                    <p><strong>Person:</strong> {selectedRequest.person_name}</p>
                    <p><strong>Points:</strong> {selectedRequest.points_to_encash.toLocaleString()}</p>
                    <p><strong>Amount Payable:</strong> {formatCurrency(selectedRequest.amount_payable)}</p>
                    <p><strong>Account:</strong> {selectedRequest.account_number}</p>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Transaction Mode <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={transactionMode}
                        onChange={(e) => setTransactionMode(e.target.value)}
                        required
                      >
                        <option value="">Select Mode</option>
                        <option value="UPI">UPI</option>
                        <option value="NEFT">NEFT</option>
                        <option value="RTGS">RTGS</option>
                        <option value="IMPS">IMPS</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Transaction Number <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                        placeholder="Enter transaction number"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <button className="purple-btn2" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="purple-btn1" onClick={handleCompleteRequest}>
                Complete Request
              </button>
            </Modal.Footer>
          </Modal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EncashList;
