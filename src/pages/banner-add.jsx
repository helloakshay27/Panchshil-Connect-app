import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";

const BannerAdd = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    banner_type: "",
    banner_redirect: "",
    company_id: "",
    project_id: "",
    title: "",
    attachfile: [],
  });

  // Fetch Companies
  useEffect(() => {
    const fetchCompanies = async () => {
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
        setCompanies(response.data.company_setups || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

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
        console.error("Error fetching projects:", error);
      }
    };

    fetchCompanies();
    fetchProjects();
    setLoading(false);
  }, []);

  // Input Handlers
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

    setFormData({ ...formData, attachfile: validFiles });
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      toast.error("Title is mandatory");
    }
    if (!formData.company_id.trim()) {
      newErrors.company_id = "Company is required";
      toast.error("Company is mandatory");
    }
    if (!formData.attachfile.length) {
      newErrors.attachfile = "Banner image is required";
      toast.error("Banner image is mandatory");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      toast.error("Please fill in all the required fields.");
      setLoading(false);
      return;
    }

    try {
      const sendData = new FormData();
      sendData.append("banner[title]", formData.title);
      sendData.append("banner[company_id]", formData.company_id);
      sendData.append("banner[project_id]", formData.project_id);

      formData.attachfile.forEach((file) => {
        sendData.append("banner[banner_image]", file);
      });

      await axios.post(
        "https://panchshil-super.lockated.com/banners.json",
        sendData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Banner created successfully");
      navigate("/banner-list");
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
        <div className="website-content overflow-hidden">
          <div className="module-data-section">
            <div className="card mt-4 pb-2 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Banner</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Title */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter title"
                      />
                      {errors.title && <span className="error text-danger">{errors.title}</span>}
                    </div>
                  </div>

                  {/* Project */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Project *</label>
                      {/* <select className="form-control" name="project_id" value={formData.project_id} onChange={handleChange}>
                        <option value="">Select Project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>{project.project_name}</option>
                        ))}
                      </select> */}

                      <SelectBox
                        options={
                          projects.map((project) => ({
                            label: project.project_name,
                            value: project.id,
                          }))
                        }
                        defaultValue={formData.project_id}
                        onChange={(value) => setFormData({ ...formData, project_id: value })}
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Company *</label>
                      {/* <select className="form-control" name="company_id" value={formData.company_id} onChange={handleChange}>
                        <option value="">Select a Company</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                      </select> */}
                      <SelectBox
                        options={
                          companies.map((company) => ({
                            label: company.name,
                            value: company.id,
                          }))
                        }
                        defaultValue={formData.company_id}
                        onChange={(value) => setFormData({ ...formData, company_id: value })}
                      />
                      {errors.company_id && <span className="error text-danger">{errors.company_id}</span>}
                    </div>
                  </div>

                  {/* Banner File Upload */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Banner Image *</label>
                      <input className="form-control" type="file" name="attachfile" accept="image/*" multiple onChange={handleFileChange} />
                      {errors.attachfile && <span className="error text-danger">{errors.attachfile}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="row mt-2 justify-content-center">
                <div className="col-md-2">
                  <button onClick={handleSubmit} className="purple-btn2 w-100" disabled={loading}>
                    Submit
                  </button>
                </div>
                <div className="col-md-2">
                  <button type="button" className="purple-btn2 w-100" onClick={handleCancel}>
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

export default BannerAdd;
