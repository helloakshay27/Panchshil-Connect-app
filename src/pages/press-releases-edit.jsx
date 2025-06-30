import React, { useEffect, useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";

const PressReleasesEdit = () => {
  const [company, setCompany] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { id } = useParams();
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
    company_id: "",
    project_id: "",
    release_date: "",
    // pr_image: [],
    press_source: "",
    attachment_url: "",
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(`${baseURL}company_setups.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setCompany(response.data.company_setups);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompany();
  }, []);

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
  }, []);

  useEffect(() => {
    if (id) {
      const fetchPressRelease = async () => {
        try {
          const response = await axios.get(
            `${baseURL}press_releases/${id}.json`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = response.data;

          setFormData({
            title: data.title || "",
            description: data.description || "",
            company_id: data.company_id || "",
            project_id: data.project_id || "",
            release_date: data.release_date
              ? formatDateForInput(data.release_date)
              : "",
            pr_image: data.attachfile?.document_url || [],
            attachment_url: data.attachment_url || "",
            press_source: data.press_source || "",
          });
        } catch (error) {
          console.error("Error fetching press release:", error);
        }
      };

      fetchPressRelease();
    }
  }, [id]);

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString); // Convert string to Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed, so add 1
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // Format as yyyy-MM-dd
  };

  console.log(formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "release_date" ? value : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Since only one image is allowed
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

      // Validate file type
      if (file && !allowedImageTypes.includes(file.type)) {
        toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
        e.target.value = "";
        return;
      }

      // Validate file size
      if (file && file.size > maxFileSize) {
        toast.error("Image size must be less than 3MB.");
        e.target.value = "";
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        pr_image: file,
      }));
    }

    if (fieldName === "attachment_url") {
      const allowedPdfTypes = ["application/pdf"];

      // Maximum file size: 3MB (3 * 1024 * 1024 bytes) - if you want to apply same limit to PDFs
      const maxFileSize = 3 * 1024 * 1024;

      // Validate file type
      if (file && !allowedPdfTypes.includes(file.type)) {
        toast.error("Only PDF files are allowed.");
        e.target.value = "";
        return;
      }

      // Validate file size for PDFs (optional - remove if not needed)
      if (file && file.size > maxFileSize) {
        toast.error(
          `PDF file size must be 3MB or less. Current file size: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB`
        );
        e.target.value = "";
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        attachment_url: file,
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (
      !formData.title.trim() ||
      !formData.release_date ||
      !formData.description.trim() ||
      formData.pr_image.length === 0 ||
      !formData.attachment_url.trim()
    ) {
      toast.dismiss();
      toast.error("Please fill in all the required fields.");
      return false;
    }

    setErrors({});
    return true;
  };

  const pressUploadConfig = {
    "pr image": ["16:9"],
  };

  const currentUploadType = "pr image"; // Can be dynamic
  const selectedRatios = pressUploadConfig[currentUploadType] || [];
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
      const formattedRatio = img.ratio.replace(":", "_by_"); // e.g., "16:9" -> "16by9"
      const key = `${currentUploadType}_${formattedRatio}`
        .replace(/\s+/g, "_")
        .toLowerCase(); // e.g., banner_image_16by9

      updateFormData(key, [img]); // send as array to preserve consistency
    });

    // setPreviewImg(validImages[0].preview); // preview first image only
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
      sendData.append("press_release[company_id]", formData.company_id);
      sendData.append("press_release[release_date]", formData.release_date);
      sendData.append("press_release[description]", formData.description);
      sendData.append("press_release[project_id]", formData.project_id);
      sendData.append("press_release[press_source]", formData.press_source);

      // Append images
      // sendData.append("press_release[pr_image]", formData.pr_image);

      Object.entries(formData).forEach(([key, images]) => {
        if (key.startsWith("pr_image_") && Array.isArray(images)) {
          images.forEach((img) => {
            const backendField =
              key.replace("pr_image_", "press_release[pr_image_") + "]";
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

      await axios.put(`${baseURL}press_releases/${id}.json`, sendData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Press release updated successfully!");
      navigate("/pressreleases-list");
    } catch (error) {
      console.error("Error submitting form:", error);
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
    setDialogOpen(true);
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
      <div className="">
        <div className="">
          <div className="module-data-section container-fluid">
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Edit Press Release</h3>
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
                        Press Release Date
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="date"
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

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment URL <span className="otp-asterisk"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="url"
                        name="attachment_url"
                        placeholder="Enter URL"
                        value={formData.attachment_url}
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
                        // btntext="Upload Image"
                        variant="custom"
                        // buttonStyle={{ width: "120px", padding: "4px 10px", fontSize: "14px" }}
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
                              pr_image: cropped.file,
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
                        formData={formData}
                        setFormData={setFormData}
                      />
                      {errors.pr_image && (
                        <span className="text-danger">{errors.pr_image}</span>
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
                        ) : formData.pr_image &&
                          typeof formData.pr_image === "string" ? (
                          <img
                            src={formData.pr_image}
                            className="img-fluid rounded mt-2"
                            alt="Image Preview"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>No file selected</span>
                        )}
                      </div>
                    </div>
                  </div> */}
                  <div className="col-md-3 col-sm-6 col-12">
                    <div className="form-group">
                      {/* Label + Tooltip + Asterisk in one line */}
                      <label className="d-flex align-items-center gap-1 mb-2">
                        <span>Attachment</span>

                        <span
                          className="tooltip-container"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          style={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          [i]
                          {showTooltip && (
                            <span
                              className="tooltip-text"
                              style={{
                                marginLeft: '6px',
                                background: '#f9f9f9',
                                border: '1px solid #ccc',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                position: 'absolute',
                                zIndex: 1000,
                                fontSize: '13px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Max Upload Size 3 MB and Required ratio is 16:9
                            </span>
                          )}
                        </span>

                        <span className="otp-asterisk text-danger">*</span>
                      </label>

                      {/* Upload Button */}
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

                      {/* Upload Modal */}
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

                  <div className="col-md-12 mt-2">
                    {Array.isArray(formData.pr_image_16by9) &&
                      formData.pr_image_16by9.length > 0 ? (
                      // ✅ Uploaded table view
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
                              {formData.pr_image_16by9.map((file, index) => (
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
                                        discardImage("pr_image_16by9", file)
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
                    ) : (
                      // ✅ Fallback preview from croppedImage or formData.pr_image (existing)
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
                                <td>
                                  {croppedImage
                                    ? "Cropped Image"
                                    : "pr_image_16by9.jpg"}
                                </td>
                                <td>
                                  <img
                                    src={croppedImage || formData.pr_image}
                                    className="img-fluid rounded mt-2"
                                    alt="Image Preview"
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
                                      discardImage("pr_image_16by9", {
                                        preview:
                                          croppedImage || formData.pr_image,
                                        name: "pr_image_16by9.jpg",
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="purple-btn2 w-100"
              >
                {loading ? "Submitting..." : "Save "}
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
    </>
  );
};

export default PressReleasesEdit;