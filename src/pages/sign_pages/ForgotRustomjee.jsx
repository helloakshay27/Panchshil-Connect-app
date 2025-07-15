import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import toast from "react-hot-toast";
import { Rustomji_URL, baseURL } from "../baseurl/apiDomain";

const ForgotRustomjee = () => {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Rustomjee configuration - matching the login page style
  const config = {
    baseURL: "https://dev-panchshil-super-app.lockated.com/",
    logoUrl: Rustomji_URL,
    loginBgClass: "login_bg_rustomji",
    loginSecClass: "login-sec-rustom",
    logoStyle: { width: 335, height: 108, margin: "20px 0px 30px" },
    formTextColor: "text-light",
    alignContent: "justify-content-end",
    columnClass: "col-lg-4 p-0 m-0 col-md-6",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Navigate immediately — seamless UX

    // Let OTP call run in the background

    //  try {
    //   const response = await axios.post(`${baseURL}generate_code`, {
    //     email,
    //     mobile,
    //   });

    try {
      const response = await axios.get(
        `${config.baseURL}get_otps/generate_otp.json`,
        {
          params: {
            client: "rustomjee",
            email: email,
          },
        }
      );

      if (response.data.message) {
        toast.success("OTP Sent successfully");

        navigate(
          `/forgot-otp?email=${encodeURIComponent(
            email
          )}&mobile=${encodeURIComponent(mobile)}`
        );
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const goToLoginPage = () => {
    navigate("/login");
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
                  alt="Logo"
                />

                <form
                  className="mt-2 login-content-rust"
                  onSubmit={handleSubmit}
                >
                  <h6 className={config.formTextColor}>Forgot Password</h6>
                  <p className={`mt-4 ${config.formTextColor}`}>
                    Enter your registered emai ID below and we'll send you an
                    OTP to reset your password.
                  </p>

                  <div className="form-group position-relative">
                    <label
                      className={`mb-1 mt-4 ${config.formTextColor}`}
                      htmlFor="forgetEmail"
                    >
                      Email ID
                    </label>
                    <input
                      style={{ height: "40px" }}
                      type="text"
                      className="form-control"
                      id="forgetEmail"
                      placeholder="Enter your registerd email id..."
                      value={email || mobile || username}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEmail(value);
                        setMobile(value);
                        setUsername(value);
                      }}
                    />
                  </div>

                  {error && <p className="text-danger">{error}</p>}

                  <div className="d-flex align-items-center justify-content-center mt-5">
                    <button
                      type="submit"
                      className="btn-rust btn-danger-rustomjee mt-10 border-0"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "NEXT"}
                    </button>
                  </div>

                  <div className="text-center mt-5">
                    <button
                      type="button"
                      onClick={goToLoginPage}
                      className="back-login-link"
                    >
                      Back to <span style={{ fontWeight: "bold" }}>LOGIN</span>
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

export default ForgotRustomjee;
