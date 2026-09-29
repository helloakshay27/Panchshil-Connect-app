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

const PlusServiceEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [services, setServices] = useState([]);

  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    attachment: null,
    service_category_id: "",
    existingImageUrl: "",
    mobile: "",
    mobile2: "",
    mobile3: "",
    address: "",
    order_no: "",
  });

  const [imageChanged, setImageChanged] = useState(false);
  const attachmentInputRef = useRef(null);

  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchPlusService = async () => {
      if (!id) {
        toast.error("Service ID is required");
        navigate("/setup-member/plus-services-list");
        return;
      }

      try {
        setFetchLoading(true);
        const response = await axios.get(`${baseURL}plus_services/${id}.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        const serviceInfo = response.data.plus_service || response.data;

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
          service_category_id: serviceInfo.service_category_id || "",
          mobile: serviceInfo.mobile || "",
          mobile2: serviceInfo.mobile2 || "",
          mobile3: serviceInfo.mobile3 || "",
          address: serviceInfo.address || "",
          order_no: serviceInfo.order_no || "",
        });
      } catch (error) {
        console.error("Error fetching plus service:", error);

        if (error.response?.status === 404) {
          toast.error("Plus service not found");
        } else {
          toast.error("Failed to load plus service data");
        }

        navigate("/plus-services-list");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPlusService();
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

  const removeNewImage = () => {
    setServiceData((prev) => ({ ...prev, attachment: null }));
    setImageChanged(false);
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

  const removeExistingImage = () => {
    setServiceData((prev) => ({
      ...prev,
      attachment: null,
      existingImageUrl: "",
    }));
    setImageChanged(true);
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
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

      formData.append("plus_service[mobile]", serviceData.mobile);
      formData.append("plus_service[mobile2]", serviceData.mobile2);
      formData.append("plus_service[mobile3]", serviceData.mobile3);
      formData.append("plus_service[address]", serviceData.address);
      formData.append("plus_service[order_no]", serviceData.order_no);

      if (imageChanged) {
        if (serviceData.attachment) {
          formData.append("plus_service[attachment]", serviceData.attachment);
        } else {
          formData.append("plus_service[attachment]", "");
        }
      }

      const response = await axios.patch(
        `${baseURL}plus_services/${id}.json`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Plus Service updated successfully!");
      navigate("/setup-member/plus-services-list");
    } catch (error) {
      console.error("Error updating plus service:", error);

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
    navigate("/setup-member/plus-services-list");
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
                Edit Plus Service
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
                      placeholder="Select Service Category"
                      options={services.map((service) => ({
                        label: service.service_cat_name,
                        value: service.id,
                      }))}
                      value={serviceData.service_category_id}
                      onChange={(value) =>
                        setServiceData((prev) => ({
                          ...prev,
                          service_category_id: value,
                        }))
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

export default PlusServiceEdit;
