import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import ProjectImageVideoUpload from "../components/reusable/ProjectImageVideoUpload";

const BannerAdd = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    banner_video: null,
    active: true,
    banner_video_1_by_1: null,
    banner_video_9_by_16: null,
    banner_video_16_by_9: null,
    banner_video_3_by_2: null,
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
      if (previewVideo) URL.revokeObjectURL(previewVideo);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is mandatory";
    if (!formData.project_id) newErrors.project_id = "Project is mandatory";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //   const validateForm = () => {
  //   if (!formData.title.trim()) {
  //     toast.error("Title is mandatory");
  //     setErrors({ title: "Title is required" });
  //     return false;
  //   }

  //   if (!formData.project_id || String(formData.project_id).trim() === "") {
  //     toast.error("Project is mandatory");
  //     setErrors({ project_id: "Project is required" });
  //     return false;
  //   }

  //   setErrors({});
  //   return true;
  // };

  // const getFileInfo = (file) => {
  //   if (!file || !(file instanceof File)) return null;
  //   return {
  //     id: Math.floor(Math.random() * 10000),
  //     document_file_name: file.name,
  //     document_content_type: file.type,
  //     size: file.size,
  //   };
  // };

  const project_banner = [
    { key: "banner_video_1_by_1", label: "1:1" },
    { key: "banner_video_16_by_9", label: "16:9" },
    { key: "banner_video_9_by_16", label: "9:16" },
    { key: "banner_video_3_by_2", label: "3:2" },
  ];

  const bannerUploadConfig = {
    "Banner Attachment": ["1:1", "9:16", "16:9", "3:2"],
  };

  const currentUploadType = "Banner Attachment";
  const selectedRatios = bannerUploadConfig[currentUploadType] || [];
  const dynamicLabel = currentUploadType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const dynamicDescription = `Supports ${selectedRatios.join(
    ", "
  )} aspect ratios`;

  // const updateFormData = (key, files) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [key]: [...(prev[key] || []), ...files],
  //   }));
  // };

  // const handleCropComplete = (validImages) => {
  //   if (!validImages || validImages.length === 0) {
  //     toast.error("No valid images selected.");
  //     setShowUploader(false);
  //     return;
  //   }

  //   validImages.forEach((img) => {
  //     const formattedRatio = img.ratio.replace(':', '_by_'); // e.g., "1:1" -> "1_by_1", "9:16" -> "9_by_16"
  //     const key = `banner_video_${formattedRatio}`; // e.g., banner_video_1_by_1, banner_video_9_by_16

  //     updateFormData(key, [img]);
  //   });

  //   setPreviewImg(validImages[0].preview);
  //   setShowUploader(false);
  // };

  const updateFormData = (key, files) => {
    setFormData((prev) => ({
      ...prev,
      [key]: files, // Replace existing files instead of appending
    }));
  };

  const handleCropComplete = (validImages, videoFiles = []) => {
    // Handle video files first
    if (videoFiles && videoFiles.length > 0) {
      videoFiles.forEach((video) => {
        const formattedRatio = video.ratio.replace(":", "_by_");
        const key = `banner_video_${formattedRatio}`;
        updateFormData(key, [video]);

        // Set preview for the first video
        if (videoFiles[0] === video) {
          setPreviewVideo(URL.createObjectURL(video.file));
        }
      });
      setShowUploader(false); // Close modal here
      return;
    }

    // Handle images
    if (!validImages || validImages.length === 0) {
      toast.error("No valid files selected.");
      setShowUploader(false);
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "_by_");
      const key = `banner_video_${formattedRatio}`;
      updateFormData(key, [img]);

      // Set preview for the first image
      if (validImages[0] === img) {
        setPreviewImg(img.preview);
      }
    });

    setShowUploader(false); // Ensure modal closes after image handling
  };

  const discardImage = (key, imageToRemove) => {
    setFormData((prev) => {
      const updatedArray = (prev[key] || []).filter(
        (img) => img.id !== imageToRemove.id
      );

      // Remove the key if the array becomes empty
      const newFormData = { ...prev };
      if (updatedArray.length === 0) {
        delete newFormData[key];
      } else {
        newFormData[key] = updatedArray;
      }

      return newFormData;
    });

    // If the removed image is being previewed, reset preview
    if (previewImg === imageToRemove.preview) {
      setPreviewImg(null);
    }
    if (previewVideo === imageToRemove.preview) {
      setPreviewVideo(null);
    }
  };

  //  const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   if (isSubmitting) return; // Prevent multiple submissions

  //   const hasProjectBanner1by1 = formData.banner_video_1_by_1
  //     && formData.banner_video_1_by_1.some(img => img.file instanceof File);

  //   if (!hasProjectBanner1by1) {
  //     toast.error("Banner Attachment with 1:1 ratio is required.");
  //     setLoading(false);
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   if (!validateForm()) {
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const sendData = new FormData();
  //     sendData.append("banner[title]", formData.title);
  //     sendData.append("banner[project_id]", formData.project_id);

  //     // Object.entries(formData).forEach(([key, images]) => {
  //     //   if (key.startsWith("banner_video_") && Array.isArray(images)) {
  //     //     images.forEach((img) => {
  //     //       const backendField = key.replace("banner_video_", "banner[banner_video_") + "]";
  //     //       if (img.file instanceof File) {
  //     //         sendData.append(backendField, img.file);
  //     //       }
  //     //     });
  //     //   }
  //     // });

  //     Object.entries(formData).forEach(([key, images]) => {
  //       if (
  //         (key.startsWith("banner_video_") || key.startsWith("banner_image_")) &&
  //         Array.isArray(images)
  //       ) {
  //         images.forEach((img) => {
  //           const backendField = key.replace("banner_image_", "banner[banner_image_") + "]";
  //           if (img.file instanceof File) {
  //             // sendData.append(backendField, img.file);
  //             sendData.append(`banner[${key}]`, img.file);
  //           }
  //         });
  //       }
  //     });

  //     console.log("data to be sent:", Array.from(sendData.entries()));

  //     await axios.post(`${baseURL}banners.json`, sendData, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     toast.success("Banner created successfully");
  //     navigate("/banner-list");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(`Error creating banner: ${error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const banner1by1 = formData.banner_video_1_by_1;
    const hasProjectBanner1by1 = Array.isArray(banner1by1)
      ? banner1by1.some((img) => img?.file instanceof File)
      : !!(banner1by1?.file instanceof File);

    if (!hasProjectBanner1by1) {
      toast.error("Banner Attachment with 1:1 ratio is required.");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append("banner[title]", formData.title);
      sendData.append("banner[project_id]", formData.project_id);

      // Handle banner video/image fields
      Object.entries(formData).forEach(([key, images]) => {
        if (
          (key.startsWith("banner_video_") ||
            key.startsWith("banner_image_")) &&
          Array.isArray(images)
        ) {
          images.forEach((img) => {
            if (img.file instanceof File) {
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
        .tbl-container th,
        .tbl-container td {
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

      <div className="module-data-section container-fluid overflow-hidden">
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
                    {errors.title && (
                      <span className="text-danger">{errors.title}</span>
                    )}
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
                      onChange={(value) =>
                        setFormData({ ...formData, project_id: value })
                      }
                    />
                    {errors.project_id && (
                      <span className="text-danger">{errors.project_id}</span>
                    )}
                  </div>
                </div>

                {/* <div className="col-md-3 col-sm-6 col-12">
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
              </div> */}

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
                      <span className="otp-asterisk"> *</span>
                    </label>

                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowUploader(true)}
                      className="custom-upload-button input-upload-button"
                    >
                      <span className="upload-button-label">Choose file</span>
                      <span className="upload-button-value">
                        No file chosen
                      </span>
                    </span>

                    {showUploader && (
                      <ProjectImageVideoUpload
                        onClose={() => setShowUploader(false)}
                        includeInvalidRatios={false}
                        selectedRatioProp={selectedRatios}
                        showAsModal={true}
                        label={dynamicLabel}
                        description={dynamicDescription}
                        onContinue={handleCropComplete}
                        allowVideos={true}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Media Table */}
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
                        const files = Array.isArray(formData[key])
                          ? formData[key]
                          : formData[key]
                          ? [formData[key]]
                          : [];

                        return files.map((file, index) => {
                          const preview =
                            file.preview || file.document_url || "";
                          const name =
                            file.name || file.document_file_name || "Unnamed";
                          const isVideo =
                            file.type === "video" ||
                            file.file?.type?.startsWith("video/") ||
                            preview.endsWith(".mp4") ||
                            preview.endsWith(".webm") ||
                            preview.endsWith(".gif") ||
                            preview.endsWith(".ogg");

                          return (
                            <tr key={`${key}-${index}`}>
                              <td>{name}</td>
                              <td>
                                {isVideo ? (
                                  <video
                                    controls
                                    style={{ maxWidth: 100, maxHeight: 100 }}
                                    className="img-fluid rounded"
                                  >
                                    <source
                                      src={preview}
                                      type={
                                        file.file?.type ||
                                        `video/${preview.split(".").pop()}`
                                      }
                                    />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <img
                                    style={{ maxWidth: 100, maxHeight: 100 }}
                                    className="img-fluid rounded"
                                    src={preview}
                                    alt={name}
                                  />
                                )}
                              </td>
                              <td>{file.ratio || label}</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    handleFetchedDiscardGallery(
                                      key,
                                      index,
                                      file.id
                                    )
                                  }
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
            </div>
          </div>
          <div className="row mt-4 sticky-footer justify-content-center">
            <div className="col-md-2">
              <button
                onClick={handleSubmit}
                className="purple-btn2 w-100"
                disabled={loading}
              >
                Submit
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="purple-btn2 w-100"
                onClick={handleCancel}
              >
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
