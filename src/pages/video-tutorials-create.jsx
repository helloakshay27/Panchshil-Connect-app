import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseURL } from "./baseurl/apiDomain";

const VideoTutorialCreate = () => {
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [tutorialData, setTutorialData] = useState({
    title: "",
    video_file: null,
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTutorialData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setTutorialData((prev) => ({ ...prev, video_file: null }));
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Please select only video files.");
      e.target.value = "";
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("Video file must be less than 50MB.");
      e.target.value = "";
      return;
    }

    setTutorialData((prev) => ({ ...prev, video_file: file }));
  };

  const validateForm = () => {
    if (!tutorialData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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

      setTutorialData({
        title: "",
        video_file: null,
      });

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

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
    navigate(-1);
  };

  return (
    <div className="">
      <div className="module-data-section p-3">
        <form onSubmit={handleSubmit}>
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Create Video Tutorial</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Title Field */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Title <span className="otp-asterisk"> *</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter Title"
                      name="title"
                      value={tutorialData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Video File Field */}
                <div className="col-md-3 mt-1">
                  <div className="form-group">
                    <label>
                      Video File{" "}
                      <span
                        className="tooltip-container"
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
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      name="video_file"
                      accept="video/*"
                      onChange={handleFileChange}
                    />

                    {tutorialData.video_file && (
                      <div className="mt-3">
                        <video
                          src={URL.createObjectURL(tutorialData.video_file)}
                          controls
                          className="img-fluid rounded"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "150px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="mt-1">
                          <small
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            {tutorialData.video_file.name.length > 20
                              ? `${tutorialData.video_file.name.substring(
                                  0,
                                  20
                                )}...`
                              : tutorialData.video_file.name}
                          </small>
                        </div>
                      </div>
                    )}
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
                className="purple-btn2 purple-btn2-shadow w-100"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="purple-btn2 purple-btn2-shadow w-100"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoTutorialCreate;
