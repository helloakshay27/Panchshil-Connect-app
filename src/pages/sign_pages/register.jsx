import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./login.css";
import { baseURL } from "../baseurl/apiDomain";

const Register = () => {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) return;
    setMobile(value);
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

    // Phone number validation (Indian format: 10 digits, starts with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${baseURL}users`, {
        email,
        firstname,
        lastname,
        mobile,
      });

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        sessionStorage.setItem("email", response.data.email);
        sessionStorage.setItem("firstname", response.data.firstname);

        // Redirect to the home page
        navigate("/login");
        toast.success("Registered successfully");
      } else {
        setError("User already exists");
        toast.error("User already exists");
      }
    } catch (err) {
      setError("User already exists");
      toast.error("User already exists");
    } finally {
      setLoading(false);
    }
  };

  const regiterPage = () => {
    navigate("/login");
  };

  const goToLoginPage = () => {
    window.location.href = "/login"; // or your actual login URL
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
                  // style={{ padding: "6% 10%" }}
                  id="forgetPasswordContainer"
                >
                  <img
                    className="logo_img"
                    style={{ width: 100, height: 100, margin: "auto" }}
                    src="https://panchshil.gophygital.work/uploads/pms/company_setup/logo/226/Panchshil_logo.png"
                    alt="Logo"
                  />

                  <form
                    onSubmit={handlePasswordLogin}
                    className="mt-2 login-content "
                    style={{ width: "100%" }}
                  >
                    <div className="form-group position-relative">
                      <label className="mb-1 text-white" htmlFor="email">
                        Full Name
                      </label>
                      <div className="panchshil-password-input">
                      <input
                        type="text"
                        id="email"
                        className="panchshil-password-field"
                        placeholder="Enter fullname here..."
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                      />
                    </div>
                    </div>
                    {/* <div className="form-group position-relative">
                      <label className="mb-1" htmlFor="password">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="password"
                        className="form-control"
                        placeholder="Enter lastname"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                      />
                    </div> */}
                    <div className="form-group position-relative">
                      <label className="mb-1 text-white" htmlFor="Email">
                        Email ID
                      </label>
                       <div className="panchshil-password-input">
                      <input
                        type="Email"
                        id="password"
                        className="panchshil-password-field"
                        placeholder="Enter email id here..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    </div>
                    <div className="form-group position-relative">
                      <label className="mb-1 text-white" htmlFor="mobile">
                        Mobile Number
                        {/* <span style={{ color: "#de7008" }}> *</span> */}
                      </label>
                      <div className="panchshil-password-input">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        className="panchshil-password-field"
                        placeholder="Enter mobile number here..."
                        id="mobile"
                        name="mobile"
                        value={mobile}
                        maxLength={10}
                        onChange={handleMobileChange}
                        required
                        style={{ appearance: "textfield" }}
                      />
                    </div>
                    </div>

                    {error && <p className="text-danger">{error}</p>}
                    <button
                      type="submit"
                      className="btn-panchshil btn-danger mt-4"
                    >
                      {loading ? "Register in..." : "Register"}
                    </button>
                    <div
                      className="mt-4"
                      style={{
                        textAlign: "center",
                        marginTop: "1rem",
                        color: "white",
                      }}
                    >
                      Already have an account?{" "}
                      <span
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                        onClick={goToLoginPage}
                      >
                        LOGIN
                      </span>
                    </div>
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

export default Register;
