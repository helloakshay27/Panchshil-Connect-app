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
    attachments: [],
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
    const files = Array.from(e.target.files);

    if (files.length === 0) {
      setTutorialData((prev) => ({ ...prev, attachments: [] }));
      return;
    }

    // Allow only 2 files
    if (files.length > 2) {
      toast.error("Maximum 2 files allowed.");
      e.target.value = "";
      return;
    }

    // Valid file types: images, videos, and PDFs
    const validTypes = [
      // Images
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif",
      "image/webp",
      // Videos
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv",
      // PDFs
      "application/pdf",
    ];

    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Please select only image, video, or PDF files.");
      e.target.value = "";
      return;
    }

    // File size validation (10MB for videos/PDFs, 3MB for images)
    const oversizedFiles = files.filter((file) => {
      const maxSize = file.type.startsWith('video/') || file.type === 'application/pdf' 
        ? 10 * 1024 * 1024  // 10MB for videos and PDFs
        : 3 * 1024 * 1024;  // 3MB for images
      return file.size > maxSize;
    });

    if (oversizedFiles.length > 0) {
      toast.error("Images must be less than 3MB, videos and PDFs must be less than 10MB.");
      e.target.value = "";
      return;
    }

    setTutorialData((prev) => ({ ...prev, attachments: files }));
  };

  const removeFile = (fileIndex) => {
    const updatedFiles = tutorialData.attachments.filter(
      (_, index) => index !== fileIndex
    );
    setTutorialData((prev) => ({ ...prev, attachments: updatedFiles }));

    if (updatedFiles.length === 0) {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    }
  };

  const validateForm = () => {
    if (!tutorialData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!tutorialData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    return true;
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType.startsWith('video/')) {
      return '🎥';
    } else if (fileType === 'application/pdf') {
      return '📄';
    }
    return '📎';
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

      // Add tds_tutorial data (matching the desired JSON structure)
      formData.append("tds_tutorial[name]", tutorialData.name);
      formData.append("tds_tutorial[description]", tutorialData.description);

      // Add attachments - Multiple approaches to try:
      
      // Approach 1: Single attachment field (if backend expects one file)
      if (tutorialData.attachments.length > 0) {
        formData.append("tds_tutorial[attachment]", tutorialData.attachments[0]);
      }
      
      // Approach 2: Multiple attachments (uncomment if backend supports multiple)
      // tutorialData.attachments.forEach((file) => {
      //   formData.append("tds_tutorial[attachments][]", file);
      // });
      
      // Approach 3: Numbered attachments (uncomment if needed)
      // tutorialData.attachments.forEach((file, index) => {
      //   formData.append(`tds_tutorial[attachment_${index}]`, file);
      // });
      
      // Approach 4: Direct file append (uncomment if needed)
      // tutorialData.attachments.forEach((file) => {
      //   formData.append("attachment", file);
      // });

      // API call to TDS tutorials endpoint
      const response = await axios.post(`${baseURL}tds_tutorials.json`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      toast.success("TDS Tutorial created successfully!");

      // Reset form
      setTutorialData({
        name: "",
        description: "",
        attachments: [],
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
                      Tutorial Name <span className="otp-asterisk"> *</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter Tutorial Name"
                      name="name"
                      value={tutorialData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Description <span className="otp-asterisk"> *</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={1}
                      placeholder="Enter Description"
                      name="description"
                      value={tutorialData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Attachments Field */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Attachments{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max 2 files: Images (3MB), Videos/PDFs (10MB)
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      name="attachments"
                      accept="image/*,video/*,.pdf"
                      onChange={handleFileChange}
                      multiple
                    />

                    {/* File Preview */}
                    {tutorialData.attachments.length > 0 && (
                      <div className="mt-3">
                        <div className="d-flex flex-wrap gap-2">
                          {tutorialData.attachments.map((file, index) => (
                            <div
                              key={index}
                              className="position-relative border rounded p-2"
                              style={{ minWidth: "200px", maxWidth: "250px" }}
                            >
                              {/* File preview based on type */}
                              {file.type.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="img-thumbnail"
                                  style={{
                                    width: "100%",
                                    height: "100px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div 
                                  className="d-flex align-items-center justify-content-center bg-light"
                                  style={{ height: "100px" }}
                                >
                                  <span style={{ fontSize: "2rem" }}>
                                    {getFileIcon(file.type)}
                                  </span>
                                </div>
                              )}
                              
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
                                onClick={() => removeFile(index)}
                              >
                                ×
                              </button>
                              
                              <div className="text-center mt-1">
                                <small
                                  className="text-muted"
                                  style={{ fontSize: "11px" }}
                                >
                                  {file.name.length > 20
                                    ? `${file.name.substring(0, 20)}...`
                                    : file.name}
                                </small>
                                <br />
                                <small className="text-info" style={{ fontSize: "10px" }}>
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </small>
                              </div>
                            </div>
                          ))}
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