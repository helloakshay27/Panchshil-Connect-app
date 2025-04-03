import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./login.css";
import toast from "react-hot-toast";
import { baseURL, LOGO_URL } from "../baseurl/apiDomain";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedContent, setSelectedContent] = useState("content1");
    const [showOtpSection, setShowOtpSection] = useState(false); // State to control OTP section visibility

    const [OtpSection, setOtpSection] = useState(true); // State to control OTP section visibility

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
            const response = await axios.post(`${baseURL}users/signin.json`, {
                user: {
                    email,
                    password,
                },
            });

            console.log(response.data.access_token);

            if (response.data.access_token) {
                localStorage.setItem("access_token", response.data.access_token);
                sessionStorage.setItem("email", response.data.email);
                sessionStorage.setItem("firstname", response.data.firstname);

                // Redirect to the home page
                navigate("/project-list");
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            toast.error("Login failed. Please check your credentials.");

            setError("An error occurred during login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!mobile || !/^\d{10}$/.test(mobile)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${baseURL}generate_code`,
                {
                    mobile
                }
            );
            console.log("OTP sent successfully:", response.data);
            setOtpSection(false);
            toast.success("OTP Sent successfully")


            setShowOtpSection(true);

        } catch (err) {
            toast.error("Failed to send OTP. Please try again.")

            console.error(err);
            // setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            setError("Please enter a valid  OTP.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${baseURL}verify_code.json`,
                {
                    // email,
                    mobile,
                     otp
                }
            );

            const { access_token, email, firstname } = response.data;
            console.log("OTP verified successfully:", response.data);

            if (access_token) {
                localStorage.setItem("access_token", access_token);
                sessionStorage.setItem("email", email);
                sessionStorage.setItem("firstname", firstname);

                navigate("/");
                toast.success("Login successfully")

            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "An error occurred during login. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const regiterPage = () => {

        navigate("/register")
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
                                        src={LOGO_URL}
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
                                                <label className="form-check-label">Login With Password
                                                </label>
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
                                                <label className="form-check-label">Login With OTP
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedContent === "content1" && (
                                        <div  className="mt-2 login-content">
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
                                                <a className="forget-btn" href="/forgot-password">
                                                    Forgot password?

                                                </a>
                                                <br />
                                            </div>
                                          

                                            {error && <p className="text-danger">{error}</p>}
                                            <button onClick={handlePasswordLogin} type="submit" className="btn btn-danger mt-2">
                                                {loading ? "Logging in..." : "Login"}
                                            </button>
                                            <button className="btn purple-btn2 mt-3 " onClick={regiterPage} style={{ width: "100%" ,background:"white" , color:"black"}}> 
                                                {loading ? "Register in..." : "Register"}
                                            </button>
                                        


                                        </div>
                                    )}

                                    {selectedContent === "content2" && (
                                        <form onSubmit={handleVerifyOtp} className="mt-3 login-content">
                                            {

                                                OtpSection && (
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

                                                )
                                            }

                                            {showOtpSection && (
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
                                            )}

                                            {/* Error Message */}
                                            {error && <p className="text-danger">{error}</p>}

                                            {/* Verify OTP Button (Conditionally Rendered) */}
                                            {showOtpSection && (
                                                <button type="submit" className="btn btn-danger mt-2">
                                                    Verify OTP
                                                </button>


                                            )}
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
