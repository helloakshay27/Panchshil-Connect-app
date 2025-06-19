import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";


// const ImageUploadingButton = ({ value, onChange }) => {
//   return (
//     <ImageUploading value={value} onChange={onChange} acceptType={["jpg", "png", "jpeg", "webp"]}>
//       {({ onImageUpload, onImageUpdate }) => (
//         <button
//           onClick={!value || value.length === 0 ? onImageUpload : () => onImageUpdate(0)}
//           className="form-control purple-btn2"
//         >
//           Upload Image
//         </button>
//       )}
//     </ImageUploading>
//   );
// };

// const ImageCropper = ({ open, image, formData, setFormData, onComplete, containerStyle, requiredRatio, requiredRatioLabel, ...props }) => {
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//   const [aspect, setAspect] = useState(requiredRatio || 1);
//   const [aspectLabel, setAspectLabel] = useState(requiredRatioLabel || "1:1");
//   const [imageRatio, setImageRatio] = useState(null);
//   const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

//   useEffect(() => {
//     if (image) {
//       const img = new Image();
//       img.onload = () => {
//         const ratio = img.naturalWidth / img.naturalHeight;
//         setImageRatio(ratio);
//         setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
//         setCrop({ x: 0, y: 0 });
//         console.log(`Image dimensions: ${img.naturalWidth}x${img.naturalHeight}, Ratio: ${ratio}`);
//       };
//       img.src = image;
//     }
//   }, [image]);

//   const handleAspectChange = (targetAspect, label) => {
//     setAspect(targetAspect);
//     setAspectLabel(label);
//   };

//   const isRatioAcceptable = (actual, expected, tolerance = 0.2) => {
//     return Math.abs(actual - expected) <= tolerance;
//   };

//   const isGridSizeValid = () => {
//     if (requiredRatio === 16 / 9) {
//       const expectedWidth = 400;
//       const expectedHeight = 225;
//       return imageDimensions.width >= expectedWidth && imageDimensions.height >= expectedHeight;
//     }
//     return true;
//   };

//   const getContainerDimensions = () => {
//     const baseSize = 300;
//     if (aspect === 16 / 9) return { width: baseSize * 1.2, height: baseSize };
//     if (aspect === 9 / 16) return { width: baseSize, height: baseSize * 1.2 };
//     if (aspect === 3 / 2) return { width: baseSize * 1.1, height: baseSize * (2 / 3) };
//     return { width: baseSize, height: baseSize };
//   };

//   if (!open || !image) return null;

//   const { width, height } = getContainerDimensions();

//   // Convert base64 to File object
//   const base64ToFile = (base64, filename) => {
//     const arr = base64.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) {
//       u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new File([u8arr], filename, { type: mime });
//   };

//   return (
//     <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
//       <div className="modal-dialog modal-dialog-centered" style={{ borderRadius: "12px" }}>
//         <div className="modal-content rounded-3 overflow-hidden">
//           <div className="modal-header border-0 justify-content-center pt-4 pb-2">
//             <h5 className="modal-title text-center text-orange-600 fs-5 fw-semibold">
//               Crop Image
//             </h5>
//           </div>
//           <div className="modal-body px-4">
//             <div className="d-flex justify-content-center mb-4 flex-wrap" style={{ gap: "8px" }}>
//               {[{ label: "16:9", ratio: 16 / 9 }, { label: "9:16", ratio: 9 / 16 }, { label: "1:1", ratio: 1 }, { label: "3:2", ratio: 3 / 2 }].map(({ label, ratio }) => (
//                 <button
//                   key={label}
//                   onClick={() => handleAspectChange(ratio, label)}
//                   className={`px-3 py-2 rounded ${aspect === ratio ? "purple-btn2 text-white" : "border border-purple-500 text-purple-600 bg-white"}`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>
//             <div
//               style={{
//                 position: "relative",
//                 height,
//                 background: "#fff",
//                 borderRadius: "8px",
//                 overflow: "hidden",
//               }}
//             >
//               <Cropper
//                 image={image}
//                 crop={crop}
//                 zoom={1}
//                 aspect={aspect}
//                 onCropChange={setCrop}
//                 onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
//                 {...props}
//               />
//             </div>
//           </div>
//           <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex justify-content-end" style={{ gap: "10px" }}>
//             <button
//               className="px-4 py-2 rounded border border-gray-400 text-gray-700 bg-white hover:bg-gray-100"
//               onClick={() => onComplete(null)}
//             >
//               Cancel
//             </button>
//             <button
//               className="px-4 py-2 rounded purple-btn2 text-white"
//               onClick={async () => {
//                 if (croppedAreaPixels && image) {
//                   if (requiredRatio && !isRatioAcceptable(aspect, requiredRatio, 0.2)) {
//                     alert(`❌ Invalid crop ratio.\nSelected ratio (${aspectLabel}) does not match required ${requiredRatioLabel} ratio.`);
//                     return;
//                   }
//                   if (requiredRatio && !isRatioAcceptable(imageRatio, requiredRatio, 0.2)) {
//                     alert(`❌ Invalid image ratio.\nOriginal image ratio (${imageRatio?.toFixed(2)}) does not match required ${requiredRatioLabel} ratio.`);
//                     return;
//                   }
//                   if (requiredRatio === 16 / 9 && !isGridSizeValid()) {
//                     alert(`❌ Image dimensions too small.\nThe image does not fit the required 16:9 grid box (minimum 400x225 pixels).`);
//                     return;
//                   }
//                   const canvas = document.createElement("canvas");
//                   const img = new Image();
//                   img.crossOrigin = "anonymous";
//                   img.src = image;
//                   img.onload = () => {
//                     const ctx = canvas.getContext("2d");
//                     canvas.width = croppedAreaPixels.width;
//                     canvas.height = croppedAreaPixels.height;
//                     ctx.drawImage(
//                       img,
//                       croppedAreaPixels.x,
//                       croppedAreaPixels.y,
//                       croppedAreaPixels.width,
//                       croppedAreaPixels.height,
//                       0,
//                       0,
//                       croppedAreaPixels.width,
//                       croppedAreaPixels.height
//                     );
//                     const croppedBase64 = canvas.toDataURL("image/png");
//                     const croppedFile = base64ToFile(croppedBase64, "cropped_image.png");
//                     // Update formData directly
//                     onComplete({ base64: croppedBase64, file: croppedFile });
//                     setFormData({ ...formData, banner_video: croppedFile });

//                   };
//                 }
//               }}
//             >
//               Finish
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [previewImg, setPreviewImg] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [image, setImage] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);


  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    attachfile: null,
    banner_video: null,
    active: true,
  });
  // console.log(image[0].file);

  console.log("formData", formData);

  useEffect(() => {
    fetchBanner();
    fetchProjects();
    return () => {
      if (previewImg) URL.revokeObjectURL(previewImg);
      if (previewVideo && previewVideo.startsWith("blob:")) URL.revokeObjectURL(previewVideo);
    };
  }, [previewImg, previewVideo]);

  const fetchBanner = async () => {
    try {
      const response = await axios.get(`${baseURL}banners/${id}.json`);
      if (response.data) {
        setFormData({
          title: response.data.title,
          project_id: response.data.project_id,
          attachfile: response.data?.attachfile?.document_url || null,
          banner_video: response.data.banner_video?.document_url || null,
          active: true,
        });
        if (response.data.banner_video?.document_url) {
          setPreviewVideo(response.data.banner_video.document_url);
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      return;
    }
    if (previewImg) URL.revokeObjectURL(previewImg);
    const newPreviewImg = URL.createObjectURL(validFiles[0]);
    setPreviewImg(newPreviewImg);
    setFormData({ ...formData, attachfile: validFiles[0] });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedImageTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "image/svg+xml", "image/bmp", "image/tiff"
    ];
    const allowedVideoTypes = [
      "video/mp4", "video/webm", "video/ogg", "video/quicktime",
      "video/x-msvideo", "video/x-ms-wmv", "video/x-flv"
    ];

    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      toast.error("Please upload a valid image or video file.");
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (isImage && sizeInMB > 3) {
      toast.error("Image size must be less than 3MB.");
      return;
    }
    if (isVideo && sizeInMB > 10) {
      toast.error("Video size must be less than 10MB.");
      return;
    }

    if (previewVideo && previewVideo.startsWith("blob:")) {
      URL.revokeObjectURL(previewVideo);
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewVideo(previewUrl);
    setFormData((prev) => ({ ...prev, banner_video: file }));

    if (isImage) {
      const newImage = [{ file, dataURL: previewUrl }];
      setImage(newImage);
      setDialogOpen(true);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is mandatory";
    if (!formData.project_id) newErrors.project_id = "Project is mandatory";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (newImageList) => {
    if (!newImageList || newImageList.length === 0) return;

    const file = newImageList[0].file;
    if (!file) return;

    const allowedImageTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "image/bmp", "image/tiff"
    ];

    const allowedVideoTypes = [
      "video/mp4", "video/webm", "video/ogg", "video/quicktime",
      "video/x-msvideo", "video/x-ms-wmv", "video/x-flv"
    ];

    const fileType = file.type;
    const sizeInMB = file.size / (1024 * 1024);

    const isImage = allowedImageTypes.includes(fileType);
    const isVideo = allowedVideoTypes.includes(fileType);

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

    if (isImage) {
      setDialogOpen(true); // Open cropper only for images
    } else {
      // Optional: Handle video preview or upload
      const videoURL = URL.createObjectURL(file);
      setPreviewVideo(videoURL);
      setFormData((prev) => ({ ...prev, banner_video: file }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append("banner[title]", formData.title);
      sendData.append("banner[project_id]", formData.project_id);

      // Always use the File object for image upload
      if (image[0] && image[0].file instanceof File) {
        sendData.append("banner[banner_video]", image[0].file);
      }
      if (formData.banner_video instanceof File) {
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
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff"];
    if (typeof file === "string") {
      if (file.startsWith("data:image")) return true;
      const extension = file.split(".").pop().toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"].includes(extension);
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
                        Banner Attachment
                        <span
                          className="position-relative"
                          onMouseEnter={() => setShowVideoTooltip(true)}
                          onMouseLeave={() => setShowVideoTooltip(false)}
                        >
                          [i]
                          {showVideoTooltip && (
                            <span
                              className="tooltip bs-tooltip-top"
                              style={{
                                position: "absolute",
                                top: "-30px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                backgroundColor: "#000",
                                color: "#fff",
                                padding: "5px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              16:9 Format Should Only Be Allowed
                            </span>
                          )}
                        </span>
                      </label>
                      <ImageUploadingButton
                        value={image}
                        onChange={handleImageUpload}
                      />
                      <ImageCropper
                        open={dialogOpen}
                        image={image?.[0]?.dataURL || null}
                        onComplete={(cropped) => {
                          if (cropped) {
                            setCroppedImage(cropped.base64);
                            setPreviewVideo(cropped.base64);
                            setFormData((prev) => ({ ...prev, banner_video: cropped.file }));
                          }
                          setDialogOpen(false);
                        }}
                        requiredRatios={[16 / 9, 9 / 16]} // Accept either
                        requiredRatioLabel="16:9 or 9:16"
                        allowedRatios={[
                          { label: "16:9", ratio: 16 / 9 },
                          { label: "9:16", ratio: 9 / 16 },
                          { label: "1:1", ratio: 1 },
                        ]}
                        containerStyle={{ position: "relative", width: "100%", height: 300, background: "#fff" }}
                        formData={formData}
                        setFormData={setFormData}
                      />
                      {errors.banner_video && <span className="text-danger">{errors.banner_video}</span>}
                      <div className="mt-2">
                        {previewVideo ? (
                          isImageFile(previewVideo) ? (
                            <img
                              src={croppedImage || previewVideo}
                              className="img-fluid rounded mt-2"
                              alt="Image Preview"
                              style={{ maxWidth: "100px", maxHeight: "150px", objectFit: "cover" }}
                            />
                          ) : (
                            <video
                              src={previewVideo}
                              controls
                              className="img-fluid rounded mt-2"
                              style={{ maxWidth: "100px", maxHeight: "150px", objectFit: "cover" }}
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