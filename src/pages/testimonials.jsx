import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";

const Testimonials = () => {
  const [formData, setFormData] = useState({
    companysetupid: "",
    username: "",
    userType: "",
    Content: "",
  });

  const [companySetupOptions, setCompanySetupOptions] = useState([]);

  useEffect(() => {
    const fetchCompanySetups = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/company_setups.json"
        );
        setCompanySetupOptions(response.data);
      } catch (error) {
        console.error("Error fetching company setup data:", error);
      }
    };

    fetchCompanySetups();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {/* <Header /> */}
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Testimonials</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Company Setup Id</label>
                      <select
                        className="form-control form-select"
                        style={{ width: "100%" }}
                        name="companysetupid"
                        value={formData.companysetupid}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Select ID
                        </option>
                        {companySetupOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>User Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Default input"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>User Type</label>
                      <select
                        className="form-control form-select"
                        style={{ width: "100%" }}
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Select status
                        </option>
                        <option value="Alabama">user</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Content</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Default input"
                        name="Content"
                        value={formData.Content}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Testimonials;
