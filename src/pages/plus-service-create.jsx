import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const PlusServiceCreate = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    attachment: null,
  });

  console.log("formData", serviceData);

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
    setServiceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setServiceData((prev) => ({ ...prev, attachment: null }));
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please select only image files (JPEG, PNG, GIF, WebP).");
      e.target.value = "";
      return;
    }

    const maxSize = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSize) {
      toast.error("Image must be less than 3MB.");
      e.target.value = "";
      return;
    }

    setServiceData((prev) => ({ ...prev, attachment: file }));
  };

  const removeImage = () => {
    setServiceData((prev) => ({ ...prev, attachment: null }));
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    if (!serviceData.name.trim()) {
      toast.error("Service name is required");
      return false;
    }
    if (!serviceData.description.trim()) {
      toast.error("Description is required");
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

      // Add plus_service data (matching the desired JSON structure)
      formData.append("plus_service[name]", serviceData.name);
      formData.append("plus_service[description]", serviceData.description);

      // Add single attachment if present
      if (serviceData.attachment) {
        formData.append("plus_service[attachment]", serviceData.attachment);
      }

      // API call to plus_services endpoint
      const response = await axios.post(
        `${baseURL}plus_services.json`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("Plus Service created successfully!");

      // Reset form
      setServiceData({
        name: "",
        description: "",
        attachment: null,
      });
      setSelectedProjectId("");

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      navigate("/setup-member/plus-services-list");
    } catch (error) {
      console.error("Error creating plus service:", error);

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
              <h3 className="card-title">Create Plus Service</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Service Name Field */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Name <span className="otp-asterisk"> *</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter Name"
                      name="name"
                      value={serviceData.name}
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
                      value={serviceData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Single Image Field */}
                <div className="col-md-3 mt-1">
                  <div className="form-group">
                    <label>
                      Service Image{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Single image, max 3MB
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      name="attachment"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                    {/* Image Preview */}
                    {serviceData.attachment && (
                      <div className="mt-3">
                        <div className="position-relative d-inline-block">
                          <img
                            src={URL.createObjectURL(serviceData.attachment)}
                            alt="Service Preview"
                            className="img-thumbnail"
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "cover",
                            }}
                          />
                          {/* <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute"
                            title="Remove image"
                            style={{
                              top: "-5px",
                              right: "-5px",
                              fontSize: "12px",
                              width: "25px",
                              height: "25px",
                              padding: "0px",
                              borderRadius: "50%",
                            }}
                            onClick={removeImage}
                          >
                            ×
                          </button> */}
                        </div>
                        {/* <div className="text-center mt-2">
                          <small className="text-muted">
                            {serviceData.attachment.name.length > 20
                              ? `${serviceData.attachment.name.substring(
                                  0,
                                  20
                                )}...`
                              : serviceData.attachment.name}
                          </small>
                        </div> */}
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

export default PlusServiceCreate;
