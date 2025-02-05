import React, { useEffect, useState } from "react";
import axios from "axios";

const Referralcreate = () => {
  const [project, setProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    referralCode: "",
    userId: "",
    projectId: "",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/get_all_projects.json",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE`,
              "Content-Type": "application/json",
            },
          }
        );

        setProject(response.data.projects);
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };
    fetchProject();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/referrals.json",
        {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          referral_code: formData.referralCode,
          user_id: 2,
          project_id: selectedProjectId,
        },
        {
          headers: {
            Authorization: `Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Referral created successfully:", response.data);
    } catch (error) {
      console.error("Error creating referral:", error.response?.data);
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section p-3">
          <div className="card mt-5 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Referral</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        className="form-control"
                        type="email"
                        placeholder="Enter Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Mobile No</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Enter Mobile No"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>User Id</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter User ID"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                      />
                    </div>
                  </div> */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Project Id</label>
                      <select
                        className="form-control form-select"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                      >
                        <option value="" disabled>
                          Select ID
                        </option>

                        {project &&
                          project.map((proj) => (
                            <option key={proj.id} value={proj.id}>
                              {proj.project_name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Referral Code</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter Referral Code"
                        name="referralCode"
                        value={formData.referralCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-2 mt-3">
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
  );
};

export default Referralcreate;
