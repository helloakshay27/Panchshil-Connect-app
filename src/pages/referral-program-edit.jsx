import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Gift, FileText, Upload } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ReferralProgramEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const attachmentInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [existingImages, setExistingImages] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    attachments: [],
  });

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setFetchingData(true);
        const response = await axios.get(
          `${baseURL}referral_configs/${id}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );

        const referralData = response.data.referral || response.data;

        setFormData({
          title: referralData.title || "",
          description: referralData.description || "",
          attachments: [],
        });
        setExistingImages(referralData.attachments || []);
      } catch (error) {
        console.error("Error fetching referral data:", error);
        toast.error("Failed to fetch referral data");
        navigate("/referral-program-list");
      } finally {
        setFetchingData(false);
      }
    };

    if (id) {
      fetchReferralData();
    }
  }, [id, navigate]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length > 1) {
      toast.error("Please select only one image for now.");
      event.target.value = "";
      return;
    }

    if (files.length === 0) {
      setFormData({ ...formData, attachments: [] });
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      toast.error("Please select only image files (JPEG, PNG, GIF, WebP).");
      event.target.value = "";
      return;
    }

    const maxSize = 3 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error("Image size must be less than 3MB.");
      event.target.value = "";
      return;
    }

    setFormData({ ...formData, attachments: files });
  };

  const removeNewImage = () => {
    setFormData({ ...formData, attachments: [] });
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

  const removeExistingImage = async (imageId, indexToRemove) => {
    try {
      await axios.delete(
        `${baseURL}referral_configs/${id}/remove_images/${imageId}.json`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      setExistingImages((previous) =>
        previous.filter((_, index) => index !== indexToRemove),
      );
      toast.success("Image removed successfully.");
    } catch (error) {
      console.error("Error removing image:", error.response?.data || error);
      toast.error("Failed to remove image. Please try again.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    toast.dismiss();

    if (!formData.title.trim()) {
      toast.error("Title is required.");
      setLoading(false);
      return;
    }

    if (
      existingImages.length === 0 &&
      (!formData.attachments || formData.attachments.length === 0)
    ) {
      toast.error("At least one image is required.");
      setLoading(false);
      return;
    }

    try {
      if (formData.attachments && formData.attachments.length > 0) {
        const formDataPayload = new FormData();
        formDataPayload.append("referral_config[title]", formData.title.trim());
        formDataPayload.append(
          "referral_config[description]",
          formData.description.trim(),
        );

        formData.attachments.forEach((image) => {
          formDataPayload.append("referral_config[attachments][]", image);
        });

        await axios.put(
          `${baseURL}referral_configs/${id}.json`,
          formDataPayload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } else {
        await axios.put(
          `${baseURL}referral_configs/${id}.json`,
          {
            referral_config: {
              title: formData.title.trim(),
              description: formData.description.trim(),
            },
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );
      }

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Referral updated successfully!");
      navigate("/referral-program-list");
    } catch (error) {
      console.error("Error updating referral:", error);

      if (
        typeof error.response?.data === "string" &&
        error.response.data.includes("<!DOCTYPE html>")
      ) {
        toast.error(
          "Server error occurred. Please check the console and contact support.",
        );
      } else if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        if (errors) {
          Object.keys(errors).forEach((key) => {
            errors[key].forEach((errorMsg) => {
              toast.error(`${key}: ${errorMsg}`);
            });
          });
        } else {
          toast.error("Validation failed. Please check your inputs.");
        }
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 404) {
        toast.error("Referral not found. It may have been deleted.");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later or contact support.");
      } else {
        toast.error("Failed to update referral. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/referral-program-list");
  };

  const imagePreview = (src, alt, onRemove) => (
    <div className="mt-3 position-relative d-inline-block">
      <img
        src={src}
        alt={alt}
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
        onClick={onRemove}
      >
        x
      </button>
    </div>
  );

  if (fetchingData) {
    return (
      <div className="main-content">
        <div className="module-data-section banner-form-page p-3">
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Gift size={16} strokeWidth={1.8} />
                </span>
                Loading...
              </h3>
            </div>
            <div className="card-body">
              <p className="mb-0">Loading referral data...</p>
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
                  <Gift size={16} strokeWidth={1.8} />
                </span>
                Edit Referral
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Title"
                      required
                      name="title"
                      placeholder="Enter Title"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Description"
                      multiline
                      rows={3}
                      name="description"
                      placeholder="Enter Description"
                      value={formData.description}
                      onChange={handleChange}
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
                Images
              </h3>
            </div>
            <div className="card-body">
              <input
                ref={attachmentInputRef}
                type="file"
                name="attachments"
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
                  Referral Image
                  <span
                    className="banner-upload-hint tooltip-container"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    [i]
                    {showTooltip && (
                      <span className="tooltip-text">Max 1 image, 3MB each</span>
                    )}
                  </span>
                </span>
              </div>

              <div className="d-flex flex-wrap gap-2">
                {formData.attachments.length > 0
                  ? imagePreview(
                      URL.createObjectURL(formData.attachments[0]),
                      "New image preview",
                      removeNewImage,
                    )
                  : existingImages.map((image, index) => (
                      <div key={`existing-${image.id || index}`}>
                        {imagePreview(
                          image.document_url ||
                            image.url ||
                            image.image_url ||
                            (typeof image === "string" ? image : ""),
                          `Current ${index + 1}`,
                          () =>
                            removeExistingImage(image.id || index, index),
                        )}
                      </div>
                    ))}
              </div>
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
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

export default ReferralProgramEdit;
