import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { LOGO_URL } from "../baseurl/apiDomain";

const SignIn = () => {
  // State management
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
  
  // Panchshil configuration
  const config = {
    baseURL: "https://panchshil-super.lockated.com/",
    logoUrl: LOGO_URL,
    loginBgClass: "login_bg",
    loginSecClass: "login-sec",
    logoStyle: { width: 100, height: 100, margin: "auto" },
    showRegisterButton: true,
    formTextColor: "",
    alignContent: "justify-content-center",
    columnClass: "col-lg-7 col-md-7"
  };

  const toggleContent = (content) => {
    setSelectedContent(content);
    setError("");
  };

  const regiterPage = () => {
    navigate("/register");
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // setError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${config.baseURL}/users/signin.json`, {
        user: {
          email,
          password,
        },
      });

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        sessionStorage.setItem("email", response.data.email);
        sessionStorage.setItem("firstname", response.data.firstname);
        navigate("/project-list");
        toast.success("Login successful");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      // setError("Please enter a valid 10-digit mobile number.");
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${config.baseURL}/generate_code`,
        { mobile }
      );
      setOtpSection(false);
      toast.success("OTP Sent successfully");
      setShowOtpSection(true);
    } catch (err) {
      toast.error("Failed to send OTP. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      // setError("Please enter a valid OTP.");
      toast.error("Please enter a valid OTP.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${config.baseURL}/verify_code.json`,
        { mobile, otp }
      );

      const { access_token, email, firstname } = response.data;
      if (access_token) {
        localStorage.setItem("access_token", access_token);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("firstname", firstname);
        navigate("/project-list");
        toast.success("Login successfully");
      } else {
        // setError("Login failed. Please check your credentials.");
        toast.error("Login failed. Please check your credentials.");

      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordLogin = () => {
    return (
      <div className="mt-2 login-content">
        <div className="form-group position-relative">
          <label className={`mb-1 ${config.formTextColor}`} htmlFor="email">Email</label>
          <input
            style={{height:"40px"}}
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
            style={{height:"40px"}}
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
  };

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
            <div className={`${config.columnClass} vh-50 d-flex align-items-center`}>
              <div className={config.loginSecClass}>
                <img
                  className="logo_img"
                  style={config.logoStyle}
                  src={config.logoUrl}
                  alt="Logo"
                />
                
                <div className="d-flex gap-3 me-2 align-items-center mx-0 mt-4">
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