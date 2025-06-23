import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../root-mor.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { ImageCropper } from "../components/reusable/ImageCropper";

const BannerAdd = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [image, setImage] = useState(null); // Changed to single file object
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now());
  const [fileType, setFileType] = useState(null); // Tracks if the file is image or video

  const [formData, setFormData] = useState({
    banner_type: "",
    banner_redirect: "",
    project_id: "",
    title: "",
    banner_video: [],
    active: true,
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

    // Cleanup ObjectURLs on component unmount
    return () => {
      if (previewVideo) {
        URL.revokeObjectURL(previewVideo);
      }
      if (previewImg) {
        URL.revokeObjectURL(previewImg);
      }
      if (image?.data_url) {
        URL.revokeObjectURL(image.data_url);
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff", "image/gif"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv", "video/x-flv"];

    const sizeInMB = file.size / (1024 * 1024);

    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      toast.error("❌ Please upload a valid image or video file.");
      setImage(null);
      setFileType(null);
      return;
    }

    if (isImage && sizeInMB > 3) {
      toast.error("❌ Image size must be less than 3MB.");
      setImage(null);
      setFileType(null);
      return;
    }

    if (isVideo && sizeInMB > 20) {
      toast.error("❌ Video size must be less than 20MB.");
      setImage(null);
      setFileType(null);
      return;
    }

    // Revoke previous ObjectURLs
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo);
    }
    if (previewImg) {
      URL.revokeObjectURL(previewImg);
    }
    if (image?.data_url) {
      URL.revokeObjectURL(image.data_url);
    }

    setFileType(isVideo ? "video" : "image");
    setImage({ file, data_url: URL.createObjectURL(file) });

    if (isVideo) {
      setPreviewVideo(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, banner_video: file }));
      setPreviewImg(null);
      setVideoKey(Date.now());
    } else if (isImage) {
      setDialogOpen(true); // Open ImageCropper for all images
      setPreviewVideo(null);
      setPreviewImg(null); // Clear preview until cropping is done
    }

    console.log("File:", file);
    console.log("Is Video:", isVideo);
    console.log("File Type:", fileType);
  };

  const handleCropComplete = (cropped) => {
    if (cropped) {
      setCroppedImage(cropped.base64);
      setPreviewImg(cropped.base64);
      setFormData((prev) => ({ ...prev, banner_video: cropped.file }));
    } else {
      setImage(null);
      setPreviewImg(null);
      setFormData((prev) => ({ ...prev, banner_video: null }));
    }
    setDialogOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
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

      if (image?.file instanceof File) {
        sendData.append("banner[banner_video]", image.file);
      } else {
        sendData.append("banner[banner_video]", formData.banner_video);
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
      console.log(error);
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

                {/* Banner Attachment Upload */}
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
                          <span className="tooltip-text">16:9 Format Should Only Be Allowed</span>
                        )}
                      </span>
                    </label>

                    {/* Always show input field */}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff,image/gif,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/x-flv"
                      onChange={handleFileUpload}

                    />

                    {/* Preview for video */}
                    {fileType === "video" && previewVideo && (
                      <div className="mt-2">
                        <video
                          key={videoKey}
                          autoPlay
                          muted
                          controls
                          src={previewVideo}
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Image cropper will show if dialogOpen is true */}
                    {fileType === "image" && image && (
                      <ImageCropper
                        open={dialogOpen}
                        image={image.data_url}
                        onComplete={handleCropComplete}
                        requiredRatios={[1, 9 / 16]}
                        requiredRatioLabel="1:1 or 9:16"
                        allowedRatios={[
                          { label: "16:9", ratio: 16 / 9 },
                          { label: "9:16", ratio: 9 / 16 },
                          { label: "1:1", ratio: 1 },
                        ]}
                        containerStyle={{
                          position: "relative",
                          width: "100%",
                          height: 300,
                          background: "#fff",
                        }}
                      />
                    )}

                    {/* Preview for image */}
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
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Buttons */}
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