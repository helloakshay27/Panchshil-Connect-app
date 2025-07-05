import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { data, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import "../mor.css";
import { baseURL } from "./baseurl/apiDomain";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";

const Testimonials = () => {
  const [companySetupOptions, setCompanySetupOptions] = useState([]);
  const [companySetupId, setCompanySetupId] = useState("");
  const [userName, setUserName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [userProfile, setUserProfile] = useState(""); // State for user profile
  const [userType, setUserType] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [buildingTypeOptions, setBuildingTypeOptions] = useState([]);
  const [buildingTypeId, setBuildingTypeId] = useState("");
  const [buildingType, setBuildingType] = useState({ id: "", name: "" });
  const [showTooltip, setShowTooltip] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [image, setImage] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    testimonial_video: null,
    attachfile: null,
    preview_image_16_by_9: [],
    preview_image_3_by_2: [],
    preview_image_1_by_1: [],
    preview_image_9_by_16: [],
  });


  const TestimonialImageRatios = [
    { key: "preview_image_1_by_1", label: "1:1" },
    { key: "preview_image_16_by_9", label: "16:9" },
    { key: "preview_image_9_by_16", label: "9:16" },
    { key: "preview_image_3_by_2", label: "3:2" },
  ];



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

      setErrors((prev) => ({ ...prev, testimonial_video: "" }));
      setPreviewVideo(URL.createObjectURL(file));

      setFormData((prev) => ({
        ...prev,
        testimonial_video: file,
      }));
    }
  };

  useEffect(() => {
    const fetchCompanySetups = async () => {
      try {
        const response = await axios.get(`${baseURL}company_setups.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Raw API Response:", response.data);

        if (response.data && Array.isArray(response.data.company_setups)) {
          setCompanySetupOptions(response.data.company_setups);
        } else {
          console.warn("Unexpected API response format:", response.data);
          setCompanySetupOptions([]);
        }
      } catch (error) {
        console.error("Error fetching company setup data:", error);

        if (error.response) {
          console.error("API Response Error:", error.response.data);
        }
        setCompanySetupOptions([]);
      }
    };

    fetchCompanySetups();
  }, []);

  useEffect(() => {
    const fetchBuildingTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}building_types.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data && Array.isArray(response.data)) {
          setBuildingTypeOptions(response.data);
        }
      } catch (error) {
        console.error("Error fetching building type data:", error);
      }
    };

    fetchBuildingTypes();
  }, []);

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
      toast.error(" Please upload a valid image file.");
      return;
    }

    if (sizeInMB > 3) {
      toast.error(" Image size must be less than 3MB.");
      return;
    }

    setImage(newImageList);
    setDialogOpen(true); // Open cropper for images
  };

  const bannerUploadConfig = {
    "video preview image url": ["16:9", "1:1", "9:16", "3:2"],
  };

  const currentUploadType = "video preview image url"; // Can be dynamic
  const selectedRatios = bannerUploadConfig[currentUploadType] || [];
  const dynamicLabel = currentUploadType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const dynamicDescription = `Supports ${selectedRatios.join(
    ", "
  )} aspect ratios`;

const updateFormData = (key, files) => {
  setFormData((prev) => {
    const newData = {
      ...prev,
      [key]: [...(prev[key] || []), ...files],
    };
    console.log(`Updated formData for key ${key}:`, newData[key]); // Debugging
    return newData;
  });
};

const handleCropComplete = (validImages) => {
  if (!validImages || validImages.length === 0) {
    toast.error("No valid images selected.");
    setShowUploader(false);
    return;
  }

  const ratioKeyMap = {
    "1:1": "preview_image_1_by_1",
    "16:9": "preview_image_16_by_9",
    "9:16": "preview_image_9_by_16",
    "3:2": "preview_image_3_by_2",
  };

  validImages.forEach((img) => {
    const key = ratioKeyMap[img.ratio];
    if (key) {
      updateFormData(key, [img]); // Append new image to existing ones
    }
  });

  // Only update preview if needed (e.g., for UI display of the latest image)
  setPreviewImg(validImages[0].preview);
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

  const validateForm = (formData) => {
    const errors = [];

    // if (!formData.testimonial_video) {
    //   errors.push("Testimonial video is required.");
    //   return errors; // Return the first error immediately
    // }
    // if (!formData?.attachfile) {
    //   errors.push("Preview image is required.");
    //   return errors; // Return the first error immediately
    // }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setLoading(true);
    toast.dismiss();

    const hasProjectBanner1by1 = formData.preview_image_16_by_9
    && formData.preview_image_16_by_9.some(img => img.file instanceof File);

    if (!hasProjectBanner1by1) {
      toast.error("Preview Image with 16:9 ratio is required.");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      setLoading(false);
      return;
    }

    const form = new FormData();
    form.append("testimonial[user_name]", userName.trim());
    form.append("testimonial[content]", content.trim());
    form.append("testimonial[building_id]", buildingTypeId?.toString() || "");
    form.append(
      "testimonial[building_type]",
      buildingTypeOptions.find((option) => option.id === buildingTypeId)
        ?.building_type || ""
    );

    if (formData.testimonial_video) {
      form.append("testimonial[testimonial_video]", formData.testimonial_video);
    }

    // ✅ Only use File for preview_image
    // if (formData.attachfile instanceof File) {
    //   form.append("testimonial[preview_image]", formData.attachfile);
    // }

    // Object.entries(formData).forEach(([key, images]) => {
    //   if (key.startsWith("video_preview_image_url") && Array.isArray(images)) {
    //     images.forEach((img) => {
    //       const backendField =
    //         key.replace("video_preview_image_url", "testimonial[video_preview_image_url") + "]";
    //       // e.g., preview[preview_image_1by1]
    //       if (img.file instanceof File) {
    //         form.append(backendField, img.file);
    //       }
    //     });
    //   }
    // });

    TestimonialImageRatios.forEach(({ key }) => {
      const images = formData[key];
      if (Array.isArray(images) && images.length > 0) {
        const img = images[0];
        if (img?.file instanceof File) {
          form.append(`testimonial[${key}]`, img.file);
        }
      }
    });

    // ✅ Use actual URL if you have one
    if (videoUrl) {
      form.append("testimonial[video_preview_image_url]", videoUrl.trim());
    }

    console.log("data to be sent:", Array.from(form.entries()));
    try {
      console.log("data to be sent:", Array.from(form.entries()));

      const response = await axios.post(`${baseURL}testimonials.json`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Data saved successfully!");
      // reset all
      setUserName("");
      setVideoUrl("");
      setImagePreview("");
      setUserProfile("");
      setUserType("");
      setContent("");
      setPreviewVideo(null);
      setPreviewImg(null);
      setFormData({
        testimonial_video: null,
        attachfile: null,
        video_preview_image_url: "",
      });
      navigate("/testimonial-list");
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.error("Failed to submit. Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  return (
    <>
      <div className="">
        <div className="">
          <div className="module-data-section p-3">
            {/* <form onSubmit={handleSubmit}> */}
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Testimonials</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* User Name */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>User Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="userName"
                        placeholder="Enter user name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Building Type */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Building Type</label>
                      <SelectBox
                        options={buildingTypeOptions.map((option) => ({
                          label: option.building_type, // Display Name
                          value: option.id, // ID
                        }))}
                        value={buildingTypeId}
                        onChange={(value) => setBuildingTypeId(value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        className="form-control"
                        type="text"
                        name="content"
                        placeholder="Enter Description"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
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
                        <video
                          src={previewVideo}
                          controls
                          className="img-fluid rounded mt-2"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                        />
                      )}
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

                  <div className="col-md-3 col-sm-6 col-12">
                    <div className="form-group">
                      <label className="d-flex align-items-center gap-1 mb-2">
                        <span>Preview Image</span>

                        <span
                          className="tooltip-container"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          style={{ cursor: 'pointer' }}
                        >
                          [i]
                          {showTooltip && (
                            <span className="tooltip-text" style={{
                              marginLeft: '6px',
                              background: '#f9f9f9',
                              border: '1px solid #ccc',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              position: 'absolute',
                              zIndex: 1000,
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                            }}>
                              Max Upload Size 3 MB and Required ratio is 16:9
                            </span>
                          )}
                        </span>

                        <span className="otp-asterisk text-danger">*</span>
                      </label>

                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => setShowUploader(true)}
                        className="custom-upload-button input-upload-button"
                      >
                        <span
                          className="upload-button-label"
                        >
                          Choose file
                        </span>
                        <span
                          className="upload-button-value"
                        >
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
                    </div>
                  </div>

                  <div className="col-md-12 mt-4">
                    <div className="tbl-container">
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
                          {TestimonialImageRatios.flatMap(({ key, label }) => {
                            const value = formData[key];
                            if (!value || (Array.isArray(value) && value.length === 0)) return [];

                            const files = Array.isArray(value) ? value : [value];

                            return files.map((file, index) => (
                              <tr key={`${key}-${index}`}>
                                <td>{file.name || file.document_file_name || `Image ${index + 1}`}</td>
                                <td>
                                  <img
                                    src={file.preview || file.document_url}
                                    alt={file.name || `Image ${index + 1}`}
                                    className="img-fluid rounded"
                                    style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }}
                                  />
                                </td>
                                <td>{label}</td>
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
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="row mt-2 justify-content-center">
              <div className="col-md-2">
                <button
                  type="submit"
                  className="purple-btn2 w-100"
                  disabled={loading}
                  onClick={handleSubmit}
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
            {/* </form> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;