import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FileText, Settings, Upload } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ProjectConfigEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const iconInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    active: "1",
    icon: null,
  });

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const response = await axios.get(
          `${baseURL}configuration_setups/${id}.json`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        setFormData({
          name: response.data.name,
          active: response.data.active ? "1" : "0",
          icon: null,
        });

        if (response.data.attachfile?.document_url) {
          setIconPreview(response.data.attachfile.document_url);
        }
      } catch (error) {
        toast.error("Failed to load configuration data");
      }
    };
    fetchConfiguration();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleIconChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        icon: file,
      }));
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveIcon = () => {
    setFormData((prevData) => ({
      ...prevData,
      icon: null,
    }));
    setIconPreview(null);
    if (iconInputRef.current) {
      iconInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("configuration_setup[name]", formData.name);
    formDataToSend.append("configuration_setup[active]", formData.active);
    if (formData.icon) {
      formDataToSend.append("configuration_setup[icon]", formData.icon);
    }

    try {
      await axios.put(
        `${baseURL}configuration_setups/${id}.json`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Project configuration updated successfully!");
      navigate("/setup-member/project-configuration-list");
    } catch (error) {
      toast.error("Failed to update configuration");
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
                  <Settings size={16} strokeWidth={1.8} />
                </span>
                Edit Project Configuration
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
                      value={formData.name}
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
                ref={iconInputRef}
                type="file"
                name="icon"
                accept=".png,.jpg,.jpeg,.svg,.gif,.webp"
                onChange={handleIconChange}
                className="banner-upload-native-input"
              />
              <div className="banner-upload-dropzone">
                <button
                  type="button"
                  className="banner-upload-files-btn"
                  onClick={() => iconInputRef.current?.click()}
                >
                  <Upload size={16} strokeWidth={1.8} />
                  Upload Files
                </button>
                <span
                  className="banner-upload-hint tooltip-container"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  [i]
                  {showTooltip && (
                    <span className="tooltip-text">Max Upload Size 10 MB</span>
                  )}
                </span>
              </div>

              {iconPreview && (
                <div className="mt-3 position-relative d-inline-block">
                  <img
                    src={iconPreview}
                    alt="Icon Preview"
                    className="img-thumbnail"
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
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
                    onClick={handleRemoveIcon}
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
              {loading ? "Updating..." : "Update"}
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

export default ProjectConfigEdit;
