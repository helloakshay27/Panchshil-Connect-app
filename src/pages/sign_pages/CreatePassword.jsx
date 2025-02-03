import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./login.css";

const CreatePassword = () => {
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();



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
            const response = await axios.post(" https://panchshil-super.lockated.com/users", {

                email,
                firstname,
                lastname,
                mobile,
            });

            console.log(response.data.access_token);

            if (response.data.access_token) {
                localStorage.setItem("access_token", response.data.access_token);
                sessionStorage.setItem("email", response.data.email);
                sessionStorage.setItem("firstname", response.data.firstname);

                // Redirect to the home page
                navigate("/");
                toast.success("Register successfully")

            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("An error occurred during login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const regiterPage = () => {

        navigate("/login")
    };



    return (
        <div>
            <main>
                <section className="login_module">
                    <div className="container-fluid">
                        <div className="row align-items-center vh-100 login_bg justify-content-center">
                            <div className="col-lg-7 col-md-7 vh-50 d-flex align-items-center">
                                <div className="login-sec" id="forgetPasswordContainer">
                                    <form className="create-new-password-content" id="createPasswordForm">
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
                                        {/* Submit button */}
                                        <button
                                            type="submit"
                                            className="btn mt-4 submit-create-password btn-primary mt-2"
                                        >
                                            Reset Password
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
