import React from "react";
import { useNavigate } from "react-router-dom";
import { LOGO_URL } from "../baseurl/apiDomain";
import { CheckCircle } from "lucide-react";
import "./login.css";

const PasswordResetSuccess = () => {
  const navigate = useNavigate();

  // Panchshil configuration (similar to the one in SignIn component)
  const config = {
    baseURL: "https://api-connect.panchshil.com/",
    // baseURL: "https://connect.panchshil.com/",
    logoUrl: LOGO_URL,
    loginBgClass: "login_bg",
    loginSecClass: "reset-success-sec",
    logoStyle: { width: 100, height: 100, margin: "auto" },
    formTextColor: "",
  };

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <main>
      <section className="password_reset_success_module">
        <div className="container-fluid">
          <div className={`row align-items-center vh-100 ${config.loginBgClass} justify-content-center`}>
            <div className="col-lg-7 col-md-7 vh-50 d-flex align-items-center">
              <div className={config.loginSecClass}>
                <img
                  className="logo_img"
                  style={config.logoStyle}
                  src={config.logoUrl}
                  alt="Panchshil Logo"
                />

                <div className="reset-success-content">
                  <div className="success-icon">
                    <CheckCircle size={48} color="#00C853" />
                  </div>
                  
                  <h3 className="reset-success-title">Password reset successful!</h3>
                  <p className="reset-success-message">You can now login with your new password</p>
                  
                  {/* <button 
                    onClick={handleLogin}
                    className="btn-panchshil btn-danger mt-4"
                  >
                    LOGIN
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PasswordResetSuccess;