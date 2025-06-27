import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";

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
  const [showUploader, setShowUploader] = useState(false);

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

  const bannerUploadConfig = {
    "preview image": ["16:9"],
  };

  const currentUploadType = "preview image"; // Can be dynamic
  const selectedRatios = bannerUploadConfig[currentUploadType] || [];
  const dynamicLabel = currentUploadType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const dynamicDescription = `Supports ${selectedRatios.join(
    ", "
  )} aspect ratios`;

  const updateFormData = (key, files) => {
    setFormData((prev) => ({
      ...prev,
      [key]: files,
    }));
  };

  const handleCropComplete = (validImages) => {
    if (!validImages || validImages.length === 0) {
      toast.error("No valid images selected.");
      setShowUploader(false);
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "by"); // e.g., "16:9" -> "16by9"
      const key = `${currentUploadType}_${formattedRatio}`
        .replace(/\s+/g, "_")
        .toLowerCase(); // e.g., banner_image_16by9

      updateFormData(key, [img]); // send as array to preserve consistency
    });

    setPreviewImg(validImages[0].preview); // preview first image only
    setShowUploader(false);
  };

  console.log("formData", formData);

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

    // If the removed image is being previewed, reset previewImg
    if (previewImg === imageToRemove.preview) {
      setPreviewImg(null);
    }
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
      // if (image[0] && image[0].file instanceof File) {
      //   sendData.append("testimonial[preview_image]", image[0].file);
      // } else

      Object.entries(formData).forEach(([key, images]) => {
        if (key.startsWith("preview_image_") && Array.isArray(images)) {
          images.forEach((img) => {
            const backendField =
              key.replace("video_preview_image_url", "testimonial[video_preview_image_url") + "]";
            // e.g., preview[preview_image_1by1]

            if (img.file instanceof File) {
              sendData.append(backendField, img.file);
            }
          });
        }
      });

      
      if (formData.attachfile) {
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

              {/* <div className="col-md-3">
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
                          Max Upload Size 3 MB and Required ratio is 16:9
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
                  <small className="form-text text-muted">
                    Required ratio must be 16:9
                  </small>
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
                    requiredRatios={[16 / 9, 1, 9 / 16]}
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
          </div> */}

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
                          Max Upload Size 3 MB and Required ratio is 16:9
                        </span>
                      )}
                    </span>
                    <span className="otp-asterisk"> *</span>
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
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "8px 16px",
                        borderRight: "1px solid #ccc",
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

                  {/* Conditional rendering: Table for multiple images OR single image preview */}
                </div>
              </div>

              <div className="col-md-12 mt-2">
                {Array.isArray(formData.preview_image_16by9) &&
                formData.preview_image_16by9.length > 0 ? (
                  // ✅ Uploaded image table view
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
                          {formData.preview_image_16by9.map((file, index) => (
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
                              <td>{file.ratio || "16:9"}</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    discardImage("preview_image_16by9", file)
                                  }
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
                ) : previewImg || existingImageUrl ? (
                  // ✅ Fallback table for single preview/cropped/existing image
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
                          <tr>
                            <td>preview_image_16by9.jpg</td>
                            <td>
                              <img
                                src={
                                  croppedImage || previewImg || existingImageUrl
                                }
                                className="img-fluid rounded"
                                alt="Preview"
                                style={{
                                  maxWidth: "100px",
                                  maxHeight: "100px",
                                  objectFit: "cover",
                                }}
                              />
                            </td>
                            <td>16:9</td>
                            <td>
                              <button
                                type="button"
                                className="purple-btn2"
                                onClick={() =>
                                  discardImage("preview_image_16by9", {
                                    preview: previewImg || existingImageUrl,
                                    name: "preview_image_16by9.jpg",
                                    ratio: "16:9",
                                  })
                                }
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <span>No image selected</span>
                  </div>
                )}
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