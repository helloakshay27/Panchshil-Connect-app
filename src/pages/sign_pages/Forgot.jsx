import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";

const Forgot = () => {
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        navigate(`/forgot-otp?email=${encodeURIComponent(email)}&mobile=${encodeURIComponent(mobile)}`);
        try {
            const response = await axios.post("https://panchshil-super.lockated.com/generate_code", {
                email,
                mobile,
            });

            if (response.data.success) {
                toast.success("OTP Sent successfully")

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

    return (
        <div>
            <main>
                <section className="login_module">
                    <div className="container-fluid">
                        <div className="row align-items-center vh-100 login_bg justify-content-center">
                            <div className="col-lg-7 col-md-7 vh-100 d-flex align-items-center">
                                <div
                                    className="login-sec"
                                    style={{ padding: "10% 10%" }}
                                    id="forgetPasswordContainer"
                                >
                                    <form className="forget-password-content" id="forgetPasswordForm" onSubmit={handleSubmit}>
                                        <div className="paganation-sec d-flex">
                                            <div className="back-btn d-flex">
                                                <a href="" onClick={regiterPage}>
                                                    {" "}
                                                    &lt; <span> Back </span>
                                                </a>
                                            </div>
                                            <div className="paganation d-flex">
                                                <span> Step 1 of 3 </span>
                                                <p>Forgot Password</p>
                                            </div>
                                        </div>
                                        {/* Email field */}
                                        <h2>Forgot Password</h2>
                                        <p className="mt-3">
                                            Enter the email of your account and we will send the email to
                                            reset your password.
                                        </p>
                                        <div className="form-group position-relative">
                                            <label className="mb-1" htmlFor="forgetEmail">
                                                Email / Mobile No. / Username
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="forgetEmail"
                                                placeholder="Enter your Email / Mobile No. / Username"
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
                                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                                        {/* Submit button */}
                                        <button
                                            type="submit"
                                            className="btn mt-3 submit-forget-password btn-primary mt-2"
                                            disabled={loading}
                                        >
                                            {loading ? "Loading..." : "Next"}
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

export default Forgot;