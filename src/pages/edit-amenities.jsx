import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FileText, Sparkles, Upload } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const EditAmenities = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [darkModeIcon, setDarkModeIcon] = useState(null); // ✅ Added dark mode icon state
  const [previewDarkModeImage, setPreviewDarkModeImage] = useState(null); // ✅ Added dark mode preview state
  const [loading, setLoading] = useState(false);
  const [amenityType, setAmenityType] = useState("");
  const [nightMode, setNightMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDarkModeTooltip, setShowDarkModeTooltip] = useState(false);
  const amenityInputRef = useRef(null);
  const darkModeInputRef = useRef(null);

  // Fetch existing amenity details
  useEffect(() => {
    const fetchAmenity = async () => {
      try {
        const response = await axios.get(
          `${baseURL}amenity_setups/${id}.json`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        console.log(response.data);

        setName(response.data.name);
        setAmenityType(response.data.amenity_type || "");
        setNightMode(response.data.night_mode || false); // ✅ Set night mode from API

        // ✅ Correctly set the preview image
        if (response.data.attachfile?.document_url) {
          setPreviewImage(response.data.attachfile.document_url);
        }

        // ✅ Set dark mode icon preview if exists
        if (response.data.dark_mode_icon?.document_url) {
          setPreviewDarkModeImage(response.data.dark_mode_icon.document_url);
        }
      } catch (error) {
        console.error("Error fetching amenity:", error);
        toast.error("Failed to load amenity details.");
      }
    };

    if (id) {
      fetchAmenity();
    }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setIcon(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Added dark mode icon file change handler
  const handleDarkModeFileChange = (e) => {
    const file = e.target.files[0];
    setDarkModeIcon(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewDarkModeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("amenity_setup[name]", name);
    formData.append("amenity_setup[amenity_type]", amenityType);
    formData.append("amenity_setup[night_mode]", nightMode); // ✅ Added night mode to form data
    if (icon) {
      formData.append("icon", icon);
    }
    // ✅ Added dark mode icon to form data
    if (darkModeIcon) {
      formData.append("dark_mode_icon", darkModeIcon);
    }

    try {
      await axios.put(
        `${baseURL}amenity_setups/${id}.json`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Amenity updated successfully!");
      navigate("/setup-member/amenities-list");
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      toast.error(
        `Failed to update amenity: ${
          error.response?.data?.error || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // if (!name.trim() || !amenityType) {
    //   toast.dismiss();
    //   toast.error("Please fill in all required fields.");
    //   return false;
    // }
    return true;
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Sparkles size={16} strokeWidth={1.8} />
                </span>
                Edit Amenity
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Name"
                      required
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <div className="form-check">
                      <button
                        type="button"
                        onClick={() => setNightMode(!nightMode)}
                        className="toggle-button"
                        aria-pressed={nightMode}
                        aria-label="Night Mode"
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          padding: 0,
                          width: "40px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {nightMode ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="30"
                            fill="var(--red)"
                            className="bi bi-toggle-on"
                            viewBox="0 0 16 16"
                          >
                            <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="30"
                            fill="#667085"
                            className="bi bi-toggle-off"
                            viewBox="0 0 16 16"
                          >
                            <path d="M11 4a4 4 0 0 1 0 8H8a5 5 0 0 0 2-4 5 5 0 0 0-2-4zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8M0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5" />
                          </svg>
                        )}
                      </button>
                      <label className="form-check-label" htmlFor="nightMode">
                        Night Mode
                      </label>
                    </div>
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
                ref={amenityInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleFileChange}
                className="banner-upload-native-input"
              />
              <input
                ref={darkModeInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleDarkModeFileChange}
                className="banner-upload-native-input"
              />
              <div className="banner-upload-dropzone">
                <div className="banner-upload-item">
                  <button
                    type="button"
                    className="banner-upload-files-btn"
                    onClick={() => amenityInputRef.current?.click()}
                  >
                    <Upload size={16} strokeWidth={1.8} />
                    Upload Files
                  </button>
                  <span className="banner-upload-item-label">
                    Upload Amenity
                    <span
                      className="banner-upload-hint tooltip-container"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      [i]
                      {showTooltip && (
                        <span className="tooltip-text">
                          Max Upload Size 10 MB
                        </span>
                      )}
                    </span>
                    <span className="form-control-field__required">*</span>
                  </span>
                </div>
                <div className="banner-upload-item">
                  <button
                    type="button"
                    className="banner-upload-files-btn"
                    onClick={() => darkModeInputRef.current?.click()}
                  >
                    <Upload size={16} strokeWidth={1.8} />
                    Upload Files
                  </button>
                  <span className="banner-upload-item-label">
                    Upload Dark Mode Icon
                    <span
                      className="banner-upload-hint tooltip-container"
                      onMouseEnter={() => setShowDarkModeTooltip(true)}
                      onMouseLeave={() => setShowDarkModeTooltip(false)}
                    >
                      [i]
                      {showDarkModeTooltip && (
                        <span className="tooltip-text">
                          Max Upload Size 10 MB
                        </span>
                      )}
                    </span>
                    <span className="form-control-field__required">*</span>
                  </span>
                </div>
              </div>

              {(previewImage || previewDarkModeImage) && (
                <div className="d-flex flex-wrap gap-4 mt-3">
                  {previewImage && (
                    <div>
                      <div className="small text-muted mb-1">Amenity</div>
                      <img
                        src={previewImage}
                        alt="Uploaded Preview"
                        className="img-fluid rounded"
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          objectFit: "cover",
                          border: "1px solid #ccc",
                          padding: "5px",
                        }}
                      />
                    </div>
                  )}
                  {previewDarkModeImage && (
                    <div>
                      <div className="small text-muted mb-1">Dark Mode Icon</div>
                      <img
                        src={previewDarkModeImage}
                        alt="Dark Mode Preview"
                        className="img-fluid rounded"
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          objectFit: "cover",
                          border: "1px solid #ccc",
                          padding: "5px",
                        }}
                      />
                    </div>
                  )}
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

export default EditAmenities;