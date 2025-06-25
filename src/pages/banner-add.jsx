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
    banner_video: null,
    banner_video_1_by_1: null,
    banner_video_9_by_16: null,
    banner_video_16_by_9: null,
    banner_video_3_by_2: null,
    active: null,
  });

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

  const handleCropComplete = (croppedList) => {
    const cropped = croppedList?.[0];
    if (cropped && cropped.file) {
      const file = cropped.file;
      const objectURL = URL.createObjectURL(file);

      setPreviewImg(objectURL);

      const ratioString = cropped.ratio; // expected to be "9:16", etc.
      setSelectedRatio(ratioString);

      setFormData((prev) => ({
        ...prev,
        banner_video: file,
        banner_video_1_by_1: ratioString === "1:1" ? file : null,
        banner_video_9_by_16: ratioString === "9:16" ? file : null,
        banner_video_16_by_9: ratioString === "16:9" ? file : null,
        banner_video_3_by_2: ratioString === "3:2" ? file : null,
      }));
    } else {
      setImage(null);
      setPreviewImg(null);
      setSelectedRatio(null);
      setFormData((prev) => ({
        ...prev,
        banner_video: null,
        banner_video_1_by_1: null,
        banner_video_9_by_16: null,
        banner_video_16_by_9: null,
        banner_video_3_by_2: null,
      }));
    }

    setShowUploader(false);
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

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;

  //   const finalMockData = {
  //     id: "",
  //     title: formData.title,
  //     project_id: formData.project_id,
  //     banner_type: formData.banner_type,
  //     banner_redirect: formData.banner_redirect,
  //     active: formData.active,
  //     company_id: null,
  //     company_name: null,
  //     video_url: null,
  //     video_preview_image_url: null,
  //     banner_video_1_by_1: getFileInfo(formData.banner_video_1_by_1),
  //     banner_video_9_by_16: getFileInfo(formData.banner_video_9_by_16),
  //     banner_video_16_by_9: getFileInfo(formData.banner_video_16_by_9),
  //     banner_video_3_by_2: getFileInfo(formData.banner_video_3_by_2),
  //   };

  //   console.log("🟢 Mock Submission Data:", finalMockData);
  // };
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

      const ratioToFileMap = {
        "1:1": formData.banner_video_1_by_1,
        "9:16": formData.banner_video_9_by_16,
        "16:9": formData.banner_video_16_by_9,
        "3:2": formData.banner_video_3_by_2,
      };

      const ratioToFieldMap = {
        "1:1": "banner[banner_video_1_by_1]",
        "9:16": "banner[banner_video_9_by_16]",
        "16:9": "banner[banner_video_16_by_9]",
        "3:2": "banner[banner_video_3_by_2]",
      };

      const selectedFile = ratioToFileMap[selectedRatio];
      const backendKey = ratioToFieldMap[selectedRatio];

      if (selectedFile instanceof File && backendKey) {
        sendData.append(backendKey, selectedFile);
      } else {
        toast.error("No valid banner image selected.");
        setLoading(false);
        return;
      }

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
                {/* Title */}
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

                {/* Project */}
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

                {/* Banner Upload */}
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
                      className="d-inline-block btn btn-primary mt-2"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowUploader(true)}
                    >
                      Choose Banner Image
                    </span>

                    {showUploader && (
                      <ProjectBannerUpload
                        onClose={() => setShowUploader(false)}
                        includeInvalidRatios={false}
                        selectedRatioProp={["1:1"]}
                        showAsModal={true}
                        label="Banner Image"
                        description="Supports 1:1 and 9:16 ratios"
                        onContinue={handleCropComplete}
                      />
                    )}

                    {previewImg && (
                      <div className="mt-2">
                        <img
                          src={previewImg}
                          className="img-fluid rounded"
                          alt="Preview"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit/Cancel Buttons */}
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
