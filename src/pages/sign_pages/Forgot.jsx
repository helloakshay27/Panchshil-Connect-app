import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { baseURL } from "../baseurl/apiDomain";
import { LOGO_URL } from "../baseurl/apiDomain";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const config = {
    // baseURL: "https://panchshil-super.lockated.com/",
    // baseURL: "http://localhost:3000/",

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation - ensure email or mobile is provided
    const inputValue = email || mobile || username;
    if (!inputValue || !inputValue.trim()) {
      setError("Please enter your email ID");
      setLoading(false);
      return;
    }

    try {
      // Using GET request like Rustomjee
      const response = await axios.get(
        `${config.baseURL}get_otps/generate_otp.json`,
        {
          params: {
            
            email,
            // mobile, // Send the same value for both email and mobile
          },
        }
      );

      console.log("Generate OTP Response:", response.data);

      if (response.data.message) {
        toast.success("OTP sent successfully");
        
        // Navigate to OTP page with both email and mobile parameters
        navigate(
          `/forgot-otp?email=${encodeURIComponent(
            inputValue
          )}&mobile=${encodeURIComponent(inputValue)}`
        );
      } else {
        setError(response.data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Generate OTP Error:", err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        "An error occurred while sending OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToLoginPage = () => {
    navigate("/login");
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
                  // style={{ padding: "6% 10%" }}
                  id="forgetPasswordContainer"
                >
                  <img
                    className="logo_img"
                    style={config.logoStyle}
                    src={config.logoUrl}
                    alt="Logo"
                  />
                  <form
                    className="forget-password-content"
                    id="forgetPasswordForm"
                    onSubmit={handleSubmit}
                  >
                    <div className="paganation-sec d-flex">
                      {/* <div className="back-btn d-flex">
                                                <a href="" onClick={regiterPage}>
                                                    {" "}
                                                    &lt; <span> Back </span>
                                                </a>
                                            </div> */}
                      {/* <div className="paganation d-flex">
                                                <span> Step 1 of 3 </span>
                                                <p>Forgot Password</p>
                                            </div> */}
                    </div>
                    {/* Email field */}
                    <h5 className="text-white">Forgot Password?</h5>
                    <p className="mt-3 mb-3 text-white">
                      Enter your registered email ID below and we&apos;ll send you the
                      OTP to reset your password.
                    </p>
                    <div className="form-group position-relative">
                      <label className="mb-1 text-white" htmlFor="forgetEmail">
                        Email ID
                      </label>
                      <div className="panchshil-password-input">
                      <input
                        type="text"
                        className="panchshil-password-field"
                        id="forgetEmail"
                        placeholder="Enter your registered email id..."
                        value={email || mobile || username}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEmail(value);
                          setMobile(value);
                          setUsername(value);
                        }}
                      />
                    </div>
                    </div>
                    {/* Error message */}
                    {error && (
                      <div className="alert alert-danger mt-3">{error}</div>
                    )}
                    {/* Submit button */}
                    <button
                      type="submit"
                      className="btn-panchshil btn-danger mt-5"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "NEXT"}
                    </button>
                  </form>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={goToLoginPage}
                      className="back-login-link"
                    >
                      Back to <span style={{ fontWeight: "bold" }}>LOGIN</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Forgot;
