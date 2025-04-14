import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { Rustomji_URL, baseURL } from "../baseurl/apiDomain";

const ForgotOtpRustomjee = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Rustomjee configuration - matching the login page style
  const config = {
    baseURL: "https://dev-panchshil-super-app.lockated.com/",
    logoUrl: Rustomji_URL,
    loginBgClass: "login_bg_rustomji",
    loginSecClass: "login-sec-rustom pt-5",
    logoStyle: { width: 335, height: 108, margin: "20px 0px 50px" },
    formTextColor: "text-light",
    alignContent: "justify-content-end",
    columnClass: "col-lg-4 p-0 m-0 col-md-6",
  };

  useEffect(() => {
    // Get email and mobile from URL parameters
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    const mobileParam = params.get("mobile");
    
    if (emailParam) setEmail(emailParam);
    if (mobileParam) setMobile(mobileParam);
    
    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [location.search]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${baseURL}verify_otp`, {
        email,
        mobile,
        otp
      });

      if (response.data.success) {
        toast.success("OTP verified successfully");
        navigate(`/reset-password?email=${encodeURIComponent(email)}&mobile=${encodeURIComponent(mobile)}&token=${encodeURIComponent(response.data.token || '')}`);
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${baseURL}generate_code`, {
        email,
        mobile,
      });

      if (response.data.success) {
        toast.success("OTP sent again successfully");
        setCountdown(45);
        setCanResend(false);
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prevCountdown) => {
            if (prevCountdown <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prevCountdown - 1;
          });
        }, 1000);
      } else {
        setError(response.data.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/forgot-password");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <main>
      <section className="login_module">
        <div className="container-fluid">
          <div
            className={`row align-items-center vh-100 ${config.loginBgClass} ${config.alignContent}`}
          >
            <div
              className={`${config.columnClass} vh-50 d-flex align-items-end`}
            >
              <div className={config.loginSecClass}>
                <img
                  className="logo_img"
                  style={config.logoStyle}
                  src={config.logoUrl}
                  alt="Rustomjee Logo"
                />

                <form
                  className="mt-2 login-content-rust"
                  onSubmit={handleVerifyOtp}
                >
                  <h6 className={config.formTextColor}>OTP Verification</h6>
                  <p className={`mt-4 ${config.formTextColor}`}>
                    We've sent a 5-digit confirmation code on your email id. Make sure you enter the correct code.
                  </p>

                  <div className="form-group position-relative">
                    <label
                      className={`mb-1 mt-4 ${config.formTextColor}`}
                      htmlFor="otpInput"
                    >
                      OTP
                    </label>
                    <input
                      style={{ height: "40px" }}
                      type="text"
                      className="form-control mb-2"
                      id="otpInput"
                      placeholder="Enter 5 digit OTP..."
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={5}
                      required
                    />
                  </div>

                  {error && <p className="text-danger">{error}</p>}

                  <div className="d-flex align-items-center justify-content-center mt-5">
                    <button
                      type="submit"
                      className="btn-rust btn-danger-rustomjee mt-10 border-0 "
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "VERIFY OTP"}
                    </button>
                  </div>

                  <div className="text-center mt-4">
  <p className="form-text-muted resend-timer mb-0">
    Resend code in <span className="resend-time">{formatTime(countdown)}</span>
  </p>
</div>

<div className="text-center mt-5">
  <p className="form-text-muted mb-0 go-back-wrapper">
    Entered wrong email id?
    <button
      type="button"
      onClick={goBack}
      className="go-back-btn"
    >
      GO BACK
    </button>
  </p>
</div>


                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ForgotOtpRustomjee;