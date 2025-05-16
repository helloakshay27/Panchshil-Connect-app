import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const BannerAdd = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [previewImg, setPreviewImg] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [bannerImageSelected, setBannerImageSelected] = useState(false);
  const [bannerVideoSelected, setBannerVideoSelected] = useState(false); 

  const [formData, setFormData] = useState({
    banner_type: "",
    banner_redirect: "",
    project_id: "",
    title: "",
    // attachfile: [],
    banner_video: [],
    active: true,
  });

  // Fetch Projects
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
      }
    };

    fetchProjects();
    setLoading(false);
  }, []);

  // Input Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      e.target.value = "";
      return;
    }

    if (validFiles.length > 0) {
      setPreviewImg(URL.createObjectURL(validFiles[0]));
      setFormData((prev) => ({
        ...prev,
        attachfile: validFiles,
        banner_video: null, // Clear video when image is selected
      }));
      setBannerImageSelected(true);
      setBannerVideoSelected(false); // Disable video
      setPreviewVideo(null); // Clear video preview
      setErrors((prev) => ({ ...prev, attachfile: "" }));
    } else {
      setBannerImageSelected(false);
    }
  };

  const handleBannerVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          banner_video: "Video size must be under 50MB",
        }));
        toast.error("Video size must be under 50MB");
        e.target.value = "";
        return;
      }

      setErrors((prev) => ({ ...prev, banner_video: "" }));
      
      // Check if it's a video
      if (file.type.startsWith('video/')) {
        setPreviewVideo(URL.createObjectURL(file));
        setPreviewImg(null);
      } 
      // Check if it's an image
      else if (file.type.startsWith('image/')) {
        setPreviewImg(URL.createObjectURL(file));
        setPreviewVideo(null);
      } 
      // Try to determine from extension if MIME type is not recognized
      else {
        const extension = file.name.split('.').pop().toLowerCase();
        const videoExtensions = ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv', 'mpeg', 'm4v'];
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
        
        if (videoExtensions.includes(extension)) {
          setPreviewVideo(URL.createObjectURL(file));
          setPreviewImg(null);
        } else if (imageExtensions.includes(extension)) {
          setPreviewImg(URL.createObjectURL(file));
          setPreviewVideo(null);
        } else {
          // If can't determine file type, still accept but don't show preview
          setPreviewVideo(null);
          setPreviewImg(null);
        }
      }
      
      setFormData((prev) => ({
        ...prev,
        banner_video: file,
        attachfile: [], // Clear images when video is selected
      }));
      setBannerVideoSelected(true);
      setBannerImageSelected(false); // Disable image
    } else {
      setBannerVideoSelected(false);
    }
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};

    // Sequential validation - check one field at a time and return as soon as we find an error
    if (!formData.title.trim()) {
      newErrors.title = "";
      setErrors(newErrors);
      toast.dismiss(); // Clear previous toasts
      toast.error("Title is mandatory");
      return false;
    }

    if (!formData.project_id || String(formData.project_id).trim() === "") {
      newErrors.project_id = "";
      setErrors(newErrors);
      toast.dismiss(); // Clear previous toasts
      toast.error("Project is mandatory");
      return false;
    }

    // Check if either image or video is selected
    if (!formData.attachfile.length && !formData.banner_video) {
      toast.dismiss();
      toast.error("Please upload either banner image or video");
      return false;
    }

    // If we reach here, all validations passed
    setErrors({});
    return true;
  };

  // Form Submit Handler
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
      
      if (formData.attachfile.length > 0) {
        formData.attachfile.forEach((file) => {
          sendData.append("banner[banner_image][]", file);
        });
      }

      if (formData.banner_video instanceof File) {
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
    <>
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
                        Title
                        <span className="otp-asterisk"> *</span>
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
                        <span className="error text-danger">
                          {errors.title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Project
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <SelectBox
                        options={projects.map((project) => ({
                          label: project.project_name,
                          value: project.id,
                        }))}
                        Value={formData.project_id}
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

                  {/* Banner File Upload */}
                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Banner Image{" "}
                        <span
                          className="tooltip-container"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          [i]
                          {showTooltip && (
                            <span className="tooltip-text">
                              Max Upload Size 50 MB
                            </span>
                          )}
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachfile"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={bannerVideoSelected}
                      />
                      {errors.attachfile && (
                        <span className="error text-danger">
                          {errors.attachfile}
                        </span>
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
                    </div>
                  </div> */}

                  {/* Banner Video Upload */}
                  <div className="col-md-3 mt-1">
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
                        onChange={handleBannerVideoChange}
                      />
                      {errors.banner_video && (
                        <span className="error text-danger">
                          {errors.banner_video}
                        </span>
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
                  
                      {previewVideo && (
                        <div className="mt-2">
                          <video
                            autoPlay
                            muted
                            src={previewVideo}
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                              borderRadius: "5px",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Submit and Cancel Buttons */}
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
    </>
  );
};

export default BannerAdd;