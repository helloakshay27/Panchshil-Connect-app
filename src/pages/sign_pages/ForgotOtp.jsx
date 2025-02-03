import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

const ForgotOtp = () => {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("username@gmail.com"); // Example email placeholder
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // OTP validation (assuming 6-digit OTP)
        if (!/^[0-9]{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post("https://panchshil-super.lockated.com/verify-otp", {
                email,
                otp,
            });

            if (response.data.success) {
                navigate("/reset-password");
            } else {
                setError("Invalid OTP. Please try again.");
            }
        } catch (err) {
            setError("An error occurred while verifying OTP. Please try again.");
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
                                    <form className="otp-content" id="otpForm" onSubmit={handleOtpSubmit}>
                                        <div className="paganation-sec d-flex">
                                            <div className="back-btn d-flex">
                                                <a href="/forgot-password">&lt; <span> Back </span></a>
                                            </div>
                                            <div className="paganation d-flex">
                                                <span> Step 2 of 3 </span>
                                                <p>Forgot Password</p>
                                            </div>
                                        </div>
                                        <h2>Check your Mail Or <br /> Mobile No.</h2>
                                        <p className="mt-3">
                                            We've sent a 6-digit confirmation code to <span>{email}</span>. <br />
                                            Make sure you enter the correct code.
                                        </p>
                                        {/* OTP field */}
                                        <div className="form-group position-relative">
                                            <label className="mb-1" htmlFor="otp">Enter OTP</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="otp"
                                                placeholder="Enter the OTP you received"
                                                value={otp}
                                                onChange={handleOtpChange}
                                                maxLength={6}
                                            />
                                        </div>
                                        {error && <p className="text-danger">{error}</p>}
                                        {/* Submit button */}
                                        <button type="submit" className="btn submit-otp btn-success mt-2" disabled={loading}>
                                            {loading ? "Verifying..." : "Next"}
                                        </button>
                                        <p className="another-way">
                                            Didn’t receive any email? Check spam or <br />
                                            <a href="/resend-otp">Try another email address</a>
                                        </p>
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

export default ForgotOtp;
