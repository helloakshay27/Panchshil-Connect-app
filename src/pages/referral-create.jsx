import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReferralCreate = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    referralCode: "",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/projects.json",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data || error.message
        );
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !selectedProjectId
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      referral: {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        referral_code: formData.referralCode || null,
        project_id: selectedProjectId,
      },
    };

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/referrals.json",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Referral created successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error(
        "Error creating referral:",
        error.response?.data || error.message
      );
      alert("Failed to create referral. Please check your inputs.");
    }
  };

  const handleMobileChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && value.length > 10) return; // Limit to 10 digits
    setFormData({ ...formData, [name]: value });
  };

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section p-3">
          <div className="card mt-5 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Create Referral</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name<span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Email<span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="email"
                        placeholder="Enter Email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Mobile No<span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Enter Mobile No"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleMobileChange}
                        min="1000000000"
                        max="9999999999"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Project<span style={{ color: "red" }}> *</span>
                      </label>
                      <select
                        className="form-control form-select"
                        value={selectedProjectId}
                        required
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                      >
                        <option value="" disabled>
                          Select Project
                        </option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.project_name}
                          </option>
                        ))}
                      </select>
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
  );
};

export default ReferralCreate;
