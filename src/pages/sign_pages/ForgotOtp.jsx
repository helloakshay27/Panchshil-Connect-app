import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import { baseURL } from "../baseurl/apiDomain";
import { LOGO_URL } from "../baseurl/apiDomain";

const ForgotOtp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email"); // Get email from URL
  const mobile = queryParams.get("mobile"); // Get mobile from URL

  const navigate = useNavigate();

  const config = {
    baseURL: "https://panchshil-super.lockated.com/",
    // baseURL: "http://localhost:3000/",

    // baseURL: "https://api-connect.panchshil.com/",
    logoUrl: LOGO_URL,
    loginBgClass: "login_bg",
    loginSecClass: "login-sec",
    logoStyle: { width: 100, height: 100, margin: "auto" },
    showRegisterButton: true,
    formTextColor: "",
    alignContent: "justify-content-center",
    columnClass: "col-lg-7 col-md-7",
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    navigate(
      `/reset-password?email=${encodeURIComponent(
        email
      )}&mobile=${encodeURIComponent(mobile)}`
    );

    // OTP validation (assuming 6-digit OTP)
    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${baseURL}verify-otp`, {
        email,
        otp,
      });

      if (response.data.success) {
        toast.success("OTP verified successfully");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while verifying OTP. Please try again.");
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
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div>
      <main>
        <section className="login_module">
          <div className="container-fluid">
            <div className="row align-items-center vh-100 login_bg justify-content-center">
              <div className="col-lg-7 col-md-7 vh-100 d-flex align-items-center">
                <div
                  className="login-sec"
                  style={{ padding: "4% 10%" }}
                  id="forgetPasswordContainer"
                >
                  <img
                    className="logo_img mb-5"
                    style={config.logoStyle}
                    src={config.logoUrl}
                    alt="Logo"
                  />
                  <form
                    className="otp-content"
                    id="otpForm"
                    onSubmit={handleOtpSubmit}
                  >
                    <div className="paganation-sec d-flex">
                      {/* <div className="back-btn d-flex">
                                                <a href="/forgot-password">&lt; <span> Back </span></a>
                                            </div> */}
                      {/* <div className="paganation d-flex">
                                                <span> Step 2 of 3 </span>
                                                <p>Forgot Password</p>
                                            </div> */}
                    </div>
                    <h5 className="text-white">Enter OTP</h5>
                    <p className="mt-3 mb-3 text-white">
                      We've sent a 5-digit OTP to your mobile number.{" "}
                      <span>{email}</span>
                      {/* <br /> */}
                      Enter it below to continue.
                    </p>
                    {/* OTP field */}
                    <div className="form-group position-relative">
                      <label className="mb-1 text-white" htmlFor="otp">
                        OTP
                      </label>
                      <input
                        type="text"
                        className="form-control-panchshil"
                        id="otp"
                        placeholder="Enter 5-digit OTP..."
                        value={otp}
                        onChange={handleOtpChange}
                        maxLength={6}
                      />
                    </div>
                    {error && <p className="text-danger">{error}</p>}
                    {/* Submit button */}
                    <button
                      type="submit"
                      className="btn-panchshil btn-danger mt-5"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "VERIFY OTP"}
                    </button>

                    <div className="text-center mt-4">
                      <p className="form-text-muted resend-timer mb-0">
                        Resend code in{" "}
                        <span className="resend-time text-white">
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
                          <span
                            style={{
                              fontWeight: "bold",
                              marginLeft: "5px",
                              color: "white",
                            }}
                          >
                            {" "}
                            GO BACK
                          </span>
                        </button>
                      </p>
                    </div>
                    {/* <p className="another-way">
                                            Didn’t receive any email? Check spam or <br />
                                            <a href="/resend-otp">Try another email address</a>
                                        </p> */}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForgotOtp;
