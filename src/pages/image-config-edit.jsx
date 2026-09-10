import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Image } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import FormTextField from "../components/base/FormTextField";
import SelectBox from "../components/base/SelectBox";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const EditImagesConfiguration = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from URL parameters
  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  // Define the name options (static)
  const nameOptions = [
    { value: "ProjectImage", label: "ProjectImage" },
    { value: "VideoPreviewImage", label: "VideoPreviewImage" },
    { value: "ProjectCoverImage", label: "ProjectCoverImage" },
    { value: "ProjectCarouselImage", label: "ProjectCarouselImage" },
    { value: "Project2DImage", label: "Project2DImage" },
    { value: "ProjectGallery", label: "ProjectGallery" },
    { value: "TestimonialPreviewImage", label: "TestimonialPreviewImage" },
    { value: "BannerAttachment", label: "BannerAttachment" },
    { value: "EventImage", label: "EventImage" },
    { value: "EventCoverImage", label: "EventCoverImage" },
    { value: "EvenetThumbnailImage", label: "EvenetThumbnailImage" },
    { value: "BroadcastImage", label: "BroadcastImage" }
  ];

  // Define value options for each name
  const valueOptionsMap = {
    ProjectImage: [
      { value: "image_1_by_1", label: "image_1_by_1" },
      { value: "image_3_by_2", label: "image_3_by_2" },
      { value: "image_9_by_16", label: "image_9_by_16" },
      { value: "image_16_by_9", label: "image_16_by_9" }
    ],
    VideoPreviewImage: [
      { value: "preview_image_1_by_1", label: "preview_image_1_by_1" },
      { value: "preview_image_3_by_2", label: "preview_image_3_by_2" },
      { value: "preview_image_9_by_16", label: "preview_image_9_by_16" },
      { value: "preview_image_16_by_9", label: "preview_image_16_by_9" }
    ],
    ProjectCoverImage: [
      { value: "cover_images_1_by_1", label: "cover_images_1_by_1" },
      { value: "cover_images_3_by_2", label: "cover_images_3_by_2" },
      { value: "cover_images_9_by_16", label: "cover_images_9_by_16" },
      { value: "cover_images_16_by_9", label: "cover_images_16_by_9" }
    ],
    ProjectCarouselImage: [
      { value: "carousel_images_1_by_1", label: "carousel_images_1_by_1" },
      { value: "carousel_images_3_by_2", label: "carousel_images_3_by_2" },
      { value: "carousel_images_9_by_16", label: "carousel_images_9_by_16" },
      { value: "carousel_images_16_by_9", label: "carousel_images_16_by_9" }
    ],
    Project2DImage: [
      { value: "project_2d_image_1_by_1", label: "project_2d_image_1_by_1" },
      { value: "project_2d_image_3_by_2", label: "project_2d_image_3_by_2" },
      { value: "project_2d_image_9_by_16", label: "project_2d_image_9_by_16" },
      { value: "project_2d_image_16_by_9", label: "project_2d_image_16_by_9" }
    ],
    ProjectGallery: [
      { value: "gallery_image_1_by_1", label: "gallery_image_1_by_1" },
      { value: "gallery_image_3_by_2", label: "gallery_image_3_by_2" },
      { value: "gallery_image_9_by_16", label: "gallery_image_9_by_16" },
      { value: "gallery_image_16_by_9", label: "gallery_image_16_by_9" }
    ],
    TestimonialPreviewImage: [
      { value: "preview_image_1_by_1", label: "preview_image_1_by_1" },
      { value: "preview_image_3_by_2", label: "preview_image_3_by_2" },
      { value: "preview_image_9_by_16", label: "preview_image_9_by_16" },
      { value: "preview_image_16_by_9", label: "preview_image_16_by_9" }
    ],
    BannerAttachment: [
      { value: "banner_video_1_by_1", label: "banner_video_1_by_1" },
      { value: "banner_video_3_by_2", label: "banner_video_3_by_2" },
      { value: "banner_video_9_by_16", label: "banner_video_9_by_16" },
      { value: "banner_video_16_by_9", label: "banner_video_16_by_9" }
    ],
    EventImage: [
      { value: "event_images_1_by_1", label: "event_images_1_by_1" },
      { value: "event_images_3_by_2", label: "event_images_3_by_2" },
      { value: "event_images_9_by_16", label: "event_images_9_by_16" },
      { value: "event_images_16_by_9", label: "event_images_16_by_9" }
    ],
    EventCoverImage: [
      { value: "cover_image_1_by_1", label: "cover_image_1_by_1" },
      { value: "cover_image_3_by_2", label: "cover_image_3_by_2" },
      { value: "cover_image_9_by_16", label: "cover_image_9_by_16" },
      { value: "cover_image_16_by_9", label: "cover_image_16_by_9" }
    ],
    EvenetThumbnailImage: [
      { value: "thumbnail_images_1_by_1", label: "thumbnail_images_1_by_1" },
      { value: "thumbnail_images_3_by_2", label: "thumbnail_images_3_by_2" },
      { value: "thumbnail_images_9_by_16", label: "thumbnail_images_9_by_16" },
      { value: "thumbnail_images_16_by_9", label: "thumbnail_images_16_by_9" }
    ],
     BroadcastImage: [
      { value: "noticeboard_images_1_by_1", label: "noticeboard_images_1_by_1" },
      { value: "noticeboard_images_3_by_2", label: "noticeboard_images_3_by_2" },
      { value: "noticeboard_images_9_by_16", label: "noticeboard_images_9_by_16" },
      { value: "noticeboard_images_16_by_9", label: "noticeboard_images_16_by_9" }
    ]
  };

  // Fetch specific configuration data by ID
  useEffect(() => {
    const fetchConfiguration = async () => {
      if (!id) {
        toast.error("Configuration ID is required.");
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${baseURL}system_constants/${id}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        console.log("Configuration data:", response.data);
        
        // Check if it's an ImagesConfiguration
        if (response.data && response.data.description === "ImagesConfiguration") {
          setConfiguration(response.data);
          setSelectedName(response.data.name || "");
          setSelectedValue(response.data.value || "");
        } else {
          toast.error("Invalid configuration type.");
          navigate(-1);
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
        if (error.response?.status === 404) {
          toast.error("Configuration not found.");
        } else {
          toast.error("Failed to load configuration.");
        }
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguration();
  }, [id, navigate]);

  // Handle name change
  const handleNameChange = (value) => {
    setSelectedName(value);
    setSelectedValue(""); // Reset value when name changes
  };

  // Handle value change
  const handleValueChange = (value) => {
    setSelectedValue(value);
  };

  // Handle update API call
  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!configuration) return;

    if (!selectedName) {
      toast.error("Please select a name");
      return;
    }

    if (!selectedValue) {
      toast.error("Please select a value");
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        system_constant: {
          name: selectedName,
          value: selectedValue
        }
      };

      await axios.put(
        `${baseURL}system_constants/${configuration.id}.json`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success(`${selectedName} updated successfully!`);
      navigate("/setup-member/image-config-list"); // Redirect to the list page after successful update
      
      // Update the configuration state
      setConfiguration(prev => ({ ...prev, name: selectedName, value: selectedValue }));
      
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      toast.error(
        `Failed to update configuration: ${
          error.response?.data?.error || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };


  if (!configuration) {
    return (
      <div className="main-content">
        <div className="module-data-section banner-form-page p-3">
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-body text-center">
              <p className="text-muted mb-0">
                {loading ? "Loading..." : "Configuration not found."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleUpdate}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Image size={16} strokeWidth={1.8} />
                </span>
                Edit Images Configuration
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Name"
                      required
                      value={selectedName}
                      disabled
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Value"
                      required
                      placeholder="Select Value"
                      options={selectedName ? valueOptionsMap[selectedName] : []}
                      value={selectedValue}
                      onChange={handleValueChange}
                      disabled={loading || !selectedName}
                    />
                    {!selectedName && (
                      <small className="text-muted mt-1">
                        Please select a name first
                      </small>
                    )}
                  </div>
                </div>
              </div>
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

export default EditImagesConfiguration;