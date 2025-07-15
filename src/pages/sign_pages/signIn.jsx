import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { baseURL, LOGO_URL } from "../baseurl/apiDomain";
import { Eye, EyeOff } from "lucide-react";

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
  // const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const [OtpSection, setOtpSection] = useState(true);

  const navigate = useNavigate();

  // Panchshil configuration
  const config = {
    // baseURL: "https://panchshil-super.lockated.com/",
    // baseURL: "http://localhost:3000/",
    baseURL: "https://api-connect.panchshil.com/",

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

    if (!password || password.trim() === "") {
      // setError("Please enter your password.");
      toast.error("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${baseURL}/users/signin.json`, {
        user: {
          email,
          password,
        },
      });
      console.log("Response:", response);
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data?.access_token);
        sessionStorage.setItem("email", response.data?.email);
        sessionStorage.setItem("firstname", response.data?.firstname);
        sessionStorage.setItem("lastname", response.data?.lastname);
        sessionStorage.setItem("user_id", response.data?.id);
        sessionStorage.setItem(
          "profile_icon",
          response?.data?.profile_icon_url
        );

        // Duplicate in localStorage
        localStorage.setItem("email", response.data?.email);
        localStorage.setItem("firstname", response.data?.firstname);
        localStorage.setItem("lastname", response.data?.lastname);
        localStorage.setItem("user_id", response.data?.id);
        localStorage.setItem("profile_icon", response?.data?.profile_icon_url);

        // Get All Lock Roles

        // const lockRolesResponse = await axios.get(
        //   `${config.baseURL}/lock_roles.json`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${response.data.access_token}`,
        //     },
        //   }
        // );
        // const lockRoles = lockRolesResponse.data || [];
        // lockRoles.forEach(role => {
        //   if (role.name && role.permissions_hash) {
        //     localStorage.setItem(role.name, role.permissions_hash);
        //   }
        // });
        // localStorage.setItem("lock_roles", JSON.stringify(lockRoles));

        // From Users Sign in Api Lock Roles
        const lockRole = response?.data?.lock_role;
        if (lockRole) {
          localStorage.setItem("lock_role_name", lockRole.name);
          localStorage.setItem(
            "lock_role_permissions",
            lockRole.permissions_hash
          );
        }
        // console.log("Lock Roles:", lockRole);
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
      const response = await axios.post(`${config.baseURL}/generate_code`, {
        mobile,
      });
      setOtpSection(false);
      toast.success("OTP Sent successfully");
      setShowOtpSection(true);
      // navigate("/verify-otp");// Redirect to OTP verification page
    } catch (err) {
      toast.error(err.response?.data?.error || "An error occurred to Send OTP");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const handleVerifyOtp = async (e) => {
  //   e.preventDefault();
  //   if (!otp) {
  //     // setError("Please enter a valid OTP.");
  //     toast.error("Please enter a valid OTP.");
  //     return;
  //   }
  //   setError("");
  //   setLoading(true);

  //   try {
  //     const response = await axios.post(`${config.baseURL}/verify_code.json`, {
  //       mobile,
  //       otp,
  //     });

  //     console.log("Response: verify code", response);
  //     const { access_token, email, firstname } = response.data;
  //     if (access_token) {
  //       localStorage.setItem("access_token", access_token);
  //       const lockRole = response.data?.lock_role;
  //       if (lockRole) {
  //         localStorage.setItem("lock_role_name", lockRole.name);
  //         localStorage.setItem(
  //           "lock_role_permissions",
  //           lockRole.permissions_hash
  //         );
  //       }
  //       sessionStorage.setItem("email", response.data?.email);
  //       sessionStorage.setItem("firstname", response.data?.firstname);
  //       sessionStorage.setItem("lastname", response.data?.lastname);
  //       sessionStorage.setItem("user_id", response.data?.id);
  //       sessionStorage.setItem("profile_icon", response?.data?.profile_icon_url);
  //       localStorage.setItem("user_id", response.data?.id);
  //       // sessionStorage.setItem("email", email);
  //       // sessionStorage.setItem("firstname", firstname);
  //       navigate("/project-list");
  //       toast.success("Login successfully");
  //     } else {
  //       // setError("Login failed. Please check your credentials.");
  //       toast.error("Login failed. Please check your credentials.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setError(
  //       err.response?.data?.message ||
  //       "An error occurred during login. Please try again."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Add this useEffect for the countdown timer
  useEffect(() => {
    if (showOtpSection) {
      setCountdown(45);
      setCanResend(false);

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
    }
  }, [showOtpSection]);

  // Add this function for resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");
    toast.dismiss();

    try {
      const response = await axios.post(`${config.baseURL}/generate_code`, {
        mobile,
      });
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
      toast.error(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setError("");

    if (!otp) {
      setError("Please enter a valid OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${config.baseURL}/get_otps/verify_otp`,
        {
          params: {
            mobile: mobile,
            otp: otp,
          },
        }
      );

      const { otp_valid, message, user, access_token } = response.data;

      if (otp_valid) {
        // Store all user data and tokens
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("userData", JSON.stringify(user));
        sessionStorage.setItem("isLoggedIn", "true");

        // Store individual fields for easy access
        sessionStorage.setItem("email", user.email);
        sessionStorage.setItem("firstname", user.firstname);
        sessionStorage.setItem("lastname", user.lastname || "");
        sessionStorage.setItem("mobile", user.mobile);
        sessionStorage.setItem("userId", user.id);

        toast.success(message || "OTP verified successfully");

        // Navigate after a slight delay to ensure state is updated
        setTimeout(() => {
          navigate("/project-list", { replace: true });
        }, 100);
      } else {
        setError(message || "Invalid OTP. Please try again.");
        setOtp(""); // Clear OTP field on failure
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "An error occurred while verifying OTP. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      setOtp(""); // Clear OTP field on error
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    // Reset all OTP related states
    setOtp("");
    setShowOtpSection(false);
    setOtpSection(true);
    setMobile("");
    setError("");
    setCountdown(45);
    setCanResend(false);
  };

  const renderPasswordLogin = () => {
    return (
      <div className="mt-2 login-content">
        <div className="form-group position-relative">
          <label
            className={`mb-1  text-white ${config.formTextColor}`}
            htmlFor="email"
          >
            Email ID
          </label>

          <input
            // style={{height:"44px"}}
            type="email"
            id="email"
            className="form-control-panchshil mb-2"
            placeholder="Enter email id here..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {/* <div className="form-group position-relative">
          <label
            className={`mb-1 text-white ${config.formTextColor}`}
            htmlFor="password"
          >
            Password
          </label>
          <input
            // style={{height:"44px"}}
            type="password"
            id="password"
            className="form-control-panchshil"
            placeholder="Enter password here..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div> */}
        {/* <div className="form-group position-relative">
          <label
            className={`mb-1 text-white ${config.formTextColor}`}
            htmlFor="password"
          >
            Password
          </label>
          <div className="position-relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-control-panchshil pr-5" // add right padding for eye icon
              placeholder="Enter password here..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: "40px" }} // ensures the eye doesn't overlap text
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="position-absolute"
              style={{
                top: "50%",
                right: "12px",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              {showPassword ? (
                <EyeOff size={18} color="var(--red)" /> // orange-red color as per screenshot
              ) : (
                <Eye size={18} color="var(--red)" />
              )}
            </button>
          </div>
        </div> */}
        <div className="form-group">
          <label
            className={`mb-1 text-white ${config.formTextColor}`}
            htmlFor="password"
          >
            Password
          </label>
          <div className="password-toggle-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-control-panchshil"
              placeholder="Enter password here..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
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

        <button
          onClick={handlePasswordLogin}
          type="submit"
          className="btn-panchshil btn-danger mt-2"
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

        {config.showRegisterButton && (
          <button className="register-btn-panchshil" onClick={regiterPage}>
            {loading ? "Register" : "REGISTER"}
          </button>
        )}
      </div>
    );
  };

  const renderOtpLogin = () => (
    // <form onSubmit={handleVerifyOtp} className="mt-3 login-content">
    //   {OtpSection && (
    //     <div className="form-group position-relative">
    //       <label
    //         className={`mb-1 text-white ${config.formTextColor}`}
    //         htmlFor="mobile"
    //       >
    //         Mobile Number
    //       </label>
    //       <input
    //         // style={{height:"44px"}}
    //         type="tel"
    //         id="mobile"
    //         className="form-control-panchshil "
    //         placeholder="Enter registered mobile number..."
    //         value={mobile}
    //         onChange={(e) => setMobile(e.target.value)}
    //         required
    //       />
    //       <button
    //         type="button"
    //         className="btn-panchshil btn-danger mt-5"
    //         onClick={handleSendOtp}
    //       >
    //         SEND OTP
    //       </button>
    //     </div>
    //   )}

    //   {showOtpSection && (
    //     <div className="form-group position-relative">
    //       <label
    //         className={`mb-1 text-white ${config.formTextColor}`}
    //         htmlFor="otp"
    //       >
    //        OTP
    //       </label>
    //       <input
    //         type="text"
    //         id="otp"
    //         className="form-control-panchshil mb-2"
    //         placeholder="Enter OTP"
    //         value={otp}
    //         onChange={(e) => setOtp(e.target.value)}
    //         required
    //       />
    //     </div>
    //   )}

    //   {error && <p className="text-danger">{error}</p>}

    //   {showOtpSection && (
    //     <button type="submit" className="btn-panchshil btn-danger mt-2">
    //       Verify OTP
    //     </button>
    //   )}
    // </form>
    <form onSubmit={handleVerifyOtp} className="mt-3 login-content">
      {OtpSection && (
        <div className="form-group position-relative">
          <label
            className={`mb-1 text-white ${config.formTextColor}`}
            htmlFor="mobile"
          >
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobile"
            className="form-control-panchshil "
            placeholder="Enter registered mobile number..."
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
          <button
            type="button"
            className="btn-panchshil btn-danger mt-5"
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? "Sending..." : "SEND OTP"}
          </button>
        </div>
      )}

      {showOtpSection && (
        <>
          <div className="form-group position-relative">
            <p className={`pb-3 text-white w-[80%]`}>
              We've sent a 5-digit confirmation code to your mobile number. Make
              sure you enter the correct code.
            </p>
            <label
              className={`mb-1 text-white ${config.formTextColor}`}
              htmlFor="otp"
            >
              OTP
            </label>
            <input
              type="text"
              id="otp"
              className="form-control-panchshil mb-2"
              placeholder="Enter 5 digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={5}
            />
          </div>

          {error && <p className="text-danger">{error}</p>}

          <button
            type="submit"
            className="btn-panchshil btn-danger mt-2"
            disabled={loading}
          >
            {loading ? "Verifying..." : "VERIFY OTP"}
          </button>

          <div className="text-center mt-3">
            {canResend ? (
              <button
                // type="button"
                onClick={handleResendOtp}
                className="btn btn-link p-0 text-white"
                disabled={loading}
              >
                <span className="back-login-link">Resend OTP</span>
              </button>
            ) : (
              <p className="text-white resend-timer mb-0">
                Resend code in{" "}
                <span className="resend-time">{formatTime(countdown)}</span>
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
                <span style={{ fontWeight: "bold", marginLeft: "5px" }}>
                  GO BACK
                </span>
              </button>
            </p>
          </div>
        </>
      )}
    </form>
  );

  return (
    <main>
      <section className="login_module">
        <div className="container-fluid">
          <div
            className={`row align-items-center vh-100 ${config.loginBgClass} ${config.alignContent}`}
          >
            <div
              className={`${config.columnClass} vh-50 d-flex align-items-center`}
            >
              <div className={config.loginSecClass}>
                <img
                  className="logo_img"
                  style={config.logoStyle}
                  src={config.logoUrl}
                  alt="Logo"
                />

                <div className="d-flex gap-3 me-2 align-items-center justify-content-between me-4 mt-4">
                  <div className="form-group ">
                    <div className="form-check">
                      <input
                        className="form-check-box me-2"
                        type="radio"
                        name="contentSelector"
                        value="content1"
                        checked={selectedContent === "content1"}
                        onChange={() => toggleContent("content1")}
                      />
                      <label
                        className={`form-check-label ${config.formTextColor}`}
                      >
                        Login with password
                      </label>
                    </div>
                  </div>
                  <div className="form-group ">
                    <div className="form-check">
                      <input
                        className="form-check-box me-2"
                        type="radio"
                        name="contentSelector"
                        value="content2"
                        checked={selectedContent === "content2"}
                        onChange={() => toggleContent("content2")}
                      />
                      <label
                        className={`form-check-label ${config.formTextColor}`}
                      >
                        Login with OTP
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
