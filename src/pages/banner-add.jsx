import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";

const BannerAdd = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [previewImg, setPreviewImg] = useState(null);
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [image, setImage] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState(null);

  const [formData, setFormData] = useState({
    banner_type: null,
    banner_redirect: null,
    project_id: null,
    title: "",
    active: null,
  });

  console.log("formData", formData);

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
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    return () => {
      if (previewImg) URL.revokeObjectURL(previewImg);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is mandatory");
      setErrors({ title: "Title is required" });
      return false;
    }

    if (!formData.project_id || String(formData.project_id).trim() === "") {
      toast.error("Project is mandatory");
      setErrors({ project_id: "Project is required" });
      return false;
    }

    setErrors({});
    return true;
  };

  const getFileInfo = (file) => {
    if (!file || !(file instanceof File)) return null;
    return {
      id: Math.floor(Math.random() * 10000),
      document_file_name: file.name,
      document_content_type: file.type,
      size: file.size,
    };
  };

  const bannerUploadConfig = {
    'banner video': ['1:1', '9:16']
  };

  const currentUploadType = 'banner video';
  const selectedRatios = bannerUploadConfig[currentUploadType] || [];
  const dynamicLabel = currentUploadType.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  const dynamicDescription = `Supports ${selectedRatios.join(', ')} aspect ratios`;

  const updateFormData = (key, files) => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...files],
    }));
  };

  const handleCropComplete = (validImages) => {
    if (!validImages || validImages.length === 0) {
      toast.error("No valid images selected.");
      setShowUploader(false);
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(':', '_by_'); // e.g., "1:1" -> "1_by_1", "9:16" -> "9_by_16"
      const key = `banner_video_${formattedRatio}`; // e.g., banner_video_1_by_1, banner_video_9_by_16

      updateFormData(key, [img]);
    });

    setPreviewImg(validImages[0].preview);
    setShowUploader(false);
  };

  const discardImage = (key, imageToRemove) => {
    setFormData((prev) => {
      const updatedArray = (prev[key] || []).filter(
        (img) => img.id !== imageToRemove.id
      );

      const newFormData = { ...prev };
      if (updatedArray.length === 0) {
        delete newFormData[key];
      } else {
        newFormData[key] = updatedArray;
      }

      return newFormData;
    });

    if (previewImg === imageToRemove.preview) {
      setPreviewImg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const sendData = new FormData();
      sendData.append("banner[title]", formData.title);
      sendData.append("banner[project_id]", formData.project_id);

      Object.entries(formData).forEach(([key, images]) => {
        if (key.startsWith("banner_video_") && Array.isArray(images)) {
          images.forEach((img) => {
            const backendField = key.replace("banner_video_", "banner[banner_video_") + "]";
            if (img.file instanceof File) {
              sendData.append(backendField, img.file);
            }
          });
        }
      });

      console.log("data to be sent:", Array.from(sendData.entries()));

      await axios.post(`${baseURL}banners.json`, sendData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Banner created successfully");
      navigate("/banner-list");
    } catch (error) {
      console.error(error);
      toast.error(`Error creating banner: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-content">
      <style jsx>{`
        .btn-primary {
          background: #f1f5f9;
          color: #1f2937;
          padding: 8px 16px;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          margin-left: 10px;
          height: 38px;
          display: inline-flex;
          align-items: center;
        }
        .btn-primary:hover {
          background: #e2e8f0;
        }
      `}</style>

      <div className="website-content overflow-hidden">
        <div className="module-data-section">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Create Banner</h3>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Title<span className="otp-asterisk"> *</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter title"
                    />
                    {errors.title && <span className="text-danger">{errors.title}</span>}
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Project<span className="otp-asterisk"> *</span>
                    </label>
                    <SelectBox
                      options={projects.map((project) => ({
                        label: project.project_name,
                        value: project.id,
                      }))}
                      value={formData.project_id}
                      onChange={(value) => setFormData({ ...formData, project_id: value })}
                    />
                    {errors.project_id && <span className="text-danger">{errors.project_id}</span>}
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Banner Attachment{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowVideoTooltip(true)}
                        onMouseLeave={() => setShowVideoTooltip(false)}
                      >
                        [i]
                        {showVideoTooltip && (
                          <span className="tooltip-text">1:1 or 9:16 Format Should Be Used</span>
                        )}
                      </span>
                    </label>

                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowUploader(true)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        overflow: "hidden",
                        fontSize: "14px",
                        cursor: "pointer"
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#f8f9fa",
                          padding: "8px 16px",
                          borderRight: "1px solid #ccc"
                        }}
                      >
                        Choose file
                      </span>
                      <span style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                        No file chosen
                      </span>
                    </span>

                    {showUploader && (
                      <ProjectBannerUpload
                        onClose={() => setShowUploader(false)}
                        includeInvalidRatios={false}
                        selectedRatioProp={selectedRatios}
                        showAsModal={true}
                        label={dynamicLabel}
                        description={dynamicDescription}
                        onContinue={handleCropComplete}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Preview</th>
                        <th>Ratio</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...(formData.banner_video_1_by_1 || []).map((file) => ({
                        ...file,
                        type: "banner_video_1_by_1",
                      })),
                      ...(formData.banner_video_9_by_16 || []).map((file) => ({
                        ...file,
                        type: "banner_video_9_by_16",
                      }))].map((file, index) => (
                        <tr key={index}>
                          <td>{file.name}</td>
                          <td>
                            <img
                              style={{ maxWidth: 100, maxHeight: 100 }}
                              className="img-fluid rounded"
                              src={file.preview}
                              alt={file.name}
                            />
                          </td>
                          <td>{file.ratio}</td>
                          <td>
                            <button
                              type="button"
                              className="purple-btn2"
                              onClick={() => discardImage(file.type, file)}
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button onClick={handleSubmit} className="purple-btn2 w-100" disabled={loading}>
                Submit
              </button>
            </div>
            <div className="col-md-2">
              <button type="button" className="purple-btn2 w-100" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerAdd;