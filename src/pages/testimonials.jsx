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
                "Bearer hnbLunLzzG9ft5dyVulTBpuQp2mgvfZe_69ukCTa8QQ",
            },
          }
        );
        console.log("response", response.data);
        setCompanySetupOptions(response.data); // Set the company setup data
      } catch (error) {
        console.error("Error fetching company setup data:", error);
      }
    };

    fetchCompanySetups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Prepare the data to send
    const data = {
      testimonial: {
        company_setup_id: companySetupId,
        user_name: userName,
        user_type: userType,
        content: content,
      },
    };

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/testimonials.json",
        data,
        {
          headers: {
            Authorization: "Bearer kD8B8ZeWZQAd2nQ-70dcfLXgYHLQh-zjggvuuE_93BY",
          },
        }
      );
      console.log("Response from POST:", response.data);
      alert("Data saved successfully!");
      // Optionally, reset the form after success
      setCompanySetupId("");
      setUserName("");
      setUserType("");
      setContent("");
    } catch (error) {
      console.error("Error submitting testimonial:", error);
    }
  };

  return (
    <>
      {/* <Header /> */}
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
                        <label>Company Setup Id</label>
                        <select
                          className="form-control form-select"
                          style={{ width: "100%" }}
                          name="companysetupid"
                          value={companySetupId}
                          onChange={(e) => setCompanySetupId(e.target.value)}
                        >
                          <option value="" disabled>
                            Select ID
                          </option>
                          {companySetupOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name || option.company_name || "No Name"}
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
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
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
                          value={userType}
                          onChange={(e) => setUserType(e.target.value)}
                        >
                          <option value="" disabled>
                            Select status
                          </option>
                          <option value="User">User</option>
                          {/* Add other user types if needed */}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-3 ">
                      <div className="form-group">
                        <label>Content</label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Default input"
                          name="Content"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2 ">
                    <button type="submit" className="purple-btn2 w-80">
                      Submit
                    </button>
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
