import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const TdsTutorialCreate = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [tutorialData, setTutorialData] = useState({
    name: "",
    description: "",
    attachment: null, // Changed from attachments array to single attachment
  });

  console.log("tutorialData", tutorialData);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseURL}projects.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data || error.message
        );
        toast.error("Failed to load projects");
      }
    };

    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTutorialData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get only the first file

    if (!file) {
      setTutorialData((prev) => ({ ...prev, attachment: null }));
      return;
    }

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      toast.error("Please select only PDF files.");
      e.target.value = "";
      return;
    }

    // File size validation (10MB for PDFs)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("PDF file must be less than 10MB.");
      e.target.value = "";
      return;
    }

    setTutorialData((prev) => ({ ...prev, attachment: file }));
  };

  const removeFile = () => {
    setTutorialData((prev) => ({ ...prev, attachment: null }));
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    if (!tutorialData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    toast.dismiss();

    try {
      const formData = new FormData();

      // Add tds_tutorial data
      formData.append("tds_tutorial[name]", tutorialData.name);
      formData.append("tds_tutorial[description]", tutorialData.description);

      // Add single attachment if exists
      if (tutorialData.attachment) {
        formData.append("tds_tutorial[attachment]", tutorialData.attachment);
      }

      // API call to TDS tutorials endpoint
      const response = await axios.post(
        `${baseURL}tds_tutorials.json`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("TDS Tutorial created successfully!");

      // Reset form
      setTutorialData({
        name: "",
        description: "",
        attachment: null,
      });

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      // Navigate to tutorial list or desired page
      navigate("/setup-member/tds-tutorials-list");
    } catch (error) {
      console.error("Error creating TDS tutorial:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="">
      <div className="module-data-section p-3">
        <form onSubmit={handleSubmit}>
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Create TDS Tutorial</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Name Field */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Title <span className="otp-asterisk"> *</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter Title"
                      name="name"
                      value={tutorialData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Attachment Field - Single PDF only */}
                <div className="col-md-3 mt-1">
                  <div className="form-group">
                    <label>
                      Attachment{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Only 1 PDF file allowed (Max 10MB)
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      name="attachment"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />

                    {/* File Preview */}
                    {tutorialData.attachment && (
                      <div className="mt-3">
                        <div
                          className="border rounded p-2"
                          style={{ maxWidth: "250px" }}
                        >
                          <div
                            className="d-flex align-items-center justify-content-center bg-light"
                            style={{ height: "100px" }}
                          >
                            <span style={{ fontSize: "2rem" }}>📄</span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute"
                            title="Remove file"
                            style={{
                              top: "-5px",
                              right: "-5px",
                              fontSize: "10px",
                              width: "20px",
                              height: "20px",
                              padding: "0px",
                              borderRadius: "50%",
                            }}
                            onClick={removeFile}
                          >
                            ×
                          </button>

                          <div className="text-center mt-1">
                            <small
                              className="text-muted"
                              style={{ fontSize: "11px" }}
                            >
                              {tutorialData.attachment.name.length > 20
                                ? `${tutorialData.attachment.name.substring(
                                    0,
                                    20
                                  )}...`
                                : tutorialData.attachment.name}
                            </small>
                            <br />
                            <small
                              className="text-info"
                              style={{ fontSize: "10px" }}
                            >
                              {(
                                tutorialData.attachment.size /
                                (1024 * 1024)
                              ).toFixed(2)}{" "}
                              MB
                            </small>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button
                type="submit"
                className="purple-btn2 purple-btn2-shadow w-100"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="purple-btn2 purple-btn2-shadow w-100"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TdsTutorialCreate;
