import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ConciergeBell, FileText, Upload } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const PlusServiceCreate = () => {
  const connectEvents = useConnectEvents();
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const attachmentInputRef = useRef(null);

  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    attachment: null,
    service_category_id: "",
    mobile: "",
    mobile2: "",
    mobile3: "",
    address: "",
    order_no: "",
  });

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

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`${baseURL}service_categories.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setServices(response.data || []);
      } catch (error) {
        console.error(
          "Error fetching services:",
          error.response?.data || error.message
        );
        toast.error("Failed to load projects");
      }
    };

    fetchService();
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

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image must be less than 3MB.");
      e.target.value = "";
      return;
    }

    setServiceData((prev) => ({ ...prev, attachment: file }));
  };

  const removeImage = () => {
    setServiceData((prev) => ({ ...prev, attachment: null }));
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
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

      formData.append("plus_service[name]", serviceData.name);
      formData.append("plus_service[description]", serviceData.description);
      formData.append(
        "plus_service[service_category_id]",
        serviceData.service_category_id
      );

      if (serviceData.mobile) {
        formData.append("plus_service[mobile]", serviceData.mobile);
      }

      if (serviceData.mobile2) {
        formData.append("plus_service[mobile2]", serviceData.mobile2);
      }

      if (serviceData.mobile3) {
        formData.append("plus_service[mobile3]", serviceData.mobile3);
      }

      if (serviceData.address) {
        formData.append("plus_service[address]", serviceData.address);
      }

      if (serviceData.order_no) {
        formData.append("plus_service[order_no]", serviceData.order_no);
      }

      if (serviceData.attachment) {
        formData.append("plus_service[attachment]", serviceData.attachment);
      }

      await axios.post(`${baseURL}plus_services.json`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      connectEvents.onRecordSaved({ mode: "added" });
      toast.success("Plus Service created successfully!");

      setServiceData({
        name: "",
        description: "",
        attachment: null,
        mobile: "",
        address: "",
        order_no: "",
      });
      setSelectedProjectId("");

      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = "";
      }

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

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <ConciergeBell size={16} strokeWidth={1.8} />
                </span>
                Create Plus Service
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Name"
                      required
                      name="name"
                      placeholder="Enter Name"
                      value={serviceData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Description"
                      required
                      name="description"
                      placeholder="Enter Description"
                      value={serviceData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Service Category"
                      required
                      options={services.map((service) => ({
                        label: service.service_cat_name,
                        value: service.id,
                      }))}
                      value={serviceData.service_category_id}
                      onChange={(value) =>
                        setServiceData({
                          ...serviceData,
                          service_category_id: value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Mobile"
                      type="tel"
                      name="mobile"
                      placeholder="Enter Mobile"
                      value={serviceData.mobile}
                      onChange={handleInputChange}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Alternate Mobile 1"
                      type="tel"
                      name="mobile2"
                      placeholder="Enter Alternate Mobile 1"
                      value={serviceData.mobile2}
                      onChange={handleInputChange}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Alternate Mobile 2"
                      type="tel"
                      name="mobile3"
                      placeholder="Enter Alternate Mobile 2"
                      value={serviceData.mobile3}
                      onChange={handleInputChange}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Address"
                      name="address"
                      placeholder="Enter Address"
                      value={serviceData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card banner-form-card banner-attachment-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <FileText size={16} strokeWidth={1.8} />
                </span>
                Add Attachments
              </h3>
            </div>
            <div className="card-body">
              <input
                ref={attachmentInputRef}
                type="file"
                name="attachment"
                accept="image/*"
                onChange={handleImageChange}
                className="banner-upload-native-input"
              />
              <div className="banner-upload-dropzone">
                <button
                  type="button"
                  className="banner-upload-files-btn"
                  onClick={() => attachmentInputRef.current?.click()}
                >
                  <Upload size={16} strokeWidth={1.8} />
                  Upload Files
                </button>
                <span className="banner-upload-item-label">
                  Service Image
                  <span
                    className="banner-upload-hint tooltip-container"
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
                </span>
              </div>

              {serviceData.attachment && (
                <div className="mt-3 position-relative d-inline-block">
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
                  <button
                    type="button"
                    className="position-absolute border-0 rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      top: 2,
                      right: -5,
                      height: 20,
                      width: 20,
                      backgroundColor: "var(--red)",
                      color: "white",
                    }}
                    onClick={removeImage}
                  >
                    x
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlusServiceCreate;
