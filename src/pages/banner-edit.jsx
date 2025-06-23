import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { ImageCropper } from "../components/reusable/ImageCropper";
import "../root-mor.css";


const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [image, setImage] = useState(null); // Single file object
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now());
  const [fileType, setFileType] = useState(null); // Tracks if file is image or video

  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    banner_video: null,
    active: true,
  });

  console.log("formData", formData);

  useEffect(() => {
    fetchBanner();
    fetchProjects();
    return () => {
      if (previewImg) URL.revokeObjectURL(previewImg);
      if (previewVideo) URL.revokeObjectURL(previewVideo);
      if (image?.data_url) URL.revokeObjectURL(image.data_url);
    };
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await axios.get(`${baseURL}banners/${id}.json`);
      if (response.data) {
        setFormData({
          title: response.data.title,
          project_id: response.data.project_id,
          banner_video: response.data.banner_video?.document_url || null,
          active: true,
        });
        if (response.data.banner_video?.document_url) {
          const isImage = isImageFile(response.data.banner_video.document_url);
          setFileType(isImage ? "image" : "video");
          if (isImage) {
            setPreviewImg(response.data.banner_video.document_url); // Set preview for existing image
          } else {
            setPreviewVideo(response.data.banner_video.document_url); // Set preview for existing video
          }
        }
      }
    } catch (error) {
      toast.error("Failed to fetch banner data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${baseURL}projects.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setProjects(response.data.projects || []);
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

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
    if (previewVideo) URL.revokeObjectURL(previewVideo);
    if (previewImg) URL.revokeObjectURL(previewImg);
    if (image?.data_url) URL.revokeObjectURL(image.data_url);

    setFileType(isVideo ? "video" : "image");
    setImage({ file, data_url: URL.createObjectURL(file) });

    if (isVideo) {
      setPreviewVideo(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, banner_video: file }));
      setPreviewImg(null);
      setVideoKey(Date.now());
    } else if (isImage) {
      setDialogOpen(true); // Open ImageCropper for images
      setPreviewVideo(null);
      setPreviewImg(null); // Clear preview until cropping is done
    }
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
    let newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is mandatory";
    if (!formData.project_id) newErrors.project_id = "Project is mandatory";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append("banner[title]", formData.title);
      sendData.append("banner[project_id]", formData.project_id);

      if (image?.file instanceof File) {
        sendData.append("banner[banner_video]", image.file);
      } else if (formData.banner_video instanceof File) {
        sendData.append("banner[banner_video]", formData.banner_video);
      }

      const res = await axios.put(`${baseURL}banners/${id}.json`, sendData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Banner updated successfully");
      navigate("/banner-list");
    } catch (error) {
      toast.error("Error updating banner");
    } finally {
      setLoading(false);
    }
  };

  const isImageFile = (file) => {
    if (!file) return false;
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"];
    if (typeof file === "string") {
      const extension = file.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(extension);
    }
    return file.type && imageTypes.includes(file.type);
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card mt-4">
            <div className="card-header">
              <h3 className="card-title">Edit Banner</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Title
                        <span className="text-danger"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                      {errors.title && <span className="text-danger">{errors.title}</span>}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Project
                        <span className="text-danger"> *</span>
                      </label>
                      <SelectBox
                        options={projects.map((p) => ({
                          label: p.project_name,
                          value: p.id,
                        }))}
                        defaultValue={formData.project_id}
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
                            <span className="tooltip-text">16:9 Format Should Only Be Allowed</span>
                          )}
                        </span>
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff,image/gif,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/x-flv"
                        onChange={handleFileUpload}
                      />
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
                      {!previewImg && !previewVideo && formData.banner_video && (
                        <div className="mt-2">
                          {isImageFile(formData.banner_video) ? (
                            <img
                              src={formData.banner_video}
                              className="img-fluid rounded"
                              alt="Image Preview"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <video
                              src={formData.banner_video}
                              controls
                              className="img-fluid rounded"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
          <button onClick={handleCancel} className="purple-btn2 w-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerEdit;