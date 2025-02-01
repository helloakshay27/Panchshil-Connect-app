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

    try {
      const response = await axios.post(
        " https://panchshil-super.lockated.com/users",
        {
          email,
          firstname,
          lastname,
          mobile,
        }
      );

      console.log(response.data.access_token);

      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        sessionStorage.setItem("email", response.data.email);
        sessionStorage.setItem("firstname", response.data.firstname);

        // Redirect to the home page
        navigate("/");
        toast.success("Register successfully");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
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
                    style={{ width: "260px" }}
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
