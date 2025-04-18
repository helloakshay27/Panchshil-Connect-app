import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { Rustomji_URL, baseURL } from "../baseurl/apiDomain";

const LoginWithOtpRustomjee = () => {
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
    loginSecClass: "login-sec-rustom",
    logoStyle: { width: 335, height: 108, margin: "20px 0px 30px" },
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

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setError("");
    
    // Check if OTP is empty
    if (!otp) {
      setError("Please enter a valid OTP.");
      return;
    }
    
    setLoading(true);

    try {
      // Using the verify_code endpoint from SignInRustomjee
      const response = await axios.post(
        `${config.baseURL}/verify_code.json`,
        { mobile, otp }
      );

      const { access_token, email: responseEmail, firstname } = response.data;
      
      if (access_token) {
        // Store user data exactly as in SignInRustomjee
        localStorage.setItem("access_token", access_token);
        sessionStorage.setItem("email", responseEmail || email);
        sessionStorage.setItem("firstname", firstname);
        
        toast.success("OTP verified successfully");
        // Redirect to home page instead of reset-password
        navigate("/project-list");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification failed. Please try again.");
      setError(err.response?.data?.message || "An error occurred while verifying OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");
    toast.dismiss();

    try {
      // Using exact same endpoint and parameters from SignInRustomjee
      const response = await axios.post(
        `${config.baseURL}/generate_code`,
        { mobile }
      );
      
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
    } catch (err) {
      toast.error("Failed to send OTP. Please try again.");
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/login");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
                  onSubmit={handleOtpSubmit}
                >
                  <h6 className={config.formTextColor}>Enter OTP</h6>
                  <p className={`mt-4 ${config.formTextColor}`}>
                    We've sent a 5-digit confirmation code on your email id.
                    Make sure you enter the correct code.
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
                    />
                  </div>

                  {error && <p className="text-danger">{error}</p>}

                  <div className="d-flex align-items-center justify-content-center mt-5">
                    <button
                      type="submit"
                      className="btn-rust btn-danger-rustomjee mt-10 border-0"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "VERIFY OTP"}
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <p className="form-text-muted resend-timer mb-0">
                      Resend code in{" "}
                      <span className="resend-time">
                        {formatTime(countdown)}
                      </span>
                    </p>
                  </div>

                  <div className="text-center mt-5">
                    <p className="form-text-muted mb-0 go-back-wrapper">
                      Entered wrong email id? 
                      <button
                        type="button"
                        onClick={goBack}
                        className="back-login-link"
                      >
                        <span style={{ fontWeight: "bold", marginLeft: "5px" }}>GO BACK</span>
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

export default LoginWithOtpRustomjee;