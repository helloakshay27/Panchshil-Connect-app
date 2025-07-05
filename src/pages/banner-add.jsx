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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const project_banner = [
    { key: 'banner_video_1_by_1', label: '1:1' },
    { key: 'banner_video_16_by_9', label: '16:9' },
    { key: 'banner_video_9_by_16', label: '9:16' },
    { key: 'banner_video_3_by_2', label: '3:2' },
  ];

  const bannerUploadConfig = {
    'banner video': ['1:1', '9:16', '16:9', '3:2'],
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
    if (isSubmitting) return; // Prevent multiple submissions 


    const hasProjectBanner1by1 = formData.banner_video_1_by_1
      && formData.banner_video_1_by_1.some(img => img.file instanceof File);


    if (!hasProjectBanner1by1) {
      toast.error("Banner Image with 1:1 ratio is required.");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const sendData = new FormData();
      sendData.append("banner[title]", formData.title);
      sendData.append("banner[project_id]", formData.project_id);

      // Object.entries(formData).forEach(([key, images]) => {
      //   if (key.startsWith("banner_video_") && Array.isArray(images)) {
      //     images.forEach((img) => {
      //       const backendField = key.replace("banner_video_", "banner[banner_video_") + "]";
      //       if (img.file instanceof File) {
      //         sendData.append(backendField, img.file);
      //       }
      //     });
      //   }
      // });

      Object.entries(formData).forEach(([key, images]) => {
        if (
          (key.startsWith("banner_video_") || key.startsWith("banner_image_")) &&
          Array.isArray(images)
        ) {
          images.forEach((img) => {
            const backendField = key.replace("banner_image_", "banner[banner_image_") + "]";
            if (img.file instanceof File) {
              // sendData.append(backendField, img.file);
              sendData.append(`banner[${key}]`, img.file);
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
        .scrollable-table {
          max-height: 300px;
          overflow-y: auto;
        }
        .tbl-container table {
          width: 100%;
          border-collapse: collapse;
        }
        .tbl-container th, .tbl-container td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
        .sticky-footer {
          position: sticky;
          bottom: 0;
          background: white;
          padding-top: 16px;
          z-index: 10;
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
                {/* Title Input */}
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
  
                {/* Project Select */}
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
  
                {/* Banner Attachment Upload */}
                <div className="col-md-3 col-sm-6 col-12">
                  <div className="form-group d-flex flex-column">
                    <label className="mb-2">
                      Banner Attachment{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowVideoTooltip(true)}
                        onMouseLeave={() => setShowVideoTooltip(false)}
                      >
                        [i]
                        {showVideoTooltip && (
                          <span className="tooltip-text">
                            9:16 or 1:1 Format Should Only Be Allowed
                          </span>
                        )}
                      </span>
                    </label>
  
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowUploader(true)}
                      className="custom-upload-button input-upload-button"
                    >
                      <span className="upload-button-label">Choose file</span>
                      <span className="upload-button-value">No file chosen</span>
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
  
              {/* Scrollable Image Table */}
              <div className="col-md-12 mt-4">
                <div className="scrollable-table tbl-container">
                  <table>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Preview</th>
                        <th>Ratio</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project_banner.map(({ key, label }) => {
                        const files = Array.isArray(formData[key]) ? formData[key] : formData[key] ? [formData[key]] : [];
  
                        return files.map((file, index) => {
                          const preview = file.preview || file.document_url || '';
                          const name = file.name || file.document_file_name || 'Unnamed';
  
                          return (
                            <tr key={`${key}-${index}`}>
                              <td>{name}</td>
                              <td>
                                <img
                                  style={{ maxWidth: 100, maxHeight: 100 }}
                                  className="img-fluid rounded"
                                  src={preview}
                                  alt={name}
                                />
                              </td>
                              <td>{file.ratio || label}</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() => discardImage(key, file)}
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
  
              {/* Sticky Footer Buttons */}
              <div className="row mt-4 sticky-footer justify-content-center">
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
      </div>

  </div>
  );
  
};

export default BannerAdd;