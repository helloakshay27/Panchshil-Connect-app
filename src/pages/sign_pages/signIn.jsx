import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./login.css";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedContent, setSelectedContent] = useState("content1");

    const navigate = useNavigate();

    const toggleContent = (content) => {
        setSelectedContent(content);
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError(""); // Reset error state
        setLoading(true);

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post("https://staging.lockated.com/api/users/sign_in", {
                user: {
                    email,
                    password,
                },
            });

            if (response.data.access_token) {
                localStorage.setItem("access_token", response.data.spree_api_key);
                sessionStorage.setItem("email", response.data.email);
                sessionStorage.setItem("firstname", response.data.firstname);

                // Redirect to the home page
                navigate("/");
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("An error occurred during login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = () => {
        // Simulate sending OTP
        if (!mobile) {
            setError("Please enter your mobile number.");
            return;
        }
        setError("");
        alert("OTP sent successfully to your mobile number.");
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (!otp) {
            setError("Please enter the OTP.");
            return;
        }
        setError("");
        alert("OTP verified successfully!");
        navigate("/"); // Navigate to another page after OTP verification
    };

    return (
        <div>
            <main>
                <section className="login_module">
                    <div className="container-fluid">
                        <div className="row align-items-center vh-100 login_bg justify-content-center">
                            <div className="col-lg-7 col-md-7 vh-50 d-flex align-items-center">
                                <div className="login-sec">
                                    <img
                                        className="logo_img"
                                        style={{ width: 100, height: 100, margin: "auto" }}
                                        src="https://panchshil.gophygital.work/uploads/pms/company_setup/logo/226/Panchshil_logo.png"
                                        alt="Logo"
                                    />
                                    <div className="d-flex mt-2 gap-3 align-items-center">
                                        <div className="form-group">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="contentSelector"
                                                    value="content1"
                                                    checked={selectedContent === "content1"}
                                                    onChange={() => toggleContent("content1")}
                                                />
                                                <label className="form-check-label">Existing User</label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="contentSelector"
                                                    value="content2"
                                                    checked={selectedContent === "content2"}
                                                    onChange={() => toggleContent("content2")}
                                                />
                                                <label className="form-check-label">Login With New User</label>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedContent === "content1" && (
                                        <form onSubmit={handlePasswordLogin} className="mt-2 login-content">
                                            <div className="form-group position-relative">
                                                <label className="mb-1" htmlFor="email">Email</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    className="form-control mb-2"
                                                    placeholder="Enter email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group position-relative">
                                                <label className="mb-1" htmlFor="password">Password</label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    className="form-control"
                                                    placeholder="Enter password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="d-flex justify-content-start mt-2 mb-3 gap-2">
                                                <a className="forget-btn" href="/users/password/new">
                                                    Forgot password?
                                                </a>
                                                <br />
                                            </div>
                                            {error && <p className="text-danger">{error}</p>}
                                            <button type="submit" className="btn btn-danger mt-2">
                                                {loading ? "Logging in..." : "Login"}
                                            </button>
                                        </form>
                                    )}

                                    {selectedContent === "content2" && (
                                        <form onSubmit={handleVerifyOtp} className="mt-3 login-content">
                                            <div className="form-group position-relative">
                                                <label className="mb-1" htmlFor="mobile">Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    id="mobile"
                                                    className="form-control mb-2"
                                                    placeholder="Enter mobile number"
                                                    value={mobile}
                                                    onChange={(e) => setMobile(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-danger mt-2"
                                                    onClick={handleSendOtp}
                                                >
                                                    Send OTP
                                                </button>
                                            </div>
                                            <div className="form-group position-relative">
                                                <label className="mb-1" htmlFor="otp">Enter OTP</label>
                                                <input
                                                    type="text"
                                                    id="otp"
                                                    className="form-control mb-2"
                                                    placeholder="Enter OTP"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {error && <p className="text-danger">{error}</p>}
                                            <button type="submit" className="btn btn-danger mt-2">
                                                Verify OTP
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SignIn;
