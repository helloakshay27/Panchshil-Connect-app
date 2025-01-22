import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import './login.css';

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset error state
        setLoading(true); // Start loading state
        navigate("/");

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError("Please enter a valid email address.");
          setLoading(false);
          return;
        }
    
        try {
          // Example POST request for login
          const response = await axios.post(
            "https://staging.lockated.com/api/users/sign_in", // Replace with your login API endpoint
            {
              user: {
                email,
                password,
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.data.code === 401) {
            setError("Email or Password not valid.");
          }
          // Handling response and storing session details
          if (response.data.access_token) {
            localStorage.setItem("access_token", response.data.spree_api_key);
    
            sessionStorage.setItem("email", response.data.email);
            sessionStorage.setItem("firstname", response.data.firstname);
    
            // Redirect user to the members page after successful login
    
           
          } else {
            setError("Login failed. Please check your credentials.");
          }
        } catch (err) {
          console.error("Error during login:", err);
          setError("Login failed. Please try again.");
        } finally {
          setLoading(false); // End loading state
        }
      };

    return (
        <div>
            <main>
                <section className="login_module">
                    <div className="container-fluid">
                        <div className="row align-items-center vh-100 login_bg justify-content-center">
                            <div className="col-lg-7 col-md-7 vh-50 d-flex align-items-center">
                                <div className="login-sec" id="loginForm">
                                    <img
                                        className="logo_img"
                                        style={{ width: 100, height: 100, margin: "auto" }}
                                        src="https://panchshil.gophygital.work/uploads/pms/company_setup/logo/226/Panchshil_logo.png"
                                    />
                                    {/* Welcome message */}
                                    {/* Login Form */}
                                    <form onSubmit={handleSubmit}
                                        className="mt-3 login-content"
                                        id="password_form"
                                        // action="/users/sign_in"
                                        acceptCharset="UTF-8"
                                        method="post"
                                    >
                                        <input
                                            type="hidden"
                                            name="authenticity_token"
                                            defaultValue="f-LaSgdlhrNVfU2d_fJbRIzpAZ8hA9FGCqirMaQJKl-CTe3ADiwvEdg8MIf7BycEcmFPoetKWzKnHSzcDkUhxw"
                                            autoComplete="off"
                                        />
                                        <div className="login-content">
                                            <div className="d-flex gap-3 mb-2 align-items-center">
                                                <div className="form-group">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="contentSelector"
                                                            defaultValue="content1"
                                                            defaultChecked=""
                                                            onclick="toggleContent('content1')"
                                                        />
                                                        <label className="form-check-label">
                                                            Login With Password
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="contentSelector"
                                                            defaultValue="content2"
                                                            onclick="toggleContent('content2')"
                                                        />
                                                        <label className="form-check-label">Login With OTP</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                id="content1"
                                                className="contentpo"
                                                style={{ display: "block" }}
                                            >
                                                <div className="form-group position-relative">
                                                    <label className="mb-1" htmlFor="email">
                                                        Email
                                                    </label>
                                                    <input
                                                        placeholder="Enter email"
                                                        autofocus="autofocus"
                                                        autoComplete="email"
                                                        className="form-control mb-2"
                                                        required="required"
                                                        type="email"
                                                        defaultValue=""
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}                                                        id="user_email"
                                                    />
                                                </div>
                                                <div className="form-group position-relative">
                                                    <label className="mb-1" htmlFor="password">
                                                        Password
                                                    </label>
                                                    <input
                                                        placeholder="Your password"
                                                        autoComplete="current-password"
                                                        className="form-control password"
                                                        required="required"
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}                                                        id="user_password"
                                                    />
                                                    <span
                                                        className="password-toggle"
                                                        onclick="togglePasswordVisibility()"
                                                    >
                                                        <i className="fas fa-eye" />
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-start mt-2 mb-3 gap-2">
                                                    <a className="forget-btn" href="/users/password/new">
                                                        Forgot password?
                                                    </a>
                                                    <br />
                                                </div>
                                                <button
                                                    type="submit"
                                                    id="submitlogin"
                                                    className="btn submit-login btn-danger mt-2 "
                                                    style={{ backgroundColor: "#de7008!important" }}
                                                >
                                                    Login
                                                </button>
                                            </div>
                                        </div>
                                    </form>{" "}
                                    {/* OTP-based login form */}
                                    <div id="flash-messages" style={{ display: "none" }} />
                                    <form
                                        className="mt-3 login-content"
                                        id="otp_form"
                                        style={{ display: "none" }}
                                        // action="/send_otp"
                                        acceptCharset="UTF-8"
                                        method="post"
                                    >
                                        <input
                                            type="hidden"
                                            name="authenticity_token"
                                            defaultValue="5Gyo2LnAvMzpcEWGq4gaqdJlp7tCLD3xw5hHp7pnLsDTDfPrtjTr77wUlkkKbmShrfGemC8xvAsZGxOn0FKScQ"
                                            autoComplete="off"
                                        />
                                        <div className="login-content">
                                            <div className="form-group position-relative">
                                                <label className="mb-1" htmlFor="mobile_number">
                                                    Mobile No.
                                                </label>
                                                <input
                                                    placeholder="Enter Mobile Number"
                                                    className="form-control mb-2"
                                                    required="required"
                                                    id="mobile_number"
                                                    type="number"
                                                    name="user[mobile]"
                                                />
                                                <button
                                                    type="button"
                                                    className="mt-2 btn btn-primary"
                                                    id="send_otp_button"
                                                    onclick="sendOtp()"
                                                    style={{ backgroundColor: "#de7008!important" }}
                                                >
                                                    Send OTP
                                                </button>
                                            </div>
                                            <div
                                                className="form-group position-relative"
                                                id="otp_section"
                                                style={{ display: "none" }}
                                            >
                                                <label className="mb-1" htmlFor="otp">
                                                    Enter OTP
                                                </label>
                                                <input
                                                    placeholder="Enter OTP"
                                                    className="form-control mb-2"
                                                    id="otp_field"
                                                    type="text"
                                                    name="user[otp]"
                                                />
                                                <input
                                                    defaultValue="QxbuISl_XtmNt1NqqZX1xSwWGyfgOwkXIubyzo3m1MdYLN7zBPl4Zepv6U74YCfzlN-abWGILz2RleSkecDPDg"
                                                    autoComplete="off"
                                                    type="hidden"
                                                    name="user[authenticity_token]"
                                                    id="user_authenticity_token"
                                                />
                                                <input
                                                    type="submit"
                                                    name="commit"
                                                    defaultValue="Verify OTP"
                                                    className="btn btn-primary mt-2"
                                                    id="verify_otp_button"
                                                    style={{ backgroundColor: "#de7008!important" }}
                                                    data-disable-with="Verify OTP"
                                                />
                                            </div>
                                        </div>
                                    </form>{" "}
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