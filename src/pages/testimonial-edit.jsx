import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FileText, MessageSquare, Upload } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const TestimonialEdit = () => {
  const connectEvents = useConnectEvents();
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { testimonial } = state || {};
  console.log(testimonial);

  const [formData, setFormData] = useState({
    user_name: testimonial?.user_name || "",
    customer_code: testimonial?.customer_code || "",
    user_profile: testimonial?.profile_of_user || "",
    building_id: testimonial?.building_id ?? null,
    content: testimonial?.content || "",
    video_url: testimonial?.video_url || "",
    preview_image: testimonial?.preview_image || "",
    preview_image_16_by_9: testimonial?.preview_image_16_by_9 || [],
    preview_image_3_by_2: testimonial?.preview_image_3_by_2 || [],
    preview_image_1_by_1: testimonial?.preview_image_1_by_1 || [],
    preview_image_9_by_16: testimonial?.preview_image_9_by_16 || [],
    testimonial_video: null, // Initialize with null, will be set on file upload
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoInputRef = useRef(null);

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
          customer_code: response.data.customer_code || "",
          user_profile: response.data.profile_of_user || "",
          building_id: response.data.building_id ?? null,
          content: response.data.content || "",
          video_url: response.data.video_url || "",
          preview_image: response.data.preview_image || "",
          preview_image_16_by_9: response.data.preview_image_16_by_9 || [],
          preview_image_3_by_2: response.data.preview_image_3_by_2 || [],
          preview_image_1_by_1: response.data.preview_image_1_by_1 || [],
          preview_image_9_by_16: response.data.preview_image_9_by_16 || [],

        });

        // Set existing video URL if available
        const videoUrl = response.data?.testimonial_video?.document_url;
        if (videoUrl) {
          setExistingVideoUrl(videoUrl);
        }

        // Set existing preview image if available
        const imageUrl = response.data?.preview_image_16_by_9?.document_url;
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

  const discardVideo = () => {
    if (previewVideo) URL.revokeObjectURL(previewVideo);
    setPreviewVideo(null);
    setExistingVideoUrl(null);
    setFormData((prev) => ({ ...prev, testimonial_video: null }));
    if (videoInputRef.current) videoInputRef.current.value = "";
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
    "preview image": ["16:9", "1:1", "9:16", "3:2"],
  };

  const currentUploadType = "preview image"; // Can be dynamic
  const selectedRatios = bannerUploadConfig[currentUploadType] || [];
  const dynamicLabel = currentUploadType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const dynamicDescription = `Supports ${selectedRatios.join(
    ", "
  )} aspect ratios`;

  // const updateFormData = (key, files) => {
  //   setFormData((prev) => {
  //     // Normalize previous entries: ensure it's always an array
  //     const existing = Array.isArray(prev[key])
  //       ? prev[key]
  //       : prev[key]
  //       ? [prev[key]]
  //       : [];

  //     // Append new files without overwriting
  //     const merged = [...existing, ...files];

  //     console.log(`✅ Merged formData[${key}]:`, merged);

  //     return {
  //       ...prev,
  //       [key]: merged,
  //     };
  //   });
  // };
  const updateFormData = (key, files) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [key]: files,
      };
      console.log(`✅ Replaced formData[${key}]:`, newData[key]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    // Optional: Add validation here if needed

    // const testimonial16by9 = formData.preview_image_16_by_9;;
    // const hasTestimonial16by9 = Array.isArray(testimonial16by9)
    //   ? testimonial16by9.some(img => img?.file instanceof File || img?.id || img?.document_file_name)
    //   : !!(testimonial16by9?.file instanceof File || testimonial16by9?.id || testimonial16by9?.document_file_name);

    // if (!hasTestimonial16by9) {
    //   toast.error("Please upload at least one 16:9 preview image.");
    //   setLoading(false);
    //   setIsSubmitting(false);
    //   return;
    // }


    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append("testimonial[user_name]", formData.user_name);
      sendData.append("testimonial[customer_code]", formData.customer_code);
      sendData.append("testimonial[profile_of_user]", formData.user_profile);
      sendData.append("testimonial[building_id]", formData.building_id);
      sendData.append("testimonial[content]", formData.content);

      // Append video URL if provided
      if (formData.video_url && formData.video_url.trim()) {
        sendData.append("testimonial[video_url]", formData.video_url.trim());
      }

      // Always use the cropped image file if present
      // if (image[0] && image[0].file instanceof File) {
      //   sendData.append("testimonial[preview_image]", image[0].file);
      // } else

      // Object.entries(formData).forEach(([key, images]) => {
      //   if (key.startsWith("preview_image_") && Array.isArray(images)) {
      //     images.forEach((img) => {
      //       const backendField =
      //         key.replace("video_preview_image_url", "testimonial[video_preview_image_url") + "]";
      //       // e.g., preview[preview_image_1by1]

      //       if (img.file instanceof File) {
      //         sendData.append(backendField, img.file);
      //       }
      //     });
      //   }
      // });
      // Append all preview image files
      TestimonialImageRatios.forEach(({ key }) => {
        const images = formData[key];
        if (Array.isArray(images) && images.length > 0) {
          const img = images[0];
          if (img?.file instanceof File) {
            sendData.append(`testimonial[${key}]`, img.file);
          }
        }
      });



      // Handle 16:9 preview image from new structure
      if (Array.isArray(formData.preview_image_16_by_9)) {
        formData.preview_image_16_by_9.forEach((img) => {
          if (img.file instanceof File) {
            sendData.append("testimonial[preview_image_16_by_9]", img.file);
          }
        });
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

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Testimonial updated successfully!");
      sessionStorage.removeItem("editTestimonialId");
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

  // const handleFileDiscardCoverImage = async (key, index) => {
  //   const Image = formData[key][index]; // Get the selected image
  //   if (!Image.id) {
  //     // If the image has no ID, it's a newly uploaded file. Just remove it locally.
  //     const updatedFiles = formData[key].filter((_, i) => i !== index);
  //     setFormData({ ...formData, [key]: updatedFiles });
  //     toast.success("Image removed successfully!");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(
  //       `${baseURL}projects/${id}/remove_creative_image/${Image.id}.json`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to delete videos");
  //     }

  //     // Remove the deleted image from the state
  //     const updatedFiles = formData[key].filter((_, i) => i !== index);
  //     setFormData({ ...formData, [key]: updatedFiles });

  //     // console.log(`Image with ID ${Image.id} deleted successfully`);
  //     toast.success("Image deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting image:", error);
  //     alert("Failed to delete image. Please try again.");
  //   }
  // };
  // const handleFetchedDiscardGallery = async (key, index, imageId) => {
  //   if (!imageId) {
  //     setFormData((prev) => {
  //       const currentFiles = Array.isArray(prev[key]) ? prev[key] : [prev[key]];
  //       const updatedFiles = currentFiles.filter((_, i) => i !== index);
  //       return { ...prev, [key]: updatedFiles };
  //     });
  //     toast.success("Image removed successfully!");
  //     return;
  //   }
  
  //   try {
  //     const response = await fetch(
  //       `${baseURL}testimonials/${testimonial.id}/remove_image/${imageId}.json`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         },
  //       }
  //     );
  
  //     if (!response.ok) {
  //       if (response.status === 404) {
  //         const currentFiles = Array.isArray(formData[key])
  //           ? formData[key]
  //           : [formData[key]];
  //         const updatedFiles = currentFiles.filter((_, i) => i !== index);
  //         setFormData({ ...formData, [key]: updatedFiles });
  //         toast.success("Image removed from UI (already deleted on server).");
  //         return;
  //       }
  //       throw new Error("Failed to delete image");
  //     }
  
  //     // Successful deletion
  //     setFormData((prev) => {
  //       const currentFiles = Array.isArray(prev[key]) ? prev[key] : [prev[key]];
  //       const updatedFiles = currentFiles.filter((_, i) => i !== index);
  //       return { ...prev, [key]: updatedFiles };
  //     });
  
  //     toast.success("Image deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting image:", error.message);
  //     toast.error("Failed to delete image. Please try again.");
  //   }
  // };

  const handleFetchedDiscardGallery = async (key, index = null, imageId = null) => {
  // Handle preview image case (single URL)
  if (key === "video_preview_image_url") {
    setFormData(prev => ({ ...prev, video_preview_image_url: "" }));
    toast.success("Preview image removed successfully!");
    return;
  }

  // Handle array cases (for other images)
  if (!imageId) {
    setFormData((prev) => {
      const currentFiles = Array.isArray(prev[key]) ? prev[key] : [prev[key]];
      const updatedFiles = currentFiles.filter((_, i) => i !== index);
      return { ...prev, [key]: updatedFiles };
    });
    toast.success("Image removed successfully!");
    return;
  }

  try {
    const response = await fetch(
      `${baseURL}testimonials/${testimonial.id}/remove_image/${imageId}.json`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        const currentFiles = Array.isArray(formData[key])
          ? formData[key]
          : [formData[key]];
        const updatedFiles = currentFiles.filter((_, i) => i !== index);
        setFormData({ ...formData, [key]: updatedFiles });
        toast.success("Image removed from UI (already deleted on server).");
        return;
      }
      throw new Error("Failed to delete image");
    }

    // Successful deletion
    setFormData((prev) => {
      const currentFiles = Array.isArray(prev[key]) ? prev[key] : [prev[key]];
      const updatedFiles = currentFiles.filter((_, i) => i !== index);
      return { ...prev, [key]: updatedFiles };
    });

    toast.success("Image deleted successfully!");
  } catch (error) {
    console.error("Error deleting image:", error.message);
    toast.error("Failed to delete image. Please try again.");
  }
};
  
  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <div className="card banner-form-card mt-3 pb-4">
          <div className="card-header banner-form-section-header">
            <h3 className="banner-form-section-heading">
              <span className="banner-form-section-icon" aria-hidden="true">
                <MessageSquare size={16} strokeWidth={1.8} />
              </span>
              Testimonial Edit
            </h3>
          </div>
          <div className="card-body">
            <div className="row banner-form-fields">
              <div className="col-md-3">
                <div className="form-group">
                  <FormTextField
                    label="User Name"
                    name="user_name"
                    placeholder="Enter user name"
                    value={formData.user_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <FormTextField
                    label="Customer Code"
                    name="customer_code"
                    placeholder="Enter customer code"
                    value={formData.customer_code}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <SelectBox
                    label="Building Type"
                    placeholder="Select Building Type"
                    options={buildingTypeOptions.map((option) => ({
                      label: option.building_type,
                      value: option.id,
                    }))}
                    value={formData.building_id}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, building_id: value }))
                    }
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <FormTextField
                    label="Description"
                    name="content"
                    placeholder="Enter Description"
                    value={formData.content}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <FormTextField
                    label="Video URL"
                    name="video_url"
                    placeholder="Enter video URL"
                    value={formData.video_url}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card banner-form-card banner-attachment-card mt-3 pb-4">
          <div className="card-header banner-form-section-header">
            <h3 className="banner-form-section-heading">
              <span className="banner-form-section-icon" aria-hidden="true">
                <FileText size={16} strokeWidth={1.8} />
              </span>
              Add Attachments
            </h3>
          </div>
          <div className="card-body">
            <input
              ref={videoInputRef}
              type="file"
              name="testimonial_video"
              accept="video/*"
              onChange={handleBannerVideoChange}
              className="banner-upload-native-input"
            />
            <div className="banner-upload-dropzone">
              <div className="banner-upload-item">
                <button
                  type="button"
                  className="banner-upload-files-btn"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Upload size={16} strokeWidth={1.8} />
                  Upload Files
                </button>
                <span className="banner-upload-item-label">
                  Testimonial Video
                  <span
                    className="banner-upload-hint tooltip-container"
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
                  <span className="form-control-field__required">*</span>
                </span>
              </div>
              <div className="banner-upload-item">
                <button
                  type="button"
                  className="banner-upload-files-btn"
                  onClick={() => setShowUploader(true)}
                >
                  <Upload size={16} strokeWidth={1.8} />
                  Upload Files
                </button>
                <span className="banner-upload-item-label">
                  Preview Image
                  <span
                    className="banner-upload-hint tooltip-container"
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
                  <span className="form-control-field__required">*</span>
                </span>
              </div>
            </div>
            {errors.testimonial_video && (
              <span className="error text-danger">
                {errors.testimonial_video}
              </span>
            )}

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
                    {(formData.testimonial_video || existingVideoUrl) && (
                      <tr>
                        <td>
                          {formData.testimonial_video?.name || "Existing video"}
                        </td>
                        <td>
                          {previewVideo || existingVideoUrl ? (
                            <video
                              src={previewVideo || existingVideoUrl}
                              controls
                              className="img-fluid rounded"
                              style={{
                                maxWidth: 100,
                                maxHeight: 100,
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>Video</td>
                        <td>
                          <button
                            type="button"
                            className="purple-btn2"
                            onClick={discardVideo}
                          >
                            x
                          </button>
                        </td>
                      </tr>
                    )}
                    {TestimonialImageRatios.flatMap(({ key, label }) => {
                      const files = Array.isArray(formData[key])
                        ? formData[key]
                        : formData[key]
                          ? [formData[key]]
                          : [];

                      return files.map((file, index) => {
                        const preview =
                          file.preview || file.document_url || "";
                        const name =
                          file.name ||
                          file.document_file_name ||
                          `Image ${index + 1}`;
                        const ratio = file.ratio || label;

                        return (
                          <tr key={`${key}-${index}`}>
                            <td>{name}</td>
                            <td>
                              <img
                                style={{
                                  maxWidth: 100,
                                  maxHeight: 100,
                                  objectFit: "cover",
                                }}
                                className="img-fluid rounded"
                                src={preview}
                                alt={name}
                              />
                            </td>
                            <td>{ratio}</td>
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

        <div className="banner-form-actions">
          <button
            type="submit"
            className="banner-form-action-btn"
            disabled={loading}
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button
            type="button"
            className="banner-form-action-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialEdit;