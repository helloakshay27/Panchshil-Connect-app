import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// import LoginModal from "../components/LoginModal";
import SignInRustomjee from "./sign_pages/signInRustomjee";
import { baseURL } from "../pages/baseurl/apiDomain"

const LoyaltyMembers = () => {
  const [showModal, setShowModal] = useState(false);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]); //filter
  const [suggestions, setSuggestions] = useState([]); // To store the search suggestions
  const [selectedIndex, setSelectedIndex] = useState(-1); // Track the selected suggestion index
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = String(date.getFullYear()); // Get last two digits of the year
    return `${day}-${month}-${year}`;
  };
  const token = localStorage.getItem("access_token");

  const getMembers = async () => {
    const storedValue = sessionStorage.getItem("selectedId");
    try {
      const response = await axios.get(
        `${baseURL}loyalty/members.json`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      ; // Initialize filteredItems


      // Format the created_at date for each member
      const formattedMembers = response.data.map((member) => ({
        ...member,
        tier_validity: formatDate(member.tier_validity), // Use the correct date property
        last_sign_in: formatDate(member.last_sign_in)
      }));

      setMembers(formattedMembers); // Set formatted members
      setFilteredItems(formattedMembers); // Also set filtered items
    } catch (error) {
      console.error("Error fetching member details:", error);
      // @ts-ignore
      setError("Failed to fetch members. Please try again.");
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    const hasRun = sessionStorage.getItem('hasRun');
    const timer = setTimeout(() => {
      getMembers(); // Fetch members after 2 seconds
    }, 1000);
    if (!hasRun) {
      setShowModal(true); // Open modal



      sessionStorage.setItem('hasRun', 'true'); // Mark as run

      return () => clearTimeout(timer); // Cleanup on unmount
    } else {
      setLoading(false); // Avoid showing loader if already run
    }
  }, []); // Run only once on component mount

  const handleReset = () => {
    setSearchTerm("");
    setFilteredItems(members);
    setCurrentPage(1);
  };

  // Handle search submission (e.g., when pressing 'Go!')
  const handleSearch = () => {
    const filtered = members.filter((member) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      // Check all displayed columns for a match
      return [
        member.id,
        `${member.firstname} ${member.lasttname}`,
        member.member_status?.tier_level,
        member.current_loyalty_points,
        member.last_sign_in,
        member.tier_validity,
      ]
        .map((v) => (v !== null && v !== undefined ? String(v).toLowerCase() : ""))
        .some((v) => v.includes(q));
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
    setSuggestions([]);
  };


  // Handle search input change
  const handleSearchInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const filteredSuggestions = members.filter((member) => {
        const q = term.toLowerCase();
        return [
          member.id,
          `${member.firstname} ${member.lasttname}`,
          member.member_status?.tier_level,
          member.current_loyalty_points,
          member.last_sign_in,
          member.tier_validity,
        ]
          .map((v) => (v !== null && v !== undefined ? String(v).toLowerCase() : ""))
          .some((v) => v.includes(q));
      });

      setSuggestions(filteredSuggestions);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      // Move down in the suggestion list
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      // Move up in the suggestion list
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      // Select the current suggestion
      const selectedItem = suggestions[selectedIndex];
      // handleSuggestionClick(selectedMember);
      setSearchTerm(`${selectedItem.firstname} ${selectedItem.lasttname}`); // Update search term
      setFilteredItems([selectedItem]); // Filter items
      setSuggestions([]); // Clear suggestions
    }
  };


  const handleSuggestionClick = (member) => {
    setSearchTerm(`${member.firstname} ${member.lasttname}`);
    setSuggestions([]); // Clear suggestions after selection
    // @ts-ignore
    setFilteredItems([member]); // Optionally, filter to show the selected member
  };



  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  // const currentItems = filteredItems.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

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
        const aVal = sortConfig.key === 'id' ? Number(a[sortConfig.key]) : a[sortConfig.key];
        const bVal = sortConfig.key === 'id' ? Number(b[sortConfig.key]) : b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
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





  const Pagination = ({
    currentPage,
    totalPages,
    totalEntries,
    onPageChange, // Pass the onPageChange function as a prop
  }) => {
    const startEntry = (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);

    // Function to get the range of page numbers to display
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5; // Set the maximum number of visible pages
      const halfVisible = Math.floor(maxVisiblePages / 2);

      let startPage, endPage;

      if (totalPages <= maxVisiblePages) {
        // If total pages are less than or equal to maxVisiblePages, show all
        startPage = 1;
        endPage = totalPages;
      } else {
        // Otherwise, calculate the start and end pages
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

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    };

    const pageNumbers = getPageNumbers();

    const handleJumpForward = () => {
      if (currentPage + 5 <= totalPages) {
        onPageChange(currentPage + 5);
      } else {
        onPageChange(totalPages); // Go to last page if jump exceeds total pages
      }
    };

    const handleJumpBackward = () => {
      if (currentPage - 5 >= 1) {
        onPageChange(currentPage - 5);
      } else {
        onPageChange(1); // Go to first page if jump goes below 1
      }
    };




    return (
      <nav className="d-flex justify-content-between align-items-center">
        <ul
          className="pagination justify-content-center align-items-center"
          style={{ listStyleType: "none", padding: "0" }}
        >
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(1)} // Jump to first page
              disabled={currentPage === 1}
              style={{ padding: "8px 12px", color: "#5e2750" }}
            >
              «« {/* Double left arrow for jumping to the first page */}
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ padding: "8px 12px", color: "#5e2750" }}
            >
              ‹
            </button>
          </li>

          {pageNumbers.map((page) => (
            <li
              key={page}
              className={`page-item ${page === currentPage ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => onPageChange(page)}
                style={{
                  padding: "8px 12px",
                  color: page === currentPage ? "#fff" : "#5e2750",
                  backgroundColor: page === currentPage ? "#5e2750" : "#fff",
                  border: "2px solid #5e2750",
                  borderRadius: "3px",
                }}
              >
                {page}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${currentPage === totalPages ? "disabled" : ""
              }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ padding: "8px 12px", color: "#5e2750" }}
            >
              ›
            </button>
          </li>
          <li
            className={`page-item ${currentPage === totalPages ? "disabled" : ""
              }`}
          >
            <button
              className="page-link"
              onClick={handleJumpForward} // Jump forward by 7 pages
              disabled={currentPage === totalPages}
              style={{ padding: "8px 12px", color: "#5e2750" }}
            >
              »» {/* Double right arrow for jumping to the last page */}
            </button>
          </li>
        </ul>
        <p className="text-center" style={{ marginTop: "10px", color: "#555" }}>
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </p>
      </nav>
    );
  };





  return (
    <>
      <div className="w-100">
        {/* <SubHeader /> */}
        <div className="module-data-section container-fluid">
          <div className="card mt-3 mx-3">
            <div className="card-header">
              <h3 className="card-title">Loyalty Members</h3>
            </div>
            <div className="card-body">
              <p className="pointer">
                <span>Members</span> &gt; Manage Members
              </p>

              <div className="d-flex justify-content-between align-items-center">
            <Link to="">
              {/* <button className="purple-btn1" style={{ borderRadius: '5px' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="19"
                  fill="currentColor"
                  className="bi bi-plus mb-1"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                </svg>
                <span>New Member</span>
              </button> */}
            </Link>
            <div className="d-flex align-items-center">

              {/* search */}

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
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyDown}
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
                  {suggestions.length > 0 && (
                    <ul
                      className="suggestions-list position-absolute"
                      style={{
                        listStyle: "none",
                        padding: "0",
                        marginTop: "5px",
                        border: "1px solid #ddd",
                        maxHeight: "200px",
                        overflowY: "auto",
                        width: "100%",        // Match width of input field
                        zIndex: 1,             // Ensure it appears on top of other elements
                        backgroundColor: "#fff", // Set solid background color
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional shadow for visibility
                      }}
                    >
                      {suggestions.map((member, index) => (
                        <li
                          // @ts-ignore
                          key={member.id}
                          style={{
                            padding: "8px",
                            cursor: "pointer",
                          }}
                          className={selectedIndex === index ? "highlight" : ""}
                          onClick={() => handleSuggestionClick(member)}
                        >
                          {member.firstname} {member.lasttname}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>



              <button
                className="purple-btn1 rounded-3 px-3"
                onClick={handleSearch}
              >
                Go!
              </button>
              <button
                className="purple-btn2 rounded-3 mt-2"
                onClick={handleReset} // Reset search
              >
                Reset
              </button>
            </div>
          </div>


          <div className="tbl-container mx-3 mt-4"
            // style={{
            //   height: "100%", overflowY: "hidden", margin: "0 100px",
            //   // textAlign: "center"
            // }}
            style={{
              height: "100%",
              // overflowY: "hidden",
              overflowX: "hidden",
              // textAlign: "center",
              display: "flex",
              flexDirection: "column",
              // justifyContent: "space-between",
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
                      <th
                        onClick={() => requestSort('id')}
                        className="cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        Member ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Member Name</th>
                      <th>Tier Level</th>
                      <th>Current Balance</th>
                      <th>Last Activity Date</th>
                      <th>Tier Validity</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#000', fontWeight: '400', fontSize: '13px' }}>
                    {currentItems.map((member) => (
                      <tr key={member.id}>
                        <td style={{ width: '14.2%' }}>{member.id}</td>
                        <td style={{ width: '14.2%' }}>
                          {member.firstname} {member.lasttname}
                        </td>
                        <td style={{ width: '14.2%' }}>{member.member_status.tier_level}</td>
                        <td style={{ width: '14.2%' }}>{member.current_loyalty_points}</td>
                        <td style={{ width: '14.2%' }}>{member.member_status.last_activity_date}</td>
                        <td style={{ width: '14.2%' }}>{member.member_status.tier_validity}</td>
                        <td style={{ width: '14.2%' }}>
                          <Link to={`/member-details/${member.id}`}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="#000000"
                              className="bi bi-eye"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalEntries={sortedItems.length}
                />
              </>
            )}
          </div>
        </div>

        {/* Replace LoginModal with SignInRustomjee */}
        {showModal && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden" }}>
              <SignInRustomjee />
              <div className="text-center my-3">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

          </div>
        </div>
      </div>
    </>
  );
};

export default LoyaltyMembers;


