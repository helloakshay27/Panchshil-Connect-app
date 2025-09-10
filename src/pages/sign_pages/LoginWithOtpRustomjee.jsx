// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import "./login.css";
// import toast from "react-hot-toast";
// import { Rustomji_URL, baseURL } from "../baseurl/apiDomain";

// const LoginWithOtpRustomjee = () => {
//   const [otp, setOtp] = useState("");
//   const [email, setEmail] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [countdown, setCountdown] = useState(45);
//   const [canResend, setCanResend] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   // Rustomjee configuration - matching the login page style
//   const config = {
//     baseURL: "https://dev-panchshil-super-app.lockated.com/",
//     logoUrl: Rustomji_URL,
//     loginBgClass: "login_bg_rustomji",
//     loginSecClass: "login-sec-rustom",
//     logoStyle: { width: 335, height: 108, margin: "20px 0px 30px" },
//     formTextColor: "text-light",
//     alignContent: "justify-content-end",
//     columnClass: "col-lg-4 p-0 m-0 col-md-6",
//   };

//   useEffect(() => {
//     // Get email and mobile from URL parameters
//     const params = new URLSearchParams(location.search);
//     const emailParam = params.get("email");
//     const mobileParam = params.get("mobile");

//     if (emailParam) setEmail(emailParam);
//     if (mobileParam) setMobile(mobileParam);

//     // Start countdown for resend button
//     const timer = setInterval(() => {
//       setCountdown((prevCountdown) => {
//         if (prevCountdown <= 1) {
//           clearInterval(timer);
//           setCanResend(true);
//           return 0;
//         }
//         return prevCountdown - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [location.search]);

//   // const handleOtpSubmit = async (e) => {
//   //   e.preventDefault();
//   //   toast.dismiss();
//   //   setError("");

//   //   // Check if OTP is empty
//   //   if (!otp) {
//   //     setError("Please enter a valid OTP.");
//   //     return;
//   //   }

//   //   setLoading(true);

//   //   try {
//   //     // Using the verify_code endpoint from SignInRustomjee
//   //     const response = await axios.get(
//   //       `${config.baseURL}/get_otps/verify_otp.json`,
//   //       { mobile, otp }
//   //     );

//   //     const { access_token, email: responseEmail, firstname } = response.data;

//   //     if (access_token) {
//   //       // Store user data exactly as in SignInRustomjee
//   //       localStorage.setItem("access_token", access_token);
//   //       sessionStorage.setItem("email", responseEmail || email);
//   //       sessionStorage.setItem("firstname", firstname);

//   //       toast.success("OTP verified successfully");
//   //       // Redirect to home page instead of reset-password
//   //       navigate("/project-list");
//   //     } else {
//   //       setError("Invalid OTP. Please try again.");
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //     toast.error("Verification failed. Please try again.");
//   //     setError(err.response?.data?.message || "An error occurred while verifying OTP. Please try again.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

// // const handleOtpSubmit = async (e) => {
// //   e.preventDefault();
// //   toast.dismiss();
// //   setError("");

// //   if (!otp) {
// //     setError("Please enter a valid OTP.");
// //     return;
// //   }

// //   setLoading(true);

// //   try {
// //     const response = await axios.get(`${config.baseURL}/get_otps/verify_otp`, {
// //       params: {
// //         mobile: mobile,
// //         otp: otp,
// //       },
// //     });

// //     console.log("OTP Verification Response:", response.data); // Debugging

// //     const { otp_valid, message, access_token } = response.data;

// //     if (otp_valid) {
// //       // Store authentication tokens and state
// //       if (access_token) {
// //         localStorage.setItem("access_token", access_token);
// //       }
// //       sessionStorage.setItem("isLoggedIn", "true");
// //       sessionStorage.setItem("verifiedMobile", mobile); // Store the verified mobile number

// //       toast.success(message || "OTP verified successfully");

// //       // Ensure navigation happens after state is updated
// //       setTimeout(() => {
// //         navigate("/project-list", { replace: true });
// //       }, 100);
// //     } else {
// //       setError(message || "Invalid OTP. Please try again.");
// //       setOtp(""); // Clear OTP field on failure
// //     }
// //   } catch (err) {
// //     console.error("OTP Verification Error:", err);
// //     const errorMessage = err.response?.data?.message ||
// //                         err.response?.data?.error?.message ||
// //                         "An error occurred while verifying OTP. Please try again.";
// //     toast.error(errorMessage);
// //     setError(errorMessage);
// //     setOtp(""); // Clear OTP field on error
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// const handleOtpSubmit = async (e) => {
//   e.preventDefault();
//   toast.dismiss();
//   setError("");

//   if (!otp) {
//     setError("Please enter a valid OTP.");
//     return;
//   }

//   setLoading(true);

//   try {
//     const response = await axios.get(`${config.baseURL}/get_otps/verify_otp`, {
//       params: {
//         mobile: mobile,
//         otp: otp,
//       },
//     });

//     const { otp_valid, message, user, access_token } = response.data;

//     if (otp_valid) {
//       // Store all user data and tokens
//       localStorage.setItem("access_token", access_token);
//       localStorage.setItem("userData", JSON.stringify(user));
//       sessionStorage.setItem("isLoggedIn", "true");

//       // Store individual fields for easy access
//       sessionStorage.setItem("email", user.email);
//       sessionStorage.setItem("firstname", user.firstname);
//       sessionStorage.setItem("lastname", user.lastname || "");
//       sessionStorage.setItem("mobile", user.mobile);
//       sessionStorage.setItem("userId", user.id);

//       toast.success(message || "OTP verified successfully");

//       // Navigate after a slight delay to ensure state is updated
//       setTimeout(() => {
//         navigate("/project-list", { replace: true });
//       }, 100);
//     } else {
//       setError(message || "Invalid OTP. Please try again.");
//       setOtp(""); // Clear OTP field on failure
//     }
//   } catch (err) {
//     console.error("OTP Verification Error:", err);
//     const errorMessage = err.response?.data?.message ||
//                         err.response?.data?.error?.message ||
//                         "An error occurred while verifying OTP. Please try again.";
//     toast.error(errorMessage);
//     setError(errorMessage);
//     setOtp(""); // Clear OTP field on error
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleResendOtp = async () => {
//     if (!canResend) return;

//     setLoading(true);
//     setError("");
//     toast.dismiss();

//     try {
//       // Using exact same endpoint and parameters from SignInRustomjee
//       // const response = await axios.post(
//       //   `${config.baseURL}/generate_code`,
//       //   { mobile }
//       // );

//        const response = await axios.get(`${config.baseURL}get_otps/generate_otp.json`, {
//       params: {
//         client: "rustomjee",
//         mobile: mobile,
//       }
//     });
//       toast.success("OTP sent again successfully");
//       setCountdown(45);
//       setCanResend(false);

//       // Restart countdown
//       const timer = setInterval(() => {
//         setCountdown((prevCountdown) => {
//           if (prevCountdown <= 1) {
//             clearInterval(timer);
//             setCanResend(true);
//             return 0;
//           }
//           return prevCountdown - 1;
//         });
//       }, 1000);
//     } catch (err) {
//       toast.error("Failed to send OTP. Please try again.");
//       setError(err.response?.data?.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const goBack = () => {
//     navigate("/login");
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   return (
//     <main>
//       <section className="login_module">
//         <div className="container-fluid">
//           <div
//             className={`row align-items-center vh-100 ${config.loginBgClass} ${config.alignContent}`}
//           >
//             <div
//               className={`${config.columnClass} vh-50 d-flex align-items-end`}
//             >
//               <div className={config.loginSecClass}>
//                 <img
//                   className="logo_img"
//                   style={config.logoStyle}
//                   src={config.logoUrl}
//                   alt="Rustomjee Logo"
//                 />

//                 <form
//                   className="mt-2 login-content-rust"
//                   onSubmit={handleOtpSubmit}
//                 >
//                   <h6 className={config.formTextColor}>Enter OTP</h6>
//                   <p className={`mt-4 ${config.formTextColor}`}>
//                     We've sent a 6-digit confirmation code on your email id.
//                     Make sure you enter the correct code.
//                   </p>

//                   <div className="form-group position-relative">
//                     <label
//                       className={`mb-1 mt-4 ${config.formTextColor}`}
//                       htmlFor="otpInput"
//                     >
//                       OTP
//                     </label>
//                     <input
//                       style={{ height: "40px" }}
//                       type="text"
//                       className="form-control mb-2"
//                       id="otpInput"
//                       placeholder="Enter 6 digit OTP..."
//                       value={otp}
//                       onChange={(e) => setOtp(e.target.value)}
//                       maxLength={6}
//                     />
//                   </div>

//                   {error && <p className="text-danger">{error}</p>}

//                   <div className="d-flex align-items-center justify-content-center mt-5">
//                     <button
//                       type="submit"
//                       className="btn-rust btn-danger-rustomjee mt-10 border-0"
//                       disabled={loading}
//                     >
//                       {loading ? "Verifying..." : "VERIFY OTP"}
//                     </button>
//                   </div>

//                   <div className="text-center mt-4">
//                     <p className="form-text-muted resend-timer mb-0">
//                       Resend code in{" "}
//                       <span className="resend-time">
//                         {formatTime(countdown)}
//                       </span>
//                     </p>
//                   </div>

//                   <div className="text-center mt-5">
//                     <p className="form-text-muted mb-0 go-back-wrapper">
//                       Entered wrong email id?
//                       <button
//                         type="button"
//                         onClick={goBack}
//                         className="back-login-link"
//                       >
//                         <span style={{ fontWeight: "bold", marginLeft: "5px" }}>GO BACK</span>
//                       </button>
//                     </p>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default LoginWithOtpRustomjee;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { Lokated_URL, Rustomji_URL, baseURL } from "../baseurl/apiDomain";

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
//  const isKalpataru = baseURL === "https://kalpataru.lockated.com/";
//   const isRustomjee = baseURL === "https://dev-panchshil-super-app.lockated.com/";
  
//   // Configuration based on the portal
//   const config = {
//     baseURL: baseURL,
//     logoUrl: isKalpataru ? Lokated_URL : Rustomji_URL,
//     loginBgClass: isKalpataru ? "login_bg_kalpataru" : "login_bg_rustomji",
//     loginSecClass: isKalpataru ? "login-sec-rustom" : "login-sec-rustom",
//     logoStyle: isKalpataru 
//     ? { width: "80%", height: 65, margin: "45px 0px 30px" } // Kalpataru logo style
//     : { width: "100%", height: 100, margin: "45px 0px 30px" }, // Rustomjee logo style
//     showRegisterButton: false,
//     formTextColor: "text-light",
//     alignContent: "justify-content-end",
//     columnClass: "col-lg-4 p-0 m-0 col-md-6"
//   };

 const isKalpataru = baseURL === "https://kalpataru.lockated.com/";
const isRustomjee = baseURL === "https://dev-panchshil-super-app.lockated.com/";

// Configuration based on the portal
const config = {
  baseURL: baseURL,
  logoUrl: Lokated_URL, // Always Lockated logo for both URLs
  loginBgClass: "login_bg_kalpataru" ,
  loginSecClass: "login-sec-rustom", // same for both
  logoStyle: { width: "80%", height: 65, margin: "45px 0px 30px" }, // Kalpataru/Lockated style for both
  showRegisterButton: false,
  formTextColor: "text-light",
  alignContent: "justify-content-end",
  columnClass: "col-lg-4 p-0 m-0 col-md-6"
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

  //   const handleOtpSubmit = async (e) => {
  //   e.preventDefault();
  //   toast.dismiss();
  //   setError("");

  //   if (!otp) {
  //     setError("Please enter a valid OTP.");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const response = await axios.get(
  //       `${config.baseURL}/get_otps/verify_otp`,
  //       {
  //         params: {
  //           mobile: mobile,
  //           otp: otp,
  //         },
  //       }
  //     );

  //     const { otp_valid, message, user, access_token } = response.data;

  //     if (otp_valid) {
  //       // Store all user data and tokens
  //       localStorage.setItem("access_token", access_token);
  //       localStorage.setItem("userData", JSON.stringify(user));
  //       sessionStorage.setItem("isLoggedIn", "true");

  //       // Store individual fields for easy access
  //       sessionStorage.setItem("email", user.email);
  //       sessionStorage.setItem("firstname", user.firstname);
  //       sessionStorage.setItem("lastname", user.lastname || "");
  //       sessionStorage.setItem("mobile", user.mobile);
  //       sessionStorage.setItem("userId", user.id);

  //       toast.success(message || "OTP verified successfully");

  //       // Navigate after a slight delay to ensure state is updated
  //       setTimeout(() => {
  //         navigate("/project-list", { replace: true });
  //       }, 100);
  //     } else {
  //       setError(message || "Invalid OTP. Please try again.");
  //       setOtp(""); // Clear OTP field on failure
  //     }
  //   } catch (err) {
  //     console.error("OTP Verification Error:", err);
  //     const errorMessage =
  //       err.response?.data?.message ||
  //       err.response?.data?.error?.message ||
  //       "An error occurred while verifying OTP. Please try again.";
  //     toast.error(errorMessage);
  //     setError(errorMessage);
  //     setOtp(""); // Clear OTP field on error
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
    const response = await axios.get(
      `${config.baseURL}/get_otps/verify_otp.json`,
      {
        params: {
          mobile: mobile,
          otp: trimmedOtp,
        },
      }
    );

    console.log("API Response:", response.data);

    const { verified, message, user, access_token, lock_role } = response.data;

    if (verified === true) {
      // Store authentication and user data in localStorage (matching SignInRustomjee pattern)
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("email", user.email);
      localStorage.setItem("firstname", user.firstname);
      localStorage.setItem("lastname", user.lastname || "");
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("profile_icon", user.profile_icon_url || "");
      
      // Store lock_role information for permissions (critical for sidebar)
      // The lock_role is at the root level of the response, not under user
      const roleData = lock_role || response.data.lock_role;
      if (roleData) {
        localStorage.setItem("lock_role_name", roleData.name);
        localStorage.setItem("lock_role_permissions", roleData.permissions_hash);
        console.log("Stored permissions:", roleData.permissions_hash);
      } else {
        console.warn("No lock_role data found in response");
      }
      
      // Also store in sessionStorage for backward compatibility
      localStorage.setItem("userData", JSON.stringify(user));
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("email", user.email);
      sessionStorage.setItem("firstname", user.firstname);
      sessionStorage.setItem("lastname", user.lastname || "");
      sessionStorage.setItem("mobile", user.mobile);
      sessionStorage.setItem("userId", user.id);

      toast.success(message || "OTP verified successfully");

      setTimeout(() => {
        navigate("/project-list", { replace: true });
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
    toast.dismiss();

    try {
      const response = await axios.get(
        `${config.baseURL}get_otps/generate_otp.json`,
        {
          params: {
            // client: "rustomjee",
            mobile: mobile,
          },
        }
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
                    We've sent a 6-digit confirmation code on your email id.
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
                      placeholder="Enter 6 digit OTP..."
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
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
                        <span className="resend-time">
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
                        <span style={{ fontWeight: "bold", marginLeft: "5px" }}>
                          GO BACK
                        </span>
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
