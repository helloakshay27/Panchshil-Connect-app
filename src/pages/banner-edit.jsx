import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
   const [showVideoTooltip, setShowVideoTooltip] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    // attachfile: null,
    // existingImages: [],
    banner_video: [],
    active: true,

  });

  useEffect(() => {
    fetchBanner();
    fetchProjects();
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await axios.get(`${baseURL}banners/${id}.json`);
      if (response.data) {
        setFormData({
          title: response.data.title,
          project_id: response.data.project_id,
          // existingImages: response.data.banner_images || [],
          attachfile: response.data?.attachfile?.document_url || null,
          banner_video: response.data.banner_video,
        });
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      return;
    }

    console.log(validFiles[0]);

    setPreviewImg(URL.createObjectURL(validFiles[0]));
    setFormData({ ...formData, attachfile: validFiles[0] });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Expanded allowed file types
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv", "video/x-flv"];
    
    const isAllowedType = [...allowedImageTypes, ...allowedVideoTypes].includes(file.type);
    
    if (!isAllowedType) {
      toast.error("Please upload a valid image or video file.");
      return;
    }

    // File size limit (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size should not exceed 100MB.");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewVideo(previewUrl);
    
    // Update form data
    setFormData((prev) => ({ ...prev, banner_video: file }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is mandatory";
    }
    if (!formData.project_id) {
      newErrors.project_id = "Project is mandatory";
    }
    // if (formData.attachfile === null) {
    //   newErrors.attachfile = "At least one banner image is required";
    // }
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
      sendData.append("banner[banner_image]", formData.attachfile);
      sendData.append("banner[banner_video]", formData.banner_video);

      const res = await axios.put(`${baseURL}banners/${id}.json`, sendData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res);

      toast.success("Banner updated successfully");
      navigate("/banner-list");
    } catch (error) {
      console.log(error);
      toast.error("Error updating banner");
    } finally {
      setLoading(false);
    }
  };

  const isImageFile = (file) => {
    if (!file) return false;
    
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff"];
    
    if (typeof file === 'string') {
      // Handle URL strings - check common image extensions
      const extension = file.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(extension);
    }
    
    // Handle File objects
    return file.type && imageTypes.includes(file.type);
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="main-content">
      <div className="website-content overflow-hidden">
        <div className="module-data-section">
          <div className="card mt-4 pb-4 mx-4">
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
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                      {errors.title && (
                        <span className="text-danger">{errors.title}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Project
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <SelectBox
                        options={projects.map((p) => ({
                          label: p.project_name,
                          value: p.id,
                        }))}
                        defaultValue={formData.project_id}
                        onChange={(value) =>
                          setFormData({ ...formData, project_id: value })
                        }
                      />
                      {errors.project_id && (
                        <span className="text-danger">{errors.project_id}</span>
                      )}
                    </div>
                  </div>
                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>Banner Image </label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachfile"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                      {errors.attachfile && (
                        <span className="text-danger">{errors.attachfile}</span>
                      )}
                      <div className="mt-2">
                        {previewImg ? (
                          <img
                            src={previewImg}
                            className="img-fluid rounded mt-2"
                            alt="Banner Preview"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ) : formData.attachfile ? (
                          <img
                            src={formData.attachfile}
                            className="img-fluid rounded mt-2"
                            alt="Existing Banner"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>No image selected</span>
                        )}
                      </div>
                    </div>
                  </div> */}
                  <div className="col-md-3 mt-1">
                    <div className="form-group">
                      <label>Banner Attachment
                         <span
                          className="tooltip-container"
                          onMouseEnter={() => setShowVideoTooltip(true)}
                          onMouseLeave={() => setShowVideoTooltip(false)}
                        >
                          [i]
                          {showVideoTooltip && (
                            <span className="tooltip-text">
                              16:9 Format Should Only Be Allowed
                            </span>
                          )}
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="banner_video"
                        accept="image/*,video/*"
                        onChange={handleVideoChange}
                      />
                      {errors.banner_video && (
                        <span className="text-danger">
                          {errors.banner_video}
                        </span>
                      )}

                      <div className="mt-2">
                        {previewVideo ? (
                          isImageFile(previewVideo) ? (
                            <img
                              src={previewVideo}
                              className="img-fluid rounded mt-2"
                              alt="Image Preview"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "150px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <video
                              src={previewVideo}
                              controls
                              className="img-fluid rounded mt-2"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "150px",
                                objectFit: "cover",
                              }}
                            />
                          )
                        ) : formData.banner_video && formData.banner_video.document_url ? (
                          isImageFile(formData.banner_video.document_url) ? (
                            <img
                              src={formData.banner_video.document_url}
                              className="img-fluid rounded mt-2"
                              alt="Image Preview"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "150px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <video
                              src={formData.banner_video.document_url}
                              controls
                              className="img-fluid rounded mt-2"
                              style={{
                                maxWidth: "200px",
                                maxHeight: "150px",
                                objectFit: "cover",
                              }}
                            />
                          )
                        ) : (
                          <span>No file selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row mt-2 justify-content-center">
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
            <button onClick={handleCancel} className="purple-btn2 w-100">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerEdit;