import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Upload, Video } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import "./banner-add.css";

const VideoTutorialCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tutorialData, setTutorialData] = useState({
    title: "",
    video_file: null,
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTutorialData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setTutorialData((previous) => ({ ...previous, video_file: null }));
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Please select only video files.");
      event.target.value = "";
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Video file must be less than 50MB.");
      event.target.value = "";
      return;
    }

    setTutorialData((previous) => ({ ...previous, video_file: file }));
  };

  const removeVideo = () => {
    setTutorialData((previous) => ({ ...previous, video_file: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tutorialData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    toast.dismiss();

    try {
      const formData = new FormData();
      formData.append("video_tutorial[title]", tutorialData.title);

      if (tutorialData.video_file) {
        formData.append("video_tutorial[video_file]", tutorialData.video_file);
      }

      await axios.post(`${baseURL}video_tutorials.json`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      toast.success("Video Tutorial created successfully!");
      navigate("/setup-member/video-tutorials-list");
    } catch (error) {
      console.error("Error creating video tutorial:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/setup-member/video-tutorials-list");
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Video size={16} strokeWidth={1.8} />
                </span>
                Create Video Tutorial
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Title"
                      required
                      name="title"
                      placeholder="Enter Title"
                      value={tutorialData.title}
                      onChange={handleInputChange}
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
                Video File
              </h3>
            </div>
            <div className="card-body">
              <input
                ref={fileInputRef}
                type="file"
                name="video_file"
                accept="video/*"
                onChange={handleFileChange}
                className="banner-upload-native-input"
              />
              <div className="banner-upload-dropzone">
                <button
                  type="button"
                  className="banner-upload-files-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} strokeWidth={1.8} />
                  Upload Files
                </button>
                <span className="banner-upload-item-label">
                  Video File
                  <span
                    className="banner-upload-hint tooltip-container"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    [i]
                    {showTooltip && (
                      <span className="tooltip-text">
                        Only video files allowed (Max 50MB)
                      </span>
                    )}
                  </span>
                </span>
              </div>

              {tutorialData.video_file && (
                <div className="mt-3 position-relative d-inline-block">
                  <video
                    src={URL.createObjectURL(tutorialData.video_file)}
                    controls
                    className="img-fluid rounded"
                    style={{
                      width: "200px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    className="position-absolute border-0 rounded-circle d-flex align-items-center justify-content-center"
                    title="Remove video"
                    style={{
                      top: 2,
                      right: -5,
                      height: 20,
                      width: 20,
                      backgroundColor: "var(--red)",
                      color: "white",
                    }}
                    onClick={removeVideo}
                  >
                    x
                  </button>
                  <div className="mt-1">
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      {tutorialData.video_file.name.length > 20
                        ? `${tutorialData.video_file.name.substring(0, 20)}...`
                        : tutorialData.video_file.name}
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoTutorialCreate;
