import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../mor.css";

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShowModal(false);
  const handleOpen = () => setShowModal(true);

  const firstname = sessionStorage.getItem("firstname");
  const userInitial = firstname ? firstname.charAt(0).toUpperCase() : "";

  const signout = () => {
    sessionStorage.clear();
    localStorage.removeItem("access_token");
    setShowModal(false);
    navigate("/login");
  };

  return (
    <>
      {/* User Info Modal */}
      <div className="modal" style={{ display: showModal ? "block" : "none" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header border-0">
              <button type="button" className="btn-close" onClick={handleClose} />
            </div>
            <div className="text-center pb-5">
              <div className="avatar2">
                <div className="avatar__letters2">{userInitial || "A"}</div>
              </div>
              <h5>{firstname || "First Name"}</h5>
              <p>{sessionStorage.getItem("email") || "example@example.com"}</p>
              <button className="purple-btn2 my-3" onClick={signout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="container-fluid">
          {/* Left Section: Logo + Home & Setup Links */}
          <div className="nav-left">
            <img
              className="logo"
              src="https://panchshil.gophygital.work/uploads/pms/company_setup/logo/226/Panchshil_logo.png"
              alt="Logo"
            />
            <div className="nav-links ms-4">
              <a className="nav-link active px-4 d-flex align-items-center" href="/members">
                Home
              </a>
              <a className="nav-link px-4 d-flex align-items-center" href="/setup-member">
                Setup
              </a>
            </div>
          </div>

          {/* Right Section: Profile Icon or Initial */}
          <a
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            onClick={handleOpen}
          >
            {userInitial ? (
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  backgroundColor: "#de7008",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {userInitial}
              </div>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.9618 14.0544C15.5829 13.1567 15.0329 12.3414 14.3426 11.6537C13.6544 10.9641 12.8392 10.4142 11.942 10.0345C11.9339 10.0305 11.9259 10.0285 11.9179 10.0245C13.1694 9.12047 13.983 7.64792 13.983 5.98654C13.983 3.23431 11.7531 1.00439 9.00089 1.00439C6.24866 1.00439 4.01874 3.23431 4.01874 5.98654C4.01874 7.64792 4.83236 9.12047 6.08392 10.0265C6.07589 10.0305 6.06785 10.0325 6.05982 10.0365C5.15982 10.4162 4.35223 10.9606 3.65915 11.6557C2.9695 12.3439 2.41965 13.1592 2.03995 14.0564C1.66694 14.9348 1.46576 15.8766 1.44732 16.8307C1.44678 16.8522 1.45054 16.8735 1.45838 16.8935C1.46621 16.9134 1.47797 16.9316 1.49294 16.947C1.50792 16.9623 1.52582 16.9745 1.54558 16.9829C1.56535 16.9912 1.58658 16.9955 1.60803 16.9955H2.81339C2.90178 16.9955 2.97209 16.9252 2.9741 16.8388C3.01428 15.2879 3.63705 13.8354 4.73794 12.7345C5.877 11.5955 7.38973 10.9687 9.00089 10.9687C10.612 10.9687 12.1248 11.5955 13.2638 12.7345C14.3647 13.8354 14.9875 15.2879 15.0277 16.8388C15.0297 16.9272 15.1 16.9955 15.1884 16.9955H16.3937C16.4152 16.9955 16.4364 16.9912 16.4562 16.9829C16.476 16.9745 16.4939 16.9623 16.5088 16.947C16.5238 16.9316 16.5356 16.9134 16.5434 16.8935C16.5512 16.8735 16.555 16.8522 16.5545 16.8307C16.5344 15.8705 16.3355 14.9363 15.9618 14.0544Z"
                  fill="#de7008"
                />
              </svg>
            )}
            Profile
          </a>
        </div>
      </nav>
    </>
  );
};

export default Header;
