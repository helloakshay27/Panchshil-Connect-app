import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./login.css";

const CreatePassword = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email"); // Get email from URL
    const mobile = queryParams.get("mobile"); // Get mobile from URL
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

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
            const response = await axios.post(`https://panchshil-super.lockated.com/users/forgot_password.json`, {
                user: {
                    email_or_mobile: email,
                    password: newPassword,
                },
            });
            navigate("/");

            if (response.data.access_token) {
                localStorage.setItem("access_token", response.data.access_token);
                sessionStorage.setItem("email", response.data.email);
                sessionStorage.setItem("firstname", response.data.firstname);

                // Redirect to the home page
                navigate("/");
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
                            <div className="col-lg-7 col-md-7 vh-50 d-flex align-items-center">
                                <div className="login-sec" id="forgetPasswordContainer">
                                    <form className="create-new-password-content" id="createPasswordForm" onSubmit={handlePasswordReset}>
                                        <div className="paganation-sec d-flex">
                                            <div className="back-btn d-flex">
                                                <a href="">
                                                    {" "}
                                                    &lt; <span> Back </span>
                                                </a>
                                            </div>
                                            <div className="paganation d-flex">
                                                <span> Step 3 of 3 </span>
                                                <p>Forgot Password</p>
                                            </div>
                                        </div>
                                        <h2>Create New Password</h2>
                                        <p className="mt-3">Enter the new password for your account.</p>
                                        {/* New password field */}
                                        <div className="form-group position-relative">
                                            <label className="mb-1" htmlFor="newPassword">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="newPassword"
                                                placeholder="Enter your new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {/* Confirm password field */}
                                        <div className="form-group position-relative">
                                            <label className="mb-1" htmlFor="confirmPassword">
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                placeholder="Confirm your new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="mark-indicator">
                                            <div className="pass-len">
                                                <span>
                                                    <i
                                                        className="fa-solid fa-check"
                                                        style={{ color: "#bdbdbd" }}
                                                    />
                                                </span>
                                                <p>Password must be between 8 to 32 character.</p>
                                            </div>
                                            <div className="pass-upp">
                                                <span>
                                                    <i
                                                        className="fa-solid fa-check"
                                                        style={{ color: "#bdbdbd" }}
                                                    />
                                                </span>
                                                <p>Must contain a uppercase character.</p>
                                            </div>
                                            <div className="pass-num">
                                                <span>
                                                    <i
                                                        className="fa-solid fa-check"
                                                        style={{ color: "#bdbdbd" }}
                                                    />
                                                </span>
                                                <p>Must contain a number.</p>
                                            </div>
                                            <div className="pass-char">
                                                <span>
                                                    <i
                                                        className="fa-solid fa-check"
                                                        style={{ color: "#bdbdbd" }}
                                                    />
                                                </span>
                                                <p>Must contain one special character.</p>
                                            </div>
                                        </div>
                                        {/* Error message */}
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {/* Submit button */}
                                        <button
                                            type="submit"
                                            className="btn mt-4 submit-create-password btn-primary mt-2"
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