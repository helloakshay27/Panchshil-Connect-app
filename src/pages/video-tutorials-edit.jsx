import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FileText, Upload, Video } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import "./banner-add.css";

const VideoTutorialEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tutorialData, setTutorialData] = useState({
    title: "",
    video_file: null,
    existingVideoUrl: "",
    existingVideoContentType: "",
  });

  useEffect(() => {
    const fetchTutorial = async () => {
      if (!id) {
        toast.error("Tutorial ID not found");
        navigate("/setup-member/video-tutorials-list");
        return;
      }

      try {
        setFetchLoading(true);
        const response = await axios.get(
          `${baseURL}video_tutorials/${id}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );

        const tutorial = response.data.video_tutorial || response.data;
        const videoAttachment =
          tutorial.video_attachment ||
          tutorial.video_file ||
          tutorial.attachment;

        setTutorialData({
          title: tutorial.title || tutorial.name || "",
          video_file: null,
          existingVideoUrl:
            videoAttachment?.document_url || tutorial.video_file_url || "",
          existingVideoContentType: videoAttachment?.document_content_type || "",
        });
      } catch (error) {
        console.error("Error fetching video tutorial:", error);
        if (error.response?.status === 404) {
          toast.error("Video tutorial not found");
        } else {
          toast.error("Failed to load video tutorial data");
        }
        navigate("/setup-member/video-tutorials-list");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchTutorial();
  }, [id, navigate]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTutorialData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

  const removeNewVideo = () => {
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

      await axios.put(`${baseURL}video_tutorials/${id}.json`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      toast.success("Video Tutorial updated successfully!");
      navigate("/setup-member/video-tutorials-list");
    } catch (error) {
      console.error("Error updating video tutorial:", error);

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

  if (fetchLoading) {
    return (
      <div className="main-content">
        <div className="module-data-section banner-form-page p-3">
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Video size={16} strokeWidth={1.8} />
                </span>
                Loading...
              </h3>
            </div>
            <div className="card-body">
              <p className="mb-0">Loading video tutorial...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const previewSrc = tutorialData.video_file
    ? URL.createObjectURL(tutorialData.video_file)
    : tutorialData.existingVideoUrl;

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
                Edit Video Tutorial
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

              {previewSrc && (
                <div className="mt-3 position-relative d-inline-block">
                  <video
                    src={previewSrc}
                    controls
                    className="img-fluid rounded"
                    style={{
                      width: "200px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                  {tutorialData.video_file && (
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
                      onClick={removeNewVideo}
                    >
                      x
                    </button>
                  )}
                  {tutorialData.video_file && (
                    <div className="mt-1">
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        {tutorialData.video_file.name}
                      </small>
                    </div>
                  )}
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
              {loading ? "Updating..." : "Update"}
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

export default VideoTutorialEdit;
