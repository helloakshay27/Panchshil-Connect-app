import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalEntries, 
  onPageChange,
  itemsPerPage = 10,
  showingText = "Showing"
}) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page and ellipsis
    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={`pagination-btn ${1 === currentPage ? 'active' : ''}`}
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pageNumbers.push(
          <span key="start-ellipsis" className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }
    
    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="end-ellipsis" className="pagination-ellipsis">
            ...
          </span>
        );
      }
      
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`pagination-btn ${totalPages === currentPage ? 'active' : ''}`}
        >
          {totalPages}
        </button>
      );
    }
    
    return pageNumbers;
  };

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          {showingText} {startEntry} to {endEntry} of {totalEntries} entries
        </span>
      </div>
      
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="pagination-btn pagination-nav"
          title="First page"
        >
          <i className="bi bi-chevron-double-left"></i>
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn pagination-nav"
          title="Previous page"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        
        {renderPageNumbers()}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn pagination-nav"
          title="Next page"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-btn pagination-nav"
          title="Last page"
        >
          <i className="bi bi-chevron-double-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Pagination;