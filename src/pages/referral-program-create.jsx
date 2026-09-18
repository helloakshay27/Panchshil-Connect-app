import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Gift, FileText, Upload } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ReferralProgramCreate = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const attachmentInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [referralData, setReferralData] = useState({
    title: "",
    description: "",
    images: [],
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setReferralData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length > 5) {
      toast.error("Please select a maximum of 5 images.");
      event.target.value = "";
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
      toast.error("Each image must be less than 3MB.");
      event.target.value = "";
      return;
    }

    setReferralData((previous) => ({ ...previous, images: files }));
  };

  const removeImage = (imageIndex) => {
    const updatedImages = referralData.images.filter(
      (_, index) => index !== imageIndex,
    );
    setReferralData((previous) => ({ ...previous, images: updatedImages }));

    if (updatedImages.length === 0 && attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!referralData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    toast.dismiss();

    try {
      const formData = new FormData();
      formData.append("project_id", "");
      formData.append("user_id", localStorage.getItem("user_id") || "");
      formData.append("referral_config[title]", referralData.title);
      formData.append("referral_config[description]", referralData.description);

      referralData.images.forEach((image) => {
        formData.append("referral_config[attachments][]", image);
      });

      await axios.post(`${baseURL}referral_configs.json`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      connectEvents.onRecordSaved({ mode: "added" });
      toast.success("Referral created successfully!");
      navigate("/referral-program-list");
    } catch (error) {
      console.error("Error creating referral:", error);

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
    navigate("/referral-program-list");
  };

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
                Create Referral Program
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
                      value={referralData.title}
                      onChange={handleInputChange}
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
                      value={referralData.description}
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
                Images
              </h3>
            </div>
            <div className="card-body">
              <input
                ref={attachmentInputRef}
                type="file"
                name="attachments"
                accept="image/*"
                multiple
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
                  Referral Images
                  <span
                    className="banner-upload-hint tooltip-container"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    [i]
                    {showTooltip && (
                      <span className="tooltip-text">Max 5 images, 3MB each</span>
                    )}
                  </span>
                </span>
              </div>

              {referralData.images.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {referralData.images.map((image, index) => (
                    <div
                      key={`${image.name}-${index}`}
                      className="position-relative d-inline-block"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
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
                        onClick={() => removeImage(index)}
                      >
                        x
                      </button>
                    </div>
                  ))}
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

export default ReferralProgramCreate;
