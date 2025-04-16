import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { Rustomji_URL, baseURL } from "../baseurl/apiDomain";

const CreatePasswordRustomjee = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Rustomjee configuration - matching the login page style
  const config = {
    baseURL: "https://dev-panchshil-super-app.lockated.com/",
    logoUrl: Rustomji_URL,
    loginBgClass: "login_bg_rustomji",
    loginSecClass: "login-sec-rustom",
    logoStyle: { width: 335, height: 108, margin: "20px 0px 50px" },
    formTextColor: "text-light",
    alignContent: "justify-content-end",
    columnClass: "col-lg-4 p-0 m-0 col-md-6",
  };

  useEffect(() => {
    // Get email, mobile and token from URL parameters
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    const mobileParam = params.get("mobile");
    const tokenParam = params.get("token");

    if (emailParam) setEmail(emailParam);
    if (mobileParam) setMobile(mobileParam);
    if (tokenParam) setToken(tokenParam);
  }, [location.search]);

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    setPasswordRequirements(requirements);
    return Object.values(requirements).every((value) => value);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    validatePassword(password);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password does not meet all requirements");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${baseURL}reset_password`, {
        email,
        mobile,
        token,
        password: newPassword,
      });

      if (response.data.success) {
        toast.success("Password reset successfully");
        navigate("/login");
      } else {
        setError(
          response.data.message || "An error occurred while resetting password"
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during password reset"
      );
    } finally {
      setLoading(false);
    }
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
                  onSubmit={handleResetPassword}
                >
                  <h6 className={config.formTextColor}>Create New Password</h6>
                  <p className={`mt-4 ${config.formTextColor}`}>
                    Set a strong new password for your account.
                  </p>

                  <div className="form-group position-relative">
                    <label
                      className={`mb-1 mt-4 ${config.formTextColor}`}
                      htmlFor="newPasswordInput"
                    >
                      New Password
                    </label>
                    <input
                      style={{ height: "40px" }}
                      type="password"
                      className="form-control mb-2"
                      id="newPasswordInput"
                      placeholder="Enter new password..."
                      value={newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="mark-indicator-rust">
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

                  <div className="form-group position-relative">
                    <label
                      className={`mb-1 mt-3 ${config.formTextColor}`}
                      htmlFor="confirmPasswordInput"
                    >
                      Confirm New Password
                    </label>
                    <input
                      style={{ height: "40px" }}
                      type="password"
                      className="form-control mb-2"
                      id="confirmPasswordInput"
                      placeholder="Re-enter new password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-danger mt-3">{error}</p>}

                  <div className="d-flex align-items-center justify-content-center mt-5">
                    <button
                      type="submit"
                      className="btn-rust btn-danger-rustomjee mt-10 border-0"
                      disabled={loading}
                    >
                      {loading ? "PROCESSING..." : "RESET PASSWORD"}
                    </button>
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

export default CreatePasswordRustomjee;
