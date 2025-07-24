import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { Lokated_URL, Rustomji_URL, baseURL } from "../baseurl/apiDomain";

const CreatePasswordRustomjee = () => {
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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");
  const mobile = queryParams.get("mobile");

 const isKalpataru = baseURL === "https://kalpataru.lockated.com/";
  const isRustomjee = baseURL === "https://dev-panchshil-super-app.lockated.com/";
  
  // Configuration based on the portal
  const config = {
    baseURL: baseURL,
    logoUrl: isKalpataru ? Lokated_URL : Rustomji_URL,
    loginBgClass: isKalpataru ? "login_bg_kalpataru" : "login_bg_rustomji",
    loginSecClass: isKalpataru ? "login-sec-rustom" : "login-sec-rustom",
    logoStyle: isKalpataru 
    ? { width: "80%", height: 65, margin: "45px 0px 30px" } // Kalpataru logo style
    : { width: "100%", height: 100, margin: "45px 0px 30px" }, // Rustomjee logo style
    showRegisterButton: false,
    formTextColor: "text-light",
    alignContent: "justify-content-end",
    columnClass: "col-lg-4 p-0 m-0 col-md-6"
  };

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8 && password.length <= 32,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(Boolean);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password does not meet all requirements");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}users/forgot_password.json`,
        {
          user: {
            email_or_mobile: email || mobile,
            password: newPassword,
          },
        }
      );

      console.log("Password Reset Response:", response.data);

      const successMessage = response.data?.message || "";
      if (
        response.data?.access_token ||
        successMessage.toLowerCase().includes("success")
      ) {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else {
        setError(successMessage || "Password reset failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred during password reset. Please try again."
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
                  onSubmit={handlePasswordReset}
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
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div className="mark-indicator-rust">
                    {Object.entries(passwordRequirements).map(([key, met]) => (
                      <div className="requirement-item" key={key}>
                        <span className="bullet-point">•</span>
                        <p
                          className={`requirement-text ${
                            met ? "requirement-met" : ""
                          }`}
                        >
                          {key === "minLength" && "Minimum 8 characters"}
                          {key === "hasUppercase" &&
                            "At least one uppercase letter"}
                          {key === "hasNumber" && "At least one number"}
                          {key === "hasSpecial" &&
                            "At least one special character (!@#$%)"}
                        </p>
                      </div>
                    ))}
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
