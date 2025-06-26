import React, { useEffect, useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { baseURL } from "./baseurl/apiDomain";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";

const PressReleasesCreate = () => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [image, setImage] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    release_date: "",
    // pr_image: [],
    attachment_url: "",
    press_source: "",
  });

  const fetchCompany = async () => {
    try {
      const response = await axios.get(`${baseURL}company_setups.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data.company_setups;
      console.log("Data", data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fieldName = e.target.name;

    if (fieldName === "pr_image") {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      // Maximum file size: 3MB (3 * 1024 * 1024 bytes)
      const maxFileSize = 3 * 1024 * 1024;

      // Validate file types
      const validImages = files.filter((file) =>
        allowedImageTypes.includes(file.type)
      );

      if (validImages.length !== files.length) {
        toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
        e.target.value = "";
        return;
      }

      // Validate file sizes
      const oversizedFiles = validImages.filter(
        (file) => file.size > maxFileSize
      );

      if (oversizedFiles.length > 0) {
        const oversizedFileNames = oversizedFiles
          .map((file) => file.name)
          .join(", ");
        toast.error("Image size must be less than 3MB.");
        e.target.value = "";
        return;
      }

      // All validations passed
      setFormData((prevFormData) => ({
        ...prevFormData,
        pr_image: validImages,
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (
      !formData.title.trim() &&
      !formData.release_date &&
      !formData.description.trim() &&
      (!formData.pr_image || formData.pr_image.length === 0) &&
      (!formData.attachment_url || formData.attachment_url.trim() === "")
    ) {
      toast.dismiss();
      toast.error("Please fill in all the required fields.");
      return false;
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Title is mandatory");
      return false;
    }

    if (!formData.release_date) {
      newErrors.release_date = "Press Releases Date is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Press Releases Date is mandatory");
      return false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Description is mandatory");
      return false;
    }

    if (!formData.pr_image || formData.pr_image.length === 0) {
      newErrors.pr_image = "Attachment (Image) is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Attachment (Image) is mandatory");
      return false;
    }

    if (!formData.attachment_url.trim()) {
      newErrors.attachment_url = "Attachment URL is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Attachment URL is mandatory");
      return false;
    }

    setErrors({});
    return true;
  };

  console.log(formData.release_date);

  const bannerUploadConfig = {
    "pr image": ["16:9"],
  };

  const currentUploadType = "pr image"; // Can be dynamic
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
      [key]: [...(prev[key] || []), ...files],
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

    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Authentication error: Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const sendData = new FormData();
      sendData.append("press_release[title]", formData.title);
      sendData.append("press_release[release_date]", formData.release_date);
      sendData.append("press_release[release_date]", formData.release_date);
      sendData.append("press_release[press_source]", formData.press_source);
      sendData.append("press_release[description]", formData.description);

      // Append multiple images
      // if (formData.pr_image?.length) {
      //   formData.pr_image.forEach((file) => {
      //     sendData.append("press_release[pr_image]", file);
      //   });
      // }

      Object.entries(formData).forEach(([key, images]) => {
        if (key.startsWith("pr_image_") && Array.isArray(images)) {
          images.forEach((img) => {
            const backendField =
              key.replace("pr_image_", "preview[pr_image_") + "]";
            // e.g., preview[pr_image_1by1]

            if (img.file instanceof File) {
              sendData.append(backendField, img.file);
            }
          });
        }
      });

      if (formData.attachment_url) {
        sendData.append(
          "press_release[attachment_url]",
          formData.attachment_url
        );
      }

      await axios.post(`${baseURL}press_releases.json`, sendData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Press release created successfully!");
      navigate("/pressreleases-list");
    } catch (error) {
      console.error("Error response:", error.response);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    navigate(-1);
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
    return file.type && imageTypes.includes(file.type);
  };
  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-aut">
          <div className="">
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Press Releases</h3>
              </div>
              <div className="card-body">
                <div className="row">
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
                        placeholder="Enter Title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Press Releases Date
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="Date"
                        name="release_date"
                        placeholder="Enter date"
                        value={formData.release_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Description
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={1}
                        name="description"
                        placeholder="Enter Description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Source Details
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={1}
                        name="press_source"
                        placeholder="Enter Source Details"
                        value={formData.press_source}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment
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
                            setFormData((prev) => ({
                              ...prev,
                              pr_image: [cropped.file],
                            }));
                          }
                          setDialogOpen(false);
                        }}
                        requiredRatios={[16 / 9, 9 / 16, 1]}
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
                        formData={formData}
                        setFormData={setFormData}
                      />
                      {errors.pr_image && (
                        <span className="error text-danger">
                          {errors.pr_image}
                        </span>
                      )}
                      <div className="mt-2">
                        {croppedImage ? (
                          <img
                            src={croppedImage}
                            className="img-fluid rounded mt-2"
                            alt="Image Preview"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span></span>
                        )}
                      </div>
                    </div>
                  </div> */}

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment URL
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="url"
                        name="attachment_url"
                        placeholder="Enter URL"
                        value={formData.attachment_url || ""}
                        onChange={handleChange}
                      />
                      {errors.attachment_url && (
                        <span className="error text-danger">
                          {errors.attachment_url}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment
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
                        <span
                          style={{ padding: "8px 12px", whiteSpace: "nowrap" }}
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

                      {/* Table to display uploaded images */}
                    </div>
                  </div>

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
                          {[
                            ...(formData.pr_image_16by9 || []).map((file) => ({
                              ...file,
                              type: "pr_image_16by9",
                            })),
                          ].map((file, index) => (
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
                              <td>{file.ratio}</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() => discardImage(file.type, file)}
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
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button
                onClick={handleSubmit}
                type="submit"
                className="purple-btn2 w-100"
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

export default PressReleasesCreate;