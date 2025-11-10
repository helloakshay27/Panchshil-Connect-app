import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Pagination from "../components/reusable/Pagination";

export default function LockPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; // Invalid date check
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  const getPayments = async () => {
    try {
      const response = await axios.get(
        `https://piramal-loyalty-dev.lockated.com/lock_payments`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setPayments(response.data);
      setFilteredItems(response.data);
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError("Failed to fetch payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPayments();
  }, []);

  const handleReset = () => {
    setSearchTerm("");
    setFilteredItems(payments);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    const filtered = payments.filter((payment) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return [
        payment.id,
        payment.order_number,
        payment.payment_date,
        payment.payment_mode,
        payment.total_amount,
        payment.paid_amount,
        payment.payment_status,
        payment.pg_transaction_id,
        payment.payment_gateway,
      ]
        .map((v) => (v !== null && v !== undefined ? String(v).toLowerCase() : ""))
        .some((v) => v.includes(q));
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === null || aVal === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bVal === null || bVal === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

        if (['payment_date', 'created_at', 'updated_at'].includes(sortConfig.key)) {
            const dateA = new Date(aVal).getTime();
            const dateB = new Date(bVal).getTime();
            if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }

        if (['id', 'total_amount', 'paid_amount'].includes(sortConfig.key)) {
            aVal = Number(aVal);
            bVal = Number(bVal);
        }

        if (String(aVal).toLowerCase() < String(bVal).toLowerCase()) return sortConfig.direction === 'asc' ? -1 : 1;
        if (String(aVal).toLowerCase() > String(bVal).toLowerCase()) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const currentItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const Pagination = ({ currentPage, totalPages, totalEntries, onPageChange }) => {
    const startEntry = totalEntries > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage, endPage;

      if (totalPages <= maxVisiblePages) {
        startPage = 1;
        endPage = totalPages;
      } else {
        if (currentPage <= halfVisible) {
          startPage = 1;
          endPage = maxVisiblePages;
        } else if (currentPage + halfVisible >= totalPages) {
          startPage = totalPages - maxVisiblePages + 1;
          endPage = totalPages;
        } else {
          startPage = currentPage - halfVisible;
          endPage = currentPage + halfVisible;
        }
      }
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
      <nav className="d-flex justify-content-between align-items-center mt-3">
        <p className="text-center" style={{ color: "#555" }}>
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </p>
        <ul className="pagination justify-content-center align-items-center" style={{ listStyleType: "none", padding: "0", margin: "0" }}>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(1)} disabled={currentPage === 1} style={{ padding: "8px 12px", color: "#5e2750" }}>««</button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={{ padding: "8px 12px", color: "#5e2750" }}>‹</button>
          </li>
          {pageNumbers.map((page) => (
            <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
              <button className="page-link" onClick={() => onPageChange(page)} style={{ padding: "8px 12px", color: page === currentPage ? "#fff" : "#5e2750", backgroundColor: page === currentPage ? "#5e2750" : "#fff", border: "2px solid #5e2750", borderRadius: "3px" }}>{page}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: "8px 12px", color: "#5e2750" }}>›</button>
          </li>
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} style={{ padding: "8px 12px", color: "#5e2750" }}>»»</button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="w-100">
      <div className="module-data-section mt-2">
        <p className="pointer">
          <span>Payments</span> &gt; Lock Payments
        </p>
        <div className="card mt-3 mx-3">
          <div className="card-header">
            <h3 className="card-title">Lock Payments</h3>
          </div>
          <div className="card-body">

        <div className="d-flex justify-content-end align-items-center">
          <div className="d-flex align-items-center">
            <div className="position-relative me-2">
              <input
                className="form-control"
                style={{ height: "35px", paddingLeft: "30px" }}
                type="search"
                placeholder="Search"
                aria-label="Search"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="position-absolute" style={{ top: "7px", left: "10px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </svg>
              </div>
            </div>
            <button className="purple-btn1 rounded-3 px-3" onClick={handleSearch}>Go!</button>
            <button className="purple-btn2 rounded-3 ms-2" onClick={handleReset}>Reset</button>
          </div>
        </div>

        <div className="tbl-container mx-3 mt-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <>
              <table className="w-100" style={{ color: '#000', fontWeight: '400', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th onClick={() => requestSort('id')} style={{ cursor: 'pointer' }}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => requestSort('payment_date')} style={{ cursor: 'pointer' }}>Payment Date {sortConfig.key === 'payment_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => requestSort('payment_mode')} style={{ cursor: 'pointer' }}>Payment Mode {sortConfig.key === 'payment_mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => requestSort('total_amount')} style={{ cursor: 'pointer' }}>Total Amount {sortConfig.key === 'total_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => requestSort('paid_amount')} style={{ cursor: 'pointer' }}>Paid Amount {sortConfig.key === 'paid_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => requestSort('payment_status')} style={{ cursor: 'pointer' }}>Status {sortConfig.key === 'payment_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => requestSort('pg_transaction_id')} style={{ cursor: 'pointer' }}>Transaction ID {sortConfig.key === 'pg_transaction_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                    <th onClick={() => requestSort('payment_gateway')} style={{ cursor: 'pointer' }}>Gateway {sortConfig.key === 'payment_gateway' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#000', fontWeight: '400', fontSize: '13px' }}>
                  {currentItems.length > 0 ? currentItems.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>{formatDate(payment.payment_date)}</td>
                      <td>{payment.payment_mode || 'N/A'}</td>
                      <td>{payment.total_amount}</td>
                      <td>{payment.paid_amount ?? 'N/A'}</td>
                      <td>{payment.payment_status}</td>
                      <td>{payment.pg_transaction_id || 'N/A'}</td>
                      <td>{payment.payment_gateway || 'N/A'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" className="text-center py-3">No payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalEntries={sortedItems.length} />
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