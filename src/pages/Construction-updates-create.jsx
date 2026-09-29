import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ClipboardList, FileText, Upload } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import MultiSelectBox from "../components/base/MultiSelectBox";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ConstructionUpdatesCreate = () => {
  const connectEvents = useConnectEvents();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [onDate, setOnDate] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [eventUserID, setEventUserID] = useState([]);
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [buildingTypesLoading, setBuildingTypesLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    user_id: "",
    project_id: "",
    site_id: "",
    building_id: "",
  });
  
  const [errors, setErrors] = useState({});
  const attachmentInputRef = useRef(null);

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
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${baseURL}users/get_users.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setEventUserID(response?.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchSites = async () => {
      setSitesLoading(true);
      try {
        const response = await axios.get(`${baseURL}sites.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.data && Array.isArray(response.data)) {
          setSites(response.data);
        } else if (response.data && Array.isArray(response.data.sites)) {
          setSites(response.data.sites);
        } else {
          console.error("Invalid sites data format:", response.data);
          toast.error("Failed to load sites: Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching sites:", error);
        toast.error("Failed to load sites");
      } finally {
        setSitesLoading(false);
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    const fetchBuildingTypes = async () => {
      setBuildingTypesLoading(true);
      try {
        const response = await axios.get(`${baseURL}building_types.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        
        const buildingTypesData = response.data || [];
        setBuildingTypes(buildingTypesData);
      } catch (error) {
        console.error("Error fetching building types:", error);
        toast.error("Failed to load building types");
      } finally {
        setBuildingTypesLoading(false);
      }
    };

    fetchBuildingTypes();
  }, []);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);

    if (file) {
      const fileType = file.type;
      
      // Check if it's an image
      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      } 
      // Check if it's a video
      else if (fileType.startsWith('video/')) {
        const videoUrl = URL.createObjectURL(file);
        setPreviewImage(videoUrl);
      } 
      // For other file types (PDF, DOC, etc.)
      else {
        setPreviewImage(null);
      }
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("construction_update[title]", title);
    formDataToSend.append("construction_update[description]", description);
    formDataToSend.append("construction_update[user_id]", formData.user_id);
    formDataToSend.append("construction_update[status]", status);
    formDataToSend.append("construction_update[project_id]", formData.project_id);
    formDataToSend.append("construction_update[site_id]", formData.site_id);
    formDataToSend.append("construction_update[building_id]", formData.building_id);
    formDataToSend.append("construction_update[on_date]", onDate);
    
    if (attachment) {
      formDataToSend.append("construction_update[attachment]", attachment);
    }

    try {
      await axios.post(`${baseURL}construction_updates.json`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      connectEvents.onRecordSaved({ mode: "added" });
      toast.success("Construction update added successfully");
      resetForm();
      navigate("/setup-member/construction-updates-list");
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Construction update with this title already exists.");
      } else {
        toast.error(`Error adding construction update: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("active");
    setOnDate("");
    setAttachment(null);
    setPreviewImage(null);
    setFormData({
      user_id: "",
      project_id: "",
      site_id: "",
      building_id: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    // if (!formData.user_id) newErrors.user_id = "User selection is required";
    // if (!formData.project_id) newErrors.project_id = "Project selection is required";
    // if (!formData.site_id) newErrors.site_id = "Site selection is required";
    // if (!formData.building_id) newErrors.building_id = "Building type selection is required";
    // if (!onDate) newErrors.onDate = "Date is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all the required fields.");
      return false;
    }
    return true;
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <ClipboardList size={16} strokeWidth={1.8} />
                </span>
                Create Construction Update
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Title"
                      required
                      placeholder="Enter title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    {errors.title && (
                      <span className="error text-danger">{errors.title}</span>
                    )}
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Description"
                      required
                      placeholder="Enter description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    {errors.description && (
                      <span className="error text-danger">
                        {errors.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <MultiSelectBox
                      label="User"
                      placeholder="Select User"
                      options={eventUserID.map((user) => ({
                        value: user.id,
                        label: `${user.firstname} ${user.lastname}`,
                      }))}
                      value={
                        formData.user_id
                          ? formData.user_id.split(",").map((id) => {
                              const user = eventUserID.find(
                                (u) => u.id.toString() === id
                              );
                              return {
                                value: id,
                                label: `${user?.firstname} ${user?.lastname}`,
                              };
                            })
                          : []
                      }
                      onChange={(selectedOptions) =>
                        setFormData((prev) => ({
                          ...prev,
                          user_id: selectedOptions
                            .map((option) => option.value)
                            .join(","),
                        }))
                      }
                    />
                    {errors.user_id && (
                      <span className="error text-danger">
                        {errors.user_id}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Project"
                      placeholder="Select Project"
                      options={projects.map((project) => ({
                        label: project.project_name,
                        value: project.id,
                      }))}
                      value={formData.project_id}
                      onChange={(value) =>
                        setFormData({ ...formData, project_id: value })
                      }
                    />
                    {errors.project_id && (
                      <span className="error text-danger">
                        {errors.project_id}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Site"
                      placeholder={
                        sitesLoading ? "Loading..." : "Select Site"
                      }
                      options={
                        sites.length > 0
                          ? sites.map((site) => ({
                              value: site.id,
                              label: site.name,
                            }))
                          : [{ value: "", label: "No sites found" }]
                      }
                      value={formData.site_id}
                      onChange={(value) =>
                        setFormData({ ...formData, site_id: value })
                      }
                    />
                    {errors.site_id && (
                      <span className="error text-danger">{errors.site_id}</span>
                    )}
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Building Type"
                      placeholder={
                        buildingTypesLoading
                          ? "Loading..."
                          : "Select Building Type"
                      }
                      options={
                        buildingTypes.length > 0
                          ? buildingTypes.map((building) => ({
                              value: building.id,
                              label: building.building_type,
                            }))
                          : [{ value: "", label: "No building types found" }]
                      }
                      value={formData.building_id}
                      onChange={(value) =>
                        setFormData({ ...formData, building_id: value })
                      }
                    />
                    {errors.building_id && (
                      <span className="error text-danger">
                        {errors.building_id}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Date"
                      type="date"
                      value={onDate}
                      onChange={(e) => setOnDate(e.target.value)}
                    />
                    {errors.onDate && (
                      <span className="error text-danger">{errors.onDate}</span>
                    )}
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
                accept=".png,.jpg,.jpeg,.svg,.pdf,.doc,.docx,.mp4,.mov,.avi,.mkv,.webm"
                onChange={handleFileChange}
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
                <span
                  className="banner-upload-hint tooltip-container"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  [i]
                  {showTooltip && (
                    <span className="tooltip-text">
                      Max Upload Size 10 MB - Supports Images, Videos, PDF, DOC
                    </span>
                  )}
                </span>
              </div>

              {previewImage && attachment && (
                <div className="mt-3">
                  {attachment.type.startsWith("image/") ? (
                    <img
                      src={previewImage}
                      alt="Attachment Preview"
                      className="img-fluid rounded"
                      style={{
                        maxWidth: "100px",
                        maxHeight: "100px",
                        objectFit: "cover",
                        border: "1px solid #ccc",
                        padding: "5px",
                      }}
                    />
                  ) : attachment.type.startsWith("video/") ? (
                    <video
                      src={previewImage}
                      controls
                      className="img-fluid rounded"
                      style={{
                        maxWidth: "150px",
                        maxHeight: "100px",
                        objectFit: "cover",
                        border: "1px solid #ccc",
                        padding: "5px",
                      }}
                    />
                  ) : (
                    <div
                      className="file-preview d-flex align-items-center justify-content-center rounded"
                      style={{
                        width: "100px",
                        height: "100px",
                        border: "1px solid #ccc",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <div className="text-center">
                        <i className="fas fa-file fa-2x text-secondary mb-1"></i>
                        <div className="small text-muted">
                          {attachment.name.split(".").pop().toUpperCase()}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="small text-muted mt-1">
                    {attachment.name} (
                    {(attachment.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
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
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConstructionUpdatesCreate;