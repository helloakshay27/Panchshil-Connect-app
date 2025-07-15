import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";
import { baseURL } from "../baseurl/apiDomain";
import { LOGO_URL } from "../baseurl/apiDomain";

const CreatePassword = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email"); // Get email from URL
  const mobile = queryParams.get("mobile"); // Get mobile from URL
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const navigate = useNavigate();

  const config = {
    // baseURL: "https://panchshil-super.lockated.com/",
    // baseURL: "http://localhost:3000/",

    baseURL: "https://api-connect.panchshil.com/",
    logoUrl: LOGO_URL,
    loginBgClass: "login_bg",
    loginSecClass: "login-sec",
    logoStyle: { width: 100, height: 100, margin: "auto" },
    showRegisterButton: true,
    formTextColor: "",
    alignContent: "justify-content-center",
    columnClass: "col-lg-7 col-md-7",
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state
    setLoading(true);

    // Password validation
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 32) {
      setError("Password must be between 8 to 32 characters.");
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number.");
      setLoading(false);
      return;
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      setError("Password must contain at least one special character.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}users/forgot_password.json`,
        {
          user: {
            email_or_mobile: email,
            password: newPassword,
          },
        }
      );
      navigate("/");

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        sessionStorage.setItem("email", response.data.email);
        sessionStorage.setItem("firstname", response.data.firstname);

        // Redirect to the home page
        navigate("/password-success");
        toast.success("Password reset successfully!");
      } else {
        setError("Password reset failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during password reset. Please try again.");
    } finally {
      setLoading(false);
    }
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
                    className="otp-content"
                    id="createPasswordForm"
                    onSubmit={handlePasswordReset}
                  >
                    <div className="paganation-sec d-flex">
                      {/* <div className="back-btn d-flex">
                                                <a href="">
                                                    {" "}
                                                    &lt; <span> Back </span>
                                                </a>
                                            </div> */}
                      {/* <div className="paganation d-flex">
                                                <span> Step 3 of 3 </span>
                                                <p>Forgot Password</p>
                                            </div> */}
                    </div>
                    <h6 className="text-white">Create New Password</h6>
                    <p className="mt-3 mb-3 text-white">
                      Set a strong passwprd for your account
                    </p>
                    {/* New password field */}
                    <div className="form-group position-relative">
                      <label className="mb-1 text-white" htmlFor="newPassword">
                        New Password
                      </label>
                       <div className="panchshil-password-input">
                      <input
                        type="password"
                        className="panchshil-password-field"
                        id="newPassword"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    </div>
                    <div className="mark-indicator-rust mb-2">
                      <div className="requirement-item">
                        <span className="bullet-point">•</span>
                        <p
                          className={`requirement-text ${
                            passwordRequirements.minLength
                              ? "requirement-met"
                              : ""
                          }`}
                        >
                          Minimum 8 characters
                        </p>
                      </div>
                      <div className="requirement-item">
                        <span className="bullet-point">•</span>
                        <p
                          className={`requirement-text ${
                            passwordRequirements.hasUppercase
                              ? "requirement-met"
                              : ""
                          }`}
                        >
                          At least one uppercase letter
                        </p>
                      </div>
                      <div className="requirement-item">
                        <span className="bullet-point">•</span>
                        <p
                          className={`requirement-text ${
                            passwordRequirements.hasNumber
                              ? "requirement-met"
                              : ""
                          }`}
                        >
                          At least one number
                        </p>
                      </div>
                      <div className="requirement-item">
                        <span className="bullet-point">•</span>
                        <p
                          className={`requirement-text ${
                            passwordRequirements.hasSpecial
                              ? "requirement-met"
                              : ""
                          }`}
                        >
                          At least one special character (!@#$%)
                        </p>
                      </div>
                    </div>
                    {/* Confirm password field */}
                    <div className="form-group position-relative">
                      <label
                        className="mb-1 text-white"
                        htmlFor="confirmPassword"
                      >
                        Confirm Password
                      </label>
                       <div className="panchshil-password-input">
                      <input
                        type="password"
                        className="panchshil-password-field"
                        id="confirmPassword"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    </div>

                    {/* Error message */}
                    {error && <div className="alert alert-danger">{error}</div>}
                    {/* Submit button */}
                    <button
                      type="submit"
                      className="btn-panchshil btn-danger mt-3"
                      disabled={loading}
                    >
                      {loading ? "Resetting Password..." : "Reset Password"}
                    </button>
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

export default CreatePassword;
