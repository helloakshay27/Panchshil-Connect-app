import React, { useEffect, useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const PressReleasesCreate = () => {
  const [company, setCompany] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_id: "",
    project_id: "",
    release_date: "",
    attachfile: [],
  });

  const fetchCompany = async () => {
    try {
      const response = await axios.get(
        "https://panchshil-super.lockated.com/company_setups.json",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data.company_setups;
      console.log("Data", data);
      setCompany(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleCompanyChange = (e) => {
    setFormData({ ...formData, company_id: e.target.value });
  };

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      e.target.value = "";
      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      attachfile: validFiles,
    }));
  };

  // Form validation
  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "";
      toast.error("Title is mandatory");
    } else if (!formData.company_id.trim()) {
      newErrors.company_id = "";
      toast.error("Company is mandatory");
    } else if (!formData.attachfile || formData.attachfile.length === 0) {
      newErrors.attachfile = "";
      toast.error("Banner image is mandatory");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      toast.error("Please fill in all the required fields.");
      setLoading(false);
      return; // Prevent form submission if validation fails
    }

    try {
      const sendData = new FormData();
      sendData.append("title", formData.title);
      sendData.append("company_id", formData.company_id);
      formData.attachfile.forEach((file) => {
        sendData.append(`attachment`, file);
      });

      const response = await axios.post(
        "https://panchshil-super.lockated.com/press_releases.json",
        sendData
      );

      toast.success("Form submitted successfully");
      navigate("");
    } catch (error) {
      toast.error(`Error creating banner: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Press Releases</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Title
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        placeholder="Enter Title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Press Releases Date
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="Date"
                        name="release_date"
                        placeholder="Enter date"
                        value={formData.release_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-1">
                    <div className="form-group">
                      <label>
                        Project<span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <select
                        className="form-control form-select"
                        value={selectedProjectId}
                        required
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                      >
                        <option value="">Select Project</option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.project_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company{" "}
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <select
                        className="form-control form-select"
                        value={formData.company_id}
                        name="company_id"
                        onChange={handleCompanyChange}
                      >
                        <option value="">Select Company</option>

                        {console.log("projects", projects)}
                        {company.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                      {errors.company_id && (
                        <span className="error text-danger">
                          {errors.company_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment{" "}
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachfile"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                      {errors.attachfile && (
                        <span className="error text-danger">
                          {errors.attachfile}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-2 justify-content-center">
                <div className="col-md-2">
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="purple-btn2 w-100"
                    disabled={loading}
                  >
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PressReleasesCreate;
