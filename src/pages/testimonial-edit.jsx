import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const TestimonialEdit = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { testimonial } = state || {};
  console.log(testimonial);

  const [formData, setFormData] = useState({
    user_name: testimonial?.user_name || "",
    user_profile: testimonial?.profile_of_user || "",
    building_id: testimonial?.building_id ?? null,
    content: testimonial?.content || "",
    video_url: testimonial?.video_preview_image_url || "",
  });

  const [buildingTypeOptions, setBuildingTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchTestimonialData = async () => {
      try {
        const response = await axios.get(
          `${baseURL}testimonials/${testimonial.id}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        setFormData({
          user_name: response.data.user_name || "",
          user_profile: response.data.profile_of_user || "",
          building_id: response.data.building_id ?? null,
          content: response.data.content || "",
          video_url: response.data.video_preview_image_url || "",
        });

        // Set existing video URL if available
        const videoUrl = response.data?.testimonial_video?.document_url;
        if (videoUrl) {
          setExistingVideoUrl(videoUrl);
        }

        // Set existing preview image if available
        const imageUrl = response.data?.video_preview_image_url;
        if (imageUrl) {
          setExistingImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching testimonial data:", error);
        toast.error("Error loading testimonial details.");
      }
    };

    if (testimonial?.id) {
      fetchTestimonialData();
    }
  }, [testimonial?.id]);

  useEffect(() => {
    const fetchBuildingTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}building_types.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.data && Array.isArray(response.data)) {
          setBuildingTypeOptions(response.data);
        } else {
          console.warn("Unexpected API response format:", response.data);
          setBuildingTypeOptions([]);
        }
      } catch (error) {
        console.error("Error fetching building type data:", error);
        toast.error("Error loading building types.");
      }
    };

    fetchBuildingTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleBannerVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 100MB

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          testimonial_video: "Max file size is 100 MB",
        }));
        toast.error("Video exceeds 100MB limit. Please upload a smaller file.");
        return;
      }

      const videoUrl = URL.createObjectURL(file);
      setPreviewVideo(videoUrl);
      setFormData((prev) => ({
        ...prev,
        testimonial_video: file,
      }));
      setErrors((prev) => ({
        ...prev,
        testimonial_video: null,
      }));
      setExistingVideoUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (files.length === 0) return;

    const file = files[0]; // Get the first file

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      e.target.value = "";
      return;
    }

    // Size validation (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        attachfile: "Max file size is 50 MB",
      }));
      toast.error("Image exceeds 50MB limit. Please upload a smaller file.");
      return;
    }

    // Create image preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewImg(previewUrl);
    
    // Clear existing image when uploading a new one
    setExistingImageUrl(null);

    // Update formData with the image file
    setFormData(prev => ({
      ...prev,
      attachfile: file,
      video_preview_image_url: previewUrl // Update the URL field as well
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("testimonial[user_name]", formData.user_name);
      form.append("testimonial[profile_of_user]", formData.user_profile);
      form.append("testimonial[building_id]", formData.building_id);
      
      // Only append the video_preview_image_url if it's the existing URL and no new file
      if (!formData.attachfile && formData.video_url) {
        form.append("testimonial[video_preview_image_url]", formData.video_url.trim());
      }
      
      form.append("testimonial[content]", formData.content);

      // Append new files if they exist
      if (formData.testimonial_video) {
        form.append("testimonial[testimonial_video]", formData.testimonial_video);
      }
      
      if (formData.attachfile) {
        form.append("testimonial[preview_image]", formData.attachfile);
      }

      await axios.put(`${baseURL}testimonials/${testimonial.id}.json`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Testimonial updated successfully!");
      navigate("/testimonial-list");
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Error updating testimonial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section p-3">
          <form onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Edit Testimonial</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>User Name</label>
                      <input
                        className="form-control"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Building Type</label>
                      <SelectBox
                        options={buildingTypeOptions.map((option) => ({
                          label: option.building_type,
                          value: option.id,
                        }))}
                        defaultValue={formData.building_id}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, building_id: value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        className="form-control"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Testimonial Video{" "}
                        <span
                          className="tooltip-container"
                          onMouseEnter={() => setShowVideoTooltip(true)}
                          onMouseLeave={() => setShowVideoTooltip(false)}
                        >
                          [i]
                          {showVideoTooltip && (
                            <span className="tooltip-text">Max Upload Size 50 MB</span>
                          )}
                        </span>
                         <span className="otp-asterisk"> *</span>

                      </label>

                      <input
                        className="form-control"
                        type="file"
                        name="testimonial_video"
                        accept="video/*"
                        onChange={handleBannerVideoChange}
                      />

                      {errors.testimonial_video && (
                        <span className="error text-danger">{errors.testimonial_video}</span>
                      )}

                      {previewVideo && (
                        <div className="mt-2">
                          <video
                            src={previewVideo}
                            controls
                            className="img-fluid rounded"
                            style={{ maxWidth: "200px", maxHeight: "150px", objectFit: "cover" }}
                          />
                        </div>
                      )}

                      {!previewVideo && existingVideoUrl && (
                        <div className="mt-2">
                          <video
                            src={existingVideoUrl}
                            controls
                            className="img-fluid rounded"
                            style={{ maxWidth: "200px", maxHeight: "150px", objectFit: "cover" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Preview Image{" "}
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
                         <span className="otp-asterisk"> *</span>

                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachfile"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {errors.attachfile && (
                        <span className="error text-danger">
                          {errors.attachfile}
                        </span>
                      )}
                      
                      {/* Show new preview image if selected */}
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
                      
                      {/* Show existing image if no new image is selected */}
                      {!previewImg && existingImageUrl && (
                        <div className="mt-2">
                          <img
                            src={existingImageUrl}
                            className="img-fluid rounded"
                            alt="Current Preview"
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

            <div className="row mt-2 justify-content-center">
              <div className="col-md-2 mt-3">
                <button type="submit" className="purple-btn2 w-100" disabled={loading}>
                  Submit
                </button>
              </div>
              <div className="col-md-2 mt-3">
                <button type="button" className="purple-btn2 w-100" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestimonialEdit;