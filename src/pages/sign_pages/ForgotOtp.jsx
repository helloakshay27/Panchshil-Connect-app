import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { baseURL } from "../baseurl/apiDomain";
import { LOGO_URL } from "../baseurl/apiDomain";

const ForgotOtp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email"); // Get email from URL
  const mobile = queryParams.get("mobile"); // Get mobile from URL

  const navigate = useNavigate();

  const config = {
    // baseURL: "https://panchshil-super.lockated.com/",
    //  baseURL: "https://connect.panchshil.com/",
  

    baseURL: baseURL,
    logoUrl: LOGO_URL,
    loginBgClass: "login_bg",
    loginSecClass: "login-sec",
    logoStyle: { width: 100, height: 100, margin: "auto" },
    showRegisterButton: true,
    formTextColor: "",
    alignContent: "justify-content-center",
    columnClass: "col-lg-7 col-md-7",
  };

  // Start countdown for resend button
  useEffect(() => {
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
  }, []);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setError("");

    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setError("Please enter a valid OTP.");
      return;
    }

    setLoading(true);

    try {
      // Using GET request like Rustomjee
      const response = await axios.get(
        `${config.baseURL}/get_otps/verify_otp.json`,
        {
          params: {
            email: email,
            mobile: mobile,
            otp: trimmedOtp,
          },
        }
      );

      console.log("API Response:", response.data);

      const { verified, message, user, access_token } = response.data;

      if (verified === true) {
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("userData", JSON.stringify(user));
        sessionStorage.setItem("isLoggedIn", "true");

        sessionStorage.setItem("email", user.email);
        sessionStorage.setItem("firstname", user.firstname);
        sessionStorage.setItem("lastname", user.lastname || "");
        sessionStorage.setItem("mobile", user.mobile);
        sessionStorage.setItem("userId", user.id);

        toast.success(message || "OTP verified successfully");

        setTimeout(() => {
          navigate(
            `/reset-password?email=${encodeURIComponent(
              email
            )}&mobile=${encodeURIComponent(mobile)}`
          );
        }, 100);
      } else {
        setError(message || "Invalid OTP. Please try again.");
        setOtp("");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.error?.message ||
        "An error occurred while verifying OTP. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${config.baseURL}get_otps/generate_otp.json`,
        {
          params: {
            email: email,
            mobile: mobile,
          },
        }
      );

      if (response.data.message) {
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
      setError(
        err.response?.data?.message || "An error occurred while resending OTP."
      );
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
                  // style={{ padding: "4% 10%" }}
                  id="forgetPasswordContainer"
                >
                  <img
                    className="logo_img"
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
                      We&apos;ve sent a 6-digit OTP to your email/mobile.{" "}
                      <span>{email || mobile}</span>
                      {/* <br /> */}
                      Enter it below to continue.
                    </p>
                    {/* OTP field */}
                    <div className="form-group position-relative">
                      <label className="mb-1 text-white" htmlFor="otp">
                        OTP
                      </label>
                      <div className="panchshil-password-input">
                      <input
                        type="text"
                        className="panchshil-password-field"
                        id="otp"
                        placeholder="Enter 6-digit OTP..."
                        value={otp}
                        onChange={handleOtpChange}
                        maxLength={6}
                      />
                    </div>
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
                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="btn btn-link p-0 text-white"
                          disabled={loading}
                        >
                          <span className="back-login-link">Resend OTP</span>
                        </button>
                      ) : (
                        <p className="form-text-muted resend-timer mb-0">
                          Resend code in{" "}
                          <span className="resend-time text-white">
                            {formatTime(countdown)}
                          </span>
                        </p>
                      )}
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
