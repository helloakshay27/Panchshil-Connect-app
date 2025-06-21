import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";

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
  const [image, setImage] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          testimonial_video: "",
        }));
        toast.error("Video size must be less than 10MB.");
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

  const handleImageUpload = (newImageList) => {
    if (!newImageList || newImageList.length === 0) return;

    const file = newImageList[0].file;
    if (!file) return;

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ];

    const fileType = file.type;
    const sizeInMB = file.size / (1024 * 1024);

    if (!allowedImageTypes.includes(fileType)) {
      toast.error("❌ Please upload a valid image file.");
      return;
    }

    if (sizeInMB > 3) {
      toast.error("❌ Image size must be less than 3MB.");
      return;
    }

    setImage(newImageList);
    setDialogOpen(true); // Open cropper for images
  };

  const isImageFile = (file) => {
    if (!file) return false;
    const imageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
    ];
    if (typeof file === "string") {
      if (file.startsWith("data:image")) return true;
      const extension = file.split(".").pop().toLowerCase();
      return [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "bmp",
        "tiff",
      ].includes(extension);
    }

    return imageTypes.includes(file.type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optional: Add validation here if needed

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append("testimonial[user_name]", formData.user_name);
      sendData.append("testimonial[profile_of_user]", formData.user_profile);
      sendData.append("testimonial[building_id]", formData.building_id);
      sendData.append("testimonial[content]", formData.content);

      // Always use the cropped image file if present
      if (image[0] && image[0].file instanceof File) {
        sendData.append("testimonial[preview_image]", image[0].file);
      } else if (formData.attachfile) {
        sendData.append("testimonial[preview_image]", formData.attachfile);
      } else if (formData.video_url) {
        sendData.append(
          "testimonial[video_preview_image_url]",
          formData.video_url.trim()
        );
      }

      // Append video file if present
      if (formData.testimonial_video) {
        sendData.append(
          "testimonial[testimonial_video]",
          formData.testimonial_video
        );
      }

      await axios.put(
        `${baseURL}testimonials/${testimonial.id}.json`,
        sendData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
    <div className="">
      <div className="">
        <div className="module-data-section p-3">
          {/* <form onSubmit={handleSubmit}> */}
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
                          <span className="tooltip-text">
                            Max Upload Size 10 MB
                          </span>
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
                      <span className="error text-danger">
                        {errors.testimonial_video}
                      </span>
                    )}

                    {previewVideo && (
                      <div className="mt-2">
                        <video
                          src={previewVideo}
                          controls
                          className="img-fluid rounded"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}

                    {!previewVideo && existingVideoUrl && (
                      <div className="mt-2">
                        <video
                          src={existingVideoUrl}
                          controls
                          className="img-fluid rounded"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}
                  </div>
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
                          Max Upload Size 3 MB
                        </span>
                      )}
                    </span>
                    <span className="otp-asterisk"> *</span>
                  </label>
                  <ImageUploadingButton
                    value={image}
                    onChange={handleImageUpload}
                    variant="custom"
                  />
                  <ImageCropper
                    open={dialogOpen}
                    image={image?.[0]?.dataURL || null}
                    onComplete={(cropped) => {
                      if (cropped) {
                        setCroppedImage(cropped.base64);
                        setPreviewImg(cropped.base64);
                        setFormData((prev) => ({
                          ...prev,
                          attachfile: cropped.file,
                          video_preview_image_url: cropped.base64,
                        }));
                      }
                      setDialogOpen(false);
                    }}
                    requiredRatios={[16 / 9]}
                    requiredRatioLabel="16:9"
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
                  {errors.attachfile && (
                    <span className="error text-danger">
                      {errors.attachfile}
                    </span>
                  )}

                  {/* Show new preview image if selected */}
                  {previewImg && (
                    <div className="mt-2">
                      <img
                        src={croppedImage || previewImg}
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

          <div className="row mt-2 justify-content-center">
            <div className="col-md-2 mt-3">
              <button
                type="submit"
                className="purple-btn2 w-100"
                disabled={loading}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
            <div className="col-md-2 mt-3">
              <button
                type="button"
                className="purple-btn2 w-100"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
          {/* </form> */}
        </div>
      </div>
    </div>
  );
};

export default TestimonialEdit;
