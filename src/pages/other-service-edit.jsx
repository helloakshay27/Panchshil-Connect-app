import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ConciergeBell, FileText, Upload } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import FormTextField from "../components/base/FormTextField";
import SelectBox from "../components/base/SelectBox";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const OtherServiceEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [plusServices, setPlusServices] = useState([]);
  const attachmentInputRef = useRef(null);

  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    attachment: null,
    plus_service_id: "",
    existingImageUrl: "",
  });

  const [imageChanged, setImageChanged] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlusServices = async () => {
      try {
        const response = await axios.get(`${baseURL}plus_services.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setPlusServices(response.data.plus_services || response.data || []);
      } catch (error) {
        console.error(
          "Error fetching plus services:",
          error.response?.data || error.message
        );
        toast.error("Failed to load plus services");
      }
    };

    fetchPlusServices();
  }, []);

  useEffect(() => {
    const fetchOtherService = async () => {
      if (!id) {
        toast.error("Service ID is required");
        navigate("/setup-member/other-services-list");
        return;
      }

      try {
        setFetchLoading(true);
        const response = await axios.get(`${baseURL}other_services/${id}.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        const serviceInfo = response.data.other_service || response.data;

        let existingImageUrl = "";
        if (
          serviceInfo.attachment &&
          (serviceInfo.attachment.document_url || serviceInfo.attachment.url)
        ) {
          existingImageUrl =
            serviceInfo.attachment.document_url || serviceInfo.attachment.url;
        } else if (serviceInfo.attachment_url) {
          existingImageUrl = serviceInfo.attachment_url;
        } else if (serviceInfo.image_url) {
          existingImageUrl = serviceInfo.image_url;
        }

        setServiceData({
          name: serviceInfo.name || "",
          description: serviceInfo.description || "",
          attachment: null,
          existingImageUrl: existingImageUrl,
          plus_service_id: serviceInfo.plus_service_id || "",
        });
      } catch (error) {
        console.error("Error fetching other service:", error);

        if (error.response?.status === 404) {
          toast.error("Other service not found");
        } else {
          toast.error("Failed to load other service data");
        }

        navigate("/setup-member/other-services-list");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchOtherService();
  }, [id, navigate]);

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
      setImageChanged(false);
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
    setImageChanged(true);
  };

  const clearFileInput = () => {
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

  const removeNewImage = () => {
    setServiceData((prev) => ({ ...prev, attachment: null }));
    setImageChanged(false);
    clearFileInput();
  };

  const removeExistingImage = () => {
    setServiceData((prev) => ({
      ...prev,
      attachment: null,
      existingImageUrl: "",
    }));
    setImageChanged(true);
    clearFileInput();
  };

  const validateForm = () => {
    if (!serviceData.plus_service_id) {
      toast.error("Plus service is required");
      return false;
    }
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

      formData.append("other_service[plus_service_id]", serviceData.plus_service_id);
      formData.append("other_service[name]", serviceData.name);
      formData.append("other_service[description]", serviceData.description);

      if (imageChanged) {
        if (serviceData.attachment) {
          formData.append("other_service[attachment]", serviceData.attachment);
        } else {
          formData.append("other_service[attachment]", "");
        }
      }

      await axios.patch(
        `${baseURL}other_services/${id}.json`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Other Service updated successfully!");
      navigate("/setup-member/other-services-list");
    } catch (error) {
      console.error("Error updating other service:", error);

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
    navigate("/setup-member/other-services-list");
  };

  if (fetchLoading) {
    return (
      <div className="main-content">
        <div className="module-data-section banner-form-page p-3">
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <ConciergeBell size={16} strokeWidth={1.8} />
                </span>
                Loading...
              </h3>
            </div>
            <div className="card-body">
              <p className="mb-0">Loading other service data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Edit Other Service
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Plus Service"
                      required
                      placeholder="Select Plus Service"
                      options={plusServices.map((service) => ({
                        label: service.name,
                        value: service.id,
                      }))}
                      value={serviceData.plus_service_id}
                      onChange={(value) =>
                        setServiceData((prev) => ({
                          ...prev,
                          plus_service_id: value,
                        }))
                      }
                    />
                  </div>
                </div>

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
                        Single image, max 3MB. Upload a new image to replace the
                        existing one.
                      </span>
                    )}
                  </span>
                </span>
              </div>

              {serviceData.attachment && imageChanged ? (
                <div className="mt-3 position-relative d-inline-block">
                  <img
                    src={URL.createObjectURL(serviceData.attachment)}
                    alt="New Service Preview"
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
                    title="Remove image"
                    style={{
                      top: 2,
                      right: -5,
                      height: 20,
                      width: 20,
                      backgroundColor: "var(--red)",
                      color: "white",
                    }}
                    onClick={removeNewImage}
                  >
                    x
                  </button>
                </div>
              ) : (
                serviceData.existingImageUrl && (
                  <div className="mt-3 position-relative d-inline-block">
                    <img
                      src={serviceData.existingImageUrl}
                      alt="Current Service Image"
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
                      title="Remove image"
                      style={{
                        top: 2,
                        right: -5,
                        height: 20,
                        width: 20,
                        backgroundColor: "var(--red)",
                        color: "white",
                      }}
                      onClick={removeExistingImage}
                    >
                      x
                    </button>
                  </div>
                )
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
              onClick={handleCancel}
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

export default OtherServiceEdit;
