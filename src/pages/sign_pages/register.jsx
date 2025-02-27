import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./login.css";

const Register = () => {
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

    // Phone number validation (Indian format: 10 digits, starts with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("https://panchshil-super.lockated.com/users", {
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
        navigate("/");
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

    navigate("/login")
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

                  <form
                    onSubmit={handlePasswordLogin}
                    className="mt-2 login-content"
                    style={{ width: "295px" }}
                  >
                    <div className="form-group position-relative">
                      <label className="mb-1" htmlFor="email">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="email"
                        className="form-control mb-2"
                        placeholder="Enter firstname"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group position-relative">
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
                    </div>
                    <div className="form-group position-relative">
                      <label className="mb-1" htmlFor="Email">
                        Email
                      </label>
                      <input
                        type="Email"
                        id="password"
                        className="form-control"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group position-relative">
                      <label className="mb-1" htmlFor="email">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        id="email"
                        className="form-control mb-2"
                        placeholder="Enter mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </div>

                    {error && <p className="text-danger">{error}</p>}
                    <button type="submit" className="btn btn-danger mt-2">
                      {loading ? "Register in..." : "Register"}
                    </button>
                    <button className="btn purple-btn2 mt-3 " onClick={regiterPage} style={{ width: "100%", background: "white", color: "black" }}>
                      {loading ? "Sign..." : "Sign"}
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

export default Register;
