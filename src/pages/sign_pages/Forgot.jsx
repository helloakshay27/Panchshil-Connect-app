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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    navigate(
      `/forgot-otp?email=${encodeURIComponent(
        email
      )}&mobile=${encodeURIComponent(mobile)}`
    );
    try {
      const response = await axios.post(`${baseURL}generate_code`, {
        email,
        mobile,
      });

      if (response.data.success) {
        toast.success("OTP Sent successfully");
      } else {
        setError(response.data.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const regiterPage = () => {
    navigate("/login");
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
                  style={{ padding: "6% 10%" }}
                  id="forgetPasswordContainer"
                >
                  <img
                    className="logo_img mb-5"
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
                      Enter you registered email ID below and we'll send you the
                      OTP to reset your password.
                    </p>
                    <div className="form-group position-relative">
                      <label className="mb-1 text-white" htmlFor="forgetEmail">
                        Email ID
                      </label>
                      <input
                        type="text"
                        className="form-control-panchshil"
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
