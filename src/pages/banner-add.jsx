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
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";

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
  const [image, setImage] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // const handleFileChange = (e) => {
  //   const files = Array.from(e.target.files);
  //   const allowedTypes = [
  //     "image/jpeg",
  //     "image/png",
  //     "image/gif",
  //     "image/webp",
  //   ];

  //   const validFiles = files.filter((file) => allowedTypes.includes(file.type));

  //   const oversizedImage = validFiles.find(file => file.size > 3 * 1024 * 1024); // 3MB
  //   if (oversizedImage) {
  //     toast.error("Each image must be under 3MB.");
  //     e.target.value = "";
  //     return;
  //   }


  //   if (validFiles.length > 0) {
  //     setPreviewImg(URL.createObjectURL(validFiles[0]));
  //     setFormData((prev) => ({
  //       ...prev,
  //       attachfile: validFiles,
  //       banner_video: null, // Clear video when image is selected
  //     }));
  //     setBannerImageSelected(true);
  //     setBannerVideoSelected(false); // Disable video
  //     setPreviewVideo(null); // Clear video preview
  //     setErrors((prev) => ({ ...prev, attachfile: "" }));
  //   } else {
  //     setBannerImageSelected(false);
  //   }
  // };

  // const handleBannerVideoChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file) {
  //       const isVideo = file.type.startsWith('video/');
  //       const isImage = file.type.startsWith('image/');

  //       // Check video size (max 10MB)
  //       if (isVideo && file.size > 10 * 1024 * 1024) {
  //         setErrors((prev) => ({
  //           ...prev,
  //           banner_video: "",
  //         }));
  //         toast.error("Video size must be less than 10MB.");
  //         e.target.value = "";
  //         return;
  //       }

  //       // Check image size (max 3MB)
  //       if (isImage && file.size > 3 * 1024 * 1024) {
  //         setErrors((prev) => ({
  //           ...prev,
  //           banner_video: "",
  //         }));
  //         toast.error("Image size must be less than 3MB.");
  //         e.target.value = "";
  //         return;
  //       }
  //     }

  //     setErrors((prev) => ({ ...prev, banner_video: "" }));

  //     // Check if it's a video
  //     if (file.type.startsWith('video/')) {
  //       setPreviewVideo(URL.createObjectURL(file));
  //       setPreviewImg(null);
  //     }
  //     // Check if it's an image
  //     else if (file.type.startsWith('image/')) {
  //       setPreviewImg(URL.createObjectURL(file));
  //       setPreviewVideo(null);
  //     }
  //     // Try to determine from extension if MIME type is not recognized
  //     else {
  //       const extension = file.name.split('.').pop().toLowerCase();
  //       const videoExtensions = ['mp4', 'avi', 'mov', 'webm', 'mkv', 'flv', 'wmv', 'mpeg', 'm4v'];
  //       const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];

  //       if (videoExtensions.includes(extension)) {
  //         setPreviewVideo(URL.createObjectURL(file));
  //         setPreviewImg(null);
  //       } else if (imageExtensions.includes(extension)) {
  //         setPreviewImg(URL.createObjectURL(file));
  //         setPreviewVideo(null);
  //       } else {
  //         // If can't determine file type, still accept but don't show preview
  //         setPreviewVideo(null);
  //         setPreviewImg(null);
  //       }
  //     }

  //     setFormData((prev) => ({
  //       ...prev,
  //       banner_video: file,
  //       attachfile: [], // Clear images when video is selected
  //     }));
  //     setBannerVideoSelected(true);
  //     setBannerImageSelected(false); // Disable image
  //   } else {
  //     setBannerVideoSelected(false);
  //   }
  // };

  // Form Validation
  const handleImageUpload = (newImageList) => {
    if (!newImageList || newImageList.length === 0) return;

    const file = newImageList[0].file;
    if (!file) return;

    const allowedImageTypes = [
      "image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff", "image/gif"
    ];
    const allowedVideoTypes = [
      "video/mp4", "video/webm", "video/ogg", "video/quicktime",
      "video/x-msvideo", "video/x-ms-wmv", "video/x-flv"
    ];

    const fileType = file.type;
    const sizeInMB = file.size / (1024 * 1024);

    console.log("Uploaded file details:", {
      name: file.name,
      type: file.type,
      size: sizeInMB,
      lastModified: file.lastModified,
    });

    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      toast.error("❌ Please upload a valid image or video file.");
      return;
    }

    if (isImage && sizeInMB > 3) {
      toast.error("❌ Image size must be less than 3MB.");
      return;
    }

    if (isVideo && sizeInMB > 20) {
      toast.error("❌ Video size must be less than 20MB.");
      return;
    }

    setImage(newImageList);

    if (isVideo) {
      const previewURL = URL.createObjectURL(file);
      console.log("Generated preview URL for video:", previewURL);
      setPreviewVideo(previewURL);
      setFormData((prev) => ({ ...prev, banner_video: file }));
      setBannerVideoSelected(true);
      setBannerImageSelected(false);
      setPreviewImg(null);
    } else if (isImage) {
      setPreviewVideo(null);
      setBannerImageSelected(true);
      setBannerVideoSelected(false);
      if (file.type !== "image/gif") {
        setDialogOpen(true);
      } else {
        setPreviewImg(URL.createObjectURL(file));
        setFormData((prev) => ({ ...prev, banner_video: file }));
      }
    }
  };
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
    // if (!formData.attachfile.length && !formData.banner_video) {
    //   toast.dismiss();
    //   toast.error("Please upload either banner image or video");
    //   return false;
    // }

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

      // if (formData.attachfile.length > 0) {
      //   formData.attachfile.forEach((file) => {
      //     sendData.append("banner[banner_image][]", file);
      //   });
      // }

      // Always use the File object for image upload
      if (image[0] && image[0].file instanceof File) {
        // sendData.append("banner[banner_image][]", image[0].file);
        sendData.append("banner[banner_video]", image[0].file);
      } else {
        sendData.append("banner[banner_video]", formData.banner_video);
      }

      // if (formData.banner_video instanceof File) {
      //   sendData.append("banner[banner_video]", formData.banner_video);
      // }

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
                      {/* <input
                        className="form-control"
                        type="file"
                        accept="image/*,video/*"
                        name="banner_video"
                        onChange={handleBannerVideoChange}
                      /> */}
                      <ImageUploadingButton
                        value={image}
                        onChange={handleImageUpload}
                        btntext="Add"
                        variant="custom"
                      />
                      <ImageCropper
                        open={dialogOpen}
                        image={image?.[0]?.dataURL || null}
                        onComplete={(cropped) => {
                          if (cropped) {
                            setCroppedImage(cropped.base64);
                            setPreviewImg(cropped.base64);
                            setFormData((prev) => ({ ...prev, banner_video: cropped.file }));
                          }
                          setDialogOpen(false);
                          if (!cropped) {
                            setImage([]);
                            setPreviewImg(null);
                            setFormData((prev) => ({ ...prev, banner_video: null }));
                          }
                        }}
                        requiredRatios={[1, 9 / 16]}
                        requiredRatioLabel="1:1 or 9:16"
                        allowedRatios={[
                          { label: "16:9", ratio: 16 / 9 },
                          { label: "9:16", ratio: 9 / 16 },
                          { label: "1:1", ratio: 1 },
                        ]}
                        containerStyle={{ position: "relative", width: "100%", height: 300, background: "#fff" }}
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

                      {previewVideo && previewVideo !== null && previewVideo !== '' && (
                        <div className="mt-2">
                          <video
                            key={previewVideo}
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
                            onError={(e) => {
                              console.log("Video error details:", {
                                error: e,
                                target: e.target,
                                src: e.target.src,
                                readyState: e.target.readyState,
                              });
                            }}
                            onLoadedData={(e) => console.log("Video loaded:", e.target.src)}
                          >
                            Your browser does not support the video tag or the file format.
                          </video>
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