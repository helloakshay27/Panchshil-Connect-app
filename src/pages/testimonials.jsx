import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import "../mor.css";

const Testimonials = () => {
  const [companySetupOptions, setCompanySetupOptions] = useState([]);
  const [companySetupId, setCompanySetupId] = useState("");
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchCompanySetups = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/company_setups.json",
          {
            headers: {
              Authorization:
                "Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE",
            },
          }
        );

        console.log("Raw API Response:", response.data);

        if (response.data && Array.isArray(response.data.company_setups)) {
          setCompanySetupOptions(response.data.company_setups);
        } else {
          console.warn("Unexpected API response format:", response.data);
          setCompanySetupOptions([]);
        }
      } catch (error) {
        console.error("Error fetching company setup data:", error);

        if (error.response) {
          console.error("API Response Error:", error.response.data);
        }
        setCompanySetupOptions([]);
      }
    };

    fetchCompanySetups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companySetupId || !userName.trim() || !userType || !content.trim()) {
      alert("All fields are required.");
      return;
    }

    const data = {
      testimonial: {
        company_setup_id: companySetupId,
        user_name: userName.trim(),
        user_type: userType,
        content: content.trim(),
      },
    };

    console.log("Submitting data:", data);

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/testimonials.json",
        data,
        {
          headers: {
            Authorization: "Bearer kD8B8ZeWZQAd2nQ-70dcfLXgYHLQh-zjggvuuE_93BY",
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from POST:", response.data);
      alert("Data saved successfully!");
      setCompanySetupId("");
      setUserName("");
      setUserType("");
      setContent("");
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      alert("Failed to submit. Please check your input.");
    }
  };

  const handleCancel = () => {
    setCompanySetupId("");
    setUserName("");
    setUserType("");
    setContent("");
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <div className="card mt-5 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Testimonials</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Company Setup Id
                          <span style={{ color: "red", fontSize: "16px" }}>
                            *
                          </span>
                        </label>
                        <select
                          className="form-control form-select"
                          name="companysetupid"
                          value={companySetupId}
                          onChange={(e) => setCompanySetupId(e.target.value)}
                        >
                          <option value="" disabled>
                            Select ID
                          </option>
                          {companySetupOptions.length > 0 ? (
                            companySetupOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name ||
                                  option.company_name ||
                                  `ID: ${option.id}`}
                              </option>
                            ))
                          ) : (
                            <option disabled>No options available</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          User Name
                          <span style={{ color: "red", fontSize: "16px" }}>
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="username"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          User Type
                          <span style={{ color: "red", fontSize: "16px" }}>
                            *
                          </span>
                        </label>
                        <select
                          className="form-control form-select"
                          name="userType"
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select status
                          </option>
                          <option value="User">User</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Description
                          <span style={{ color: "red", fontSize: "16px" }}>
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="content"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2 justify-content-center">
                    <div className="col-md-2">
                      <button type="submit" className="purple-btn2 w-100">
                        Submit
                      </button>
                    </div>
                    <div className="col-md-2">
                      <button
                        type="button"
                        className="purple-btn2 w-100"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;
