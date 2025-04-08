import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";

// Configuration for both projects
const projectConfigs = {
  panchshil: {
    baseURL: "https://ui-panchshil-super.lockated.com",
    logoUrl: LOGO_URL, // Replace with actual Panchshil logo
    loginBgClass: "login_bg",
    loginSecClass: "login-sec",
    logoStyle: { width: 100, height: 100, margin: "auto" },
    showRegisterButton: true,
    formTextColor: "",
    alignContent: "justify-content-center",
    columnClass: "col-lg-7 col-md-7"
  },
  rustomjee: {
    baseURL: "https://ui-loyalty-super.lockated.com/banner-list",
    logoUrl: Rustomji_URL, // Replace with actual Rustomjee logo
    loginBgClass: "login_bg_rustomji",
    loginSecClass: "login-sec-rustom pt-5",
    logoStyle: { width: 300, height: 125, margin: "20px 40px" },
    showRegisterButton: false,
    formTextColor: "text-light",
    alignContent: "justify-content-end",
    columnClass: "col-lg-4 p-0 m-0 col-md-4"
  }
};

const SignIn = () => {
  // State management (keep all your existing state)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedContent, setSelectedContent] = useState("content1");
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [OtpSection, setOtpSection] = useState(true);
  
  const navigate = useNavigate();
  
  // Determine which project we're using based on the current URL
  const [currentProject, setCurrentProject] = useState('panchshil');
  
  useEffect(() => {
    // Detect which project is active based on the URL
    if (window.location.href.includes('ui-loyalty-super')) {
      setCurrentProject('rustomjee');
    } else {
      setCurrentProject('panchshil');
    }
  }, []);
  
  // Get the current project's configuration
  const config = projectConfigs[currentProject];
  
  // Keep all your existing functions (handlePasswordLogin, handleSendOtp, etc.)

  // Common form components to avoid duplication
  const renderPasswordLogin = () => (
    <div className="mt-2 login-content">
      <div className="form-group position-relative">
        <label className={`mb-1 ${config.formTextColor}`} htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          className="form-control mb-2"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group position-relative">
        <label className={`mb-1 ${config.formTextColor}`} htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          className="form-control"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="d-flex justify-content-start mt-2 mb-3 gap-2">
        <a className="forget-btn" href="/forgot-password">
          Forgot password?
        </a>
      </div>
      
      {error && <p className="text-danger">{error}</p>}
      <button onClick={handlePasswordLogin} type="submit" className="btn btn-danger mt-2">
        {loading ? "Logging in..." : "Login"}
      </button>
      
      {config.showRegisterButton && (
        <button className="btn purple-btn2 mt-3" onClick={regiterPage} 
          style={{ width: "100%", background: "white", color: "black" }}>
          {loading ? "Register in..." : "Register"}
        </button>
      )}
    </div>
  );

  const renderOtpLogin = () => (
    <form onSubmit={handleVerifyOtp} className="mt-3 login-content">
      {OtpSection && (
        <div className="form-group position-relative">
          <label className={`mb-1 ${config.formTextColor}`} htmlFor="mobile">Mobile Number</label>
          <input
            type="tel"
            id="mobile"
            className="form-control mb-2"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
          <button
            type="button"
            className="btn btn-danger mt-2"
            onClick={handleSendOtp}
          >
            Send OTP
          </button>
        </div>
      )}

      {showOtpSection && (
        <div className="form-group position-relative">
          <label className={`mb-1 ${config.formTextColor}`} htmlFor="otp">Enter OTP</label>
          <input
            type="text"
            id="otp"
            className="form-control mb-2"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
      )}

      {error && <p className="text-danger">{error}</p>}

      {showOtpSection && (
        <button type="submit" className="btn btn-danger mt-2">
          Verify OTP
        </button>
      )}
    </form>
  );

  return (
    <main>
      <section className="login_module">
        <div className="container-fluid">
          <div className={`row align-items-center vh-100 ${config.loginBgClass} ${config.alignContent}`}>
            <div className={`${config.columnClass} vh-50 d-flex align-items-${currentProject === 'rustomjee' ? 'end' : 'center'}`}>
              <div className={config.loginSecClass}>
                <img
                  className="logo_img"
                  style={config.logoStyle}
                  src={config.logoUrl}
                  alt="Logo"
                />
                
                <div className="d-flex mt-2 gap-3 align-items-center">
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="contentSelector"
                        value="content1"
                        checked={selectedContent === "content1"}
                        onChange={() => toggleContent("content1")}
                      />
                      <label className={`form-check-label ${config.formTextColor}`}>
                        Login With Password
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="contentSelector"
                        value="content2"
                        checked={selectedContent === "content2"}
                        onChange={() => toggleContent("content2")}
                      />
                      <label className={`form-check-label ${config.formTextColor}`}>
                        Login With OTP
                      </label>
                    </div>
                  </div>
                </div>

                {selectedContent === "content1" && renderPasswordLogin()}
                {selectedContent === "content2" && renderOtpLogin()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignIn;