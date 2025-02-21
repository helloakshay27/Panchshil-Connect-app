import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BannerAdd = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    banner_type: "",
    banner_redirect: "",
    company_id: "",
    title: "",
    attachfile: [],
  });

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/company_setups.json",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE`,
              "Content-Type": "application/json",
            },
          }
        );

        // Ensure we are getting the correct structure (company_setups array)
        if (response.data && Array.isArray(response.data.company_setups)) {
          setProjects(response.data.company_setups); // Access company_setups instead of response.data
        } else {
          setProjects([]); // If it's not an array, set an empty array
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setError("Failed to fetch banners. Please try again later.");
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Dropdown handler
  const handleCompanyChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      company_id: e.target.value,
    }));
  };

  // Input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // File input handler
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
      newErrors.title = "Title is mandatory";
      toast.error("Title is mandatory");
    } else if (!formData.company_id.trim()) {
      newErrors.company_id = "Company  is mandatory";
      toast.error("Company is mandatory");
    } else if (!formData.attachfile || formData.attachfile.length === 0) {
      newErrors.attachfile = "Banner image is mandatory";
      toast.error("Banner image is mandatory");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Prevent form submission if validation fails
    }

    try {
      const sendData = new FormData();
      sendData.append("banner[title]", formData.title);
      sendData.append("banner[company_id]", formData.company_id);
      formData.attachfile.forEach((file) => {
        sendData.append(`banner[banner_image]`, file);
      });

      const response = await axios.post(
        "https://panchshil-super.lockated.com/banners.json",
        sendData
      );

      toast.success("Form submitted successfully");
      navigate("/banner-list");
    } catch (error) {
      toast.error(`Error creating banner: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  }

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-hidden">
          <div className="module-data-section">
            <div className="card mt-4 pb-2 mx-4">
              <div className="card-header">
                <h3 className="card-title">New Banner</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Title{" "}
                        <span style={{ color: "red", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter title"
                      />
                      {errors.title && (
                        <span className="error text-danger">
                          {errors.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company{" "}
                        <span style={{ color: "red", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <select
                        className="form-control form-select"
                        value={formData.company_id}
                        name="company_id"
                        onChange={handleCompanyChange}
                      >
                        <option value="">Select a Company</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
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
                        Banner{" "}
                        <span style={{ color: "red", fontSize: "16px" }}>
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

export default BannerAdd;
