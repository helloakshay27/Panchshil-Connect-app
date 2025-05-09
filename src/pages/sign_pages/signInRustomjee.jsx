import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { Rustomji_URL } from "../baseurl/apiDomain";
import { Eye, EyeOff } from "lucide-react";

const SignInRustomjee = () => {
  // State management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedContent, setSelectedContent] = useState("content1");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  
  // Rustomjee configuration
  const config = {
    baseURL: "https://dev-panchshil-super-app.lockated.com/",
    logoUrl: Rustomji_URL,
    loginBgClass: "login_bg_rustomji",
    loginSecClass: "login-sec-rustom",
    logoStyle: { width: 335, height: 108, margin: "20px 0px 30px" },
    showRegisterButton: false,
    formTextColor: "text-light",
    alignContent: "justify-content-end",
    columnClass: "col-lg-4 p-0 m-0 col-md-6"
  };

  const toggleContent = (content) => {
    setSelectedContent(content);
    setError("");
    setMobileError("");
  };

  const handlePasswordLogin = async (e) => {
    toast.dismiss();
    e.preventDefault();
    
    if (loading) return; // Prevent multiple submissions
    
    setError("");
    setLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
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
        toast.success("Login successful", { id: "login-success" });
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      toast.error("Login failed. Please check your credentials.", { id: "login-error" });
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle mobile number input change with validation
  const handleMobileChange = (e) => {
    const value = e.target.value;
    
    // Only allow numeric input
    if (value && !/^\d*$/.test(value)) {
      return;
    }
    
    setMobile(value);
    
    // Validate for 10 digits as user types
    if (value && value.length !== 10) {
      // setMobileError("Mobile number must be exactly 10 digits");
    } else {
      setMobileError("");
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (loading) return; // Prevent multiple submissions
    
    toast.dismiss();
    
    // Strict validation for 10-digit mobile number
    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${config.baseURL}/generate_code`,
        { mobile }
      );
      
      // Navigate to the dedicated OTP verification page with the mobile number as a query parameter
      navigate(`/verify-otp?mobile=${encodeURIComponent(mobile)}`);
      
      toast.success("OTP Sent successfully", { id: "otp-sent" });
    } catch (err) {
      toast.error("Failed to send OTP. Please try again.", { id: "otp-error" });
      console.error(err);
      setError("Failed to send OTP. Please try again.");
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
        {/* <div className="form-group position-relative">
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
        </div> */}
         <div className="form-group position-relative">
      <label className={`mb-1 ${config.formTextColor}`} htmlFor="password">Password</label>
      
      <div className="position-relative">
        <input
          style={{ height: "40px", paddingRight: "40px" }}
          type={showPassword ? "text" : "password"}
          id="password"
          className="form-control"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="position-absolute"
          style={{
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff size={18} color="var(--red)" />
          ) : (
            <Eye size={18} color="var(--red)" />
          )}
        </button>
      </div>
    </div>
        <div className="d-flex justify-content-end mt-2 mb-3 gap-2">
          <a className="rustomjee-forget-btn" href="/forgot-password">
            Forgot password?
          </a>
        </div>
        
        {error && <p className="text-danger">{error}</p>}
        
        <div className="d-flex align-items-center justify-content-center mt-5">
          <button 
            onClick={handlePasswordLogin} 
            type="submit" 
            className="btn-rust btn-danger-rustomjee mt-10 border-0"
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </div>
      </div>
    );
  };

  const renderOtpLogin = () => (
    <form onSubmit={handleSendOtp} className="mt-3 login-content">
      <div className="form-group position-relative">
        <label className={`mb-1 ${config.formTextColor}`} htmlFor="mobile">
          Mobile Number
        </label>
        <input
          style={{ height: "40px" }}
          type="tel"
          id="mobile"
          className={`form-control mb-2 ${mobileError ? "border-danger" : ""}`}
          placeholder="Enter registered mobile number"
          value={mobile}
          onChange={handleMobileChange}
          maxLength={10}
          required
        />
        {mobileError && <p className="text-danger small mb-0">{mobileError}</p>}
      </div>

      {error && <p className="text-danger">{error}</p>}

      <div className="d-flex align-items-center justify-content-center mt-5">
        <button
          type="submit"
          className="btn-rust btn-danger-rustomjee mt-10 border-0"
          disabled={loading || (mobile.length > 0 && mobile.length !== 10)}
        >
          {loading ? "Sending..." : "SEND OTP"}
        </button>
      </div>
    </form>
  );

  return (
    <main>
      <section className="login_module">
        <div className="container-fluid">
          <div className={`row align-items-center vh-100 ${config.loginBgClass} ${config.alignContent}`}>
            <div className={`${config.columnClass} vh-50 d-flex align-items-end`}>
              <div className={config.loginSecClass}>
                <img
                  className="logo_img"
                  style={config.logoStyle}
                  src={config.logoUrl}
                  alt="Logo"
                />
                
                <div className="d-flex gap-3 me-2 align-items-center justify-content-between me-4 mt-2">
                  <div className="form-group me-3">
                    <div className="form-check p-0">
                      <input
                        className="form-check-box me-2"
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
                  <div className="form-group p-0">
                    <div className="form-check">
                      <input
                        className="form-check-box me-2"
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

export default SignInRustomjee;