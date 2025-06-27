import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import MultiSelectBox from "../components/base/MultiSelectBox";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const [errors, setErrors] = useState({});

  console.log("id", id);

  const [formData, setFormData] = useState({
    project_id: "",
    event_type: "",
    event_name: "",
    event_at: "",
    from_time: "",
    to_time: "",
    rsvp_action: "",
    rsvp_name: "",
    rsvp_number: "",
    description: "",
    publish: "",
    user_id: [], // Initialize as empty array
    comment: "",
    shared: "",
    group_id: [],
    // shareWith: "", // Default to individual
    attachfile: [], // Changed to array to handle multiple files
    previewImage: [],
    is_important: "false",
    email_trigger_enabled: "false",
    set_reminders_attributes: [],
    existingImages: [], // for previously uploaded images
    newImages: [], // for newly selected images
    cover_image: null, // Changed from array to single value
    existingCoverImage: null, // Add this to track existing cover image
  });

  console.log("Data", formData);

  const [eventType, setEventType] = useState([]);
  const [eventUserID, setEventUserID] = useState([]);
  const [groups, setGroups] = useState([]); // State to store groups
  const [loading, setLoading] = useState(false);

  const [reminderValue, setReminderValue] = useState("");
  const [reminderUnit, setReminderUnit] = useState("");
  const [image, setImage] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const timeOptions = [
    // { value: "", label: "Select Unit" },
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
  ];

  const timeConstraints = {
    minutes: { min: 0, max: 40320 },
    hours: { min: 0, max: 672 },
    days: { min: 0, max: 28 },
    weeks: { min: 0, max: 4 },
  };

  // Set Reminders
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [reminders, setReminders] = useState([]);

  const handleAddReminder = () => {
    if (!reminderValue || !reminderUnit) return;

    const newReminder = {
      value: reminderValue,
      unit: reminderUnit,
    };

    setFormData((prevFormData) => ({
      ...prevFormData,
      set_reminders_attributes: [
        ...prevFormData.set_reminders_attributes,
        newReminder,
      ],
    }));

    setReminderValue("");
    setReminderUnit("");
  };

  const handleRemoveReminder = (index) => {
    setFormData((prevFormData) => {
      const reminders = [...prevFormData.set_reminders_attributes];

      // Check if the reminder has an ID (existing reminder)
      if (reminders[index]?.id) {
        // Mark the reminder for deletion by adding `_destroy: true`
        reminders[index]._destroy = true;
      } else {
        // Remove the reminder directly if it's a new one
        reminders.splice(index, 1);
      }

      return {
        ...prevFormData,
        set_reminders_attributes: reminders,
      };
    });
  };

  // Convert reminders to API format before submission
  const prepareRemindersForSubmission = () => {
    return formData.set_reminders_attributes
      .map((reminder) => {
        if (reminder._destroy) {
          return { id: reminder.id, _destroy: true };
        }
        const baseReminder = { id: reminder.id };
        if (reminder.unit === "days") {
          baseReminder.days = Number(reminder.value);
        } else if (reminder.unit === "hours") {
          baseReminder.hours = Number(reminder.value);
        } else if (reminder.unit === "minutes") {
          baseReminder.minutes = Number(reminder.value);
        } else if (reminder.unit === "weeks") {
          baseReminder.weeks = Number(reminder.value);
        }
        return baseReminder;
      })
      .filter((r) => !r._destroy || r.id);
  };

  const eventUploadConfig = {
    'cover image': ['16:9']
  };


  const currentUploadType = 'cover image';
  const selectedRatios = eventUploadConfig[currentUploadType] || [];
  const dynamicLabel = currentUploadType.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  const dynamicDescription = `Supports ${selectedRatios.join(', ')} aspect ratios`;

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
      const formattedRatio = img.ratio.replace(':', 'by'); // e.g., "16:9" -> "16by9"
      const key = `${currentUploadType}_${formattedRatio}`.replace(/\s+/g, '_').toLowerCase(); // e.g., banner_image_16by9

      updateFormData(key, [img]); // send as array to preserve consistency
    });

    // setPreviewImg(validImages[0].preview); // preview first image only
    setShowUploader(false);
  };


  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${baseURL}events/${id}.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;

        // Format reminders
        // ...existing code...
        const formattedReminders = (data.reminders || []).map((reminder) => {
          if (typeof reminder.days !== "undefined" && reminder.days !== null) {
            return {
              id: reminder.id,
              value: reminder.days,
              unit: "days",
              _destroy: false,
            };
          } else if (
            typeof reminder.hours !== "undefined" &&
            reminder.hours !== null
          ) {
            return {
              id: reminder.id,
              value: reminder.hours,
              unit: "hours",
              _destroy: false,
            };
          } else if (
            typeof reminder.minutes !== "undefined" &&
            reminder.minutes !== null
          ) {
            return {
              id: reminder.id,
              value: reminder.minutes,
              unit: "minutes",
              _destroy: false,
            };
          } else if (
            typeof reminder.weeks !== "undefined" &&
            reminder.weeks !== null
          ) {
            return {
              id: reminder.id,
              value: reminder.weeks,
              unit: "weeks",
              _destroy: false,
            };
          }
          return reminder;
        });
        // ...existing code...

        setFormData((prev) => ({
          ...prev,
          ...data,
          set_reminders_attributes: formattedReminders,
        }));

        // Normalize user_id
        const userIds = Array.isArray(data.user_id)
          ? data.user_id
          : data.user_id
            ? [data.user_id]
            : [];

        // Determine share type
        let shared = "all";
        if (data.shared === 1) {
          shared = data.group_id ? "group" : "individual";
        }

        // Prepare cover image preview (extract from object)
        const existingCoverImage =
          data.cover_image && data.cover_image.document_url
            ? {
              url: data.cover_image.document_url,
              id: data.cover_image.id,
              isExisting: true,
            }
            : null;

        // Prepare existing event image previews
        const existingImages =
          data.event_images?.map((img) => ({
            url: img.document_url,
            type: img.document_content_type,
            id: img.id,
            isExisting: true,
          })) || [];

        setFormData((prev) => ({
          ...prev,
          ...data,
          user_id: userIds,
          shared: shared,
          attachfile: [],
          newImages: [],
          existingImages: existingImages,
          previewImage: existingImages,
          existingCoverImage: existingCoverImage, // <-- use the correct object
          cover_image: null,
          set_reminders_attributes: formattedReminders,
        }));

        console.log("project_id: ", data.project_id);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const [projects, setProjects] = useState([]); // State to store projects

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Size check: must be below 3MB
      if (file.size > 3 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          cover_image: "Image size must be less than 3MB",
        }));
        toast.error("Image size must be less than 3MB");
        e.target.value = ""; // Clear the input
        return;
      }

      // Clear previous error if size is valid
      setErrors((prev) => ({
        ...prev,
        cover_image: "",
      }));

      // Save the image
      setFormData((prev) => ({
        ...prev,
        cover_image: file,
        existingCoverImage: null,
      }));
    } else {
      // If no file is selected
      setFormData((prev) => ({
        ...prev,
        cover_image: null,
      }));
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseURL}get_all_projects.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Fetched Projects:", response.data);

        setProjects(response.data.projects || []); // Ensure data structure is correct
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseURL}users/get_users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setEventUserID(response.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${baseURL}usergroups.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        const groupsData = Array.isArray(response.data)
          ? response.data
          : response.data.usergroups || [];
        setGroups(groupsData);
      } catch (error) {
        console.error("Error fetching Groups:", error);
        setGroups([]);
      }
    };

    if (formData.shared === "group" && (!groups || groups.length === 0)) {
      fetchGroups();
    }
  }, [formData.shared]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      const allowedImages = [];
      const newPreviews = [];

      files.forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        // Validate size based on type
        if (isImage && file.size > 3 * 1024 * 1024) {
          toast.error("Image size must be less than 3MB");
          return;
        }

        if (isVideo && file.size > 10 * 1024 * 1024) {
          toast.error("Video size must be less than 10MB");
          return;
        }

        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not a supported file type`);
          return;
        }

        // If valid, add to list
        allowedImages.push(file);
        newPreviews.push({
          url: URL.createObjectURL(file),
          type: file.type,
          file: file,
          isExisting: false,
        });
      });

      if (allowedImages.length > 0) {
        setFormData((prev) => ({
          ...prev,
          attachfile: allowedImages,
          newImages: newPreviews,
          previewImage: [...prev.existingImages, ...newPreviews],
        }));
      }
    }
  };

  // Function to remove image from preview
  const handleRemoveImage = async (index) => {
    toast.dismiss();
    setFormData((prev) => {
      const imageToRemove = prev.previewImage[index];

      if (imageToRemove.isExisting) {
        // Call backend API to remove the image
        axios
          .delete(`${baseURL}events/${id}/remove_image/${imageToRemove.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          })
          .then(() => {
            toast.success("Image removed successfully!");
          })
          .catch(() => {
            toast.error("Failed to remove image from server.");
          });

        // Optimistically update UI
        const updatedExistingImages = prev.existingImages.filter(
          (img) => img.id !== imageToRemove.id
        );
        return {
          ...prev,
          existingImages: updatedExistingImages,
          previewImage: prev.previewImage.filter((_, i) => i !== index),
        };
      } else {
        // If it's a new image, remove from newImages and attachfile
        const newImageIndex = prev.newImages.findIndex(
          (img) => img.url === imageToRemove.url
        );

        if (newImageIndex !== -1) {
          const updatedNewImages = prev.newImages.filter(
            (_, i) => i !== newImageIndex
          );
          const updatedFiles = Array.from(prev.attachfile).filter(
            (_, i) => i !== newImageIndex
          );

          return {
            ...prev,
            newImages: updatedNewImages,
            attachfile: updatedFiles,
            previewImage: prev.previewImage.filter((_, i) => i !== index),
          };
        }
      }

      return prev;
    });
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "true", // Convert string to boolean
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.event_name) {
      errors.event_name = "Event Name is required.";
    }
    setFormErrors(errors); // Update state with errors

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return false;
    }
    return true; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    const data = new FormData();

    const preparedReminders = prepareRemindersForSubmission();

    const backendSharedValue = formData.shared === "all" ? 0 : 1;
    data.append("event[shared]", backendSharedValue);

    // === COVER IMAGE ===
    // === COVER IMAGE ===
    if (formData.cover_image && formData.cover_image instanceof File) {
      data.append("event[cover_image]", formData.cover_image);
    } else if (!formData.cover_image && !formData.existingCoverImage) {
      // Only send remove if both are null (user removed cover image)
      data.append("event[remove_cover_image]", "1");
    }

    // === EVENT IMAGES (NEW ONLY) ===
    if (Array.isArray(formData.attachfile)) {
      formData.attachfile.forEach((file) => {
        if (file instanceof File) {
          data.append("event[event_images][]", file);
        }
      });
    }

    Object.entries(formData).forEach(([key, images]) => {
      if (key.startsWith("cover_image") && Array.isArray(images)) {
        images.forEach((img) => {
          const backendField =
            key.replace("cover_image", "event[cover_image") + "]";
          if (img.file instanceof File) {
            data.append(backendField, img.file);
          }
        });
      }
    });

    // === REMINDERS ===

    preparedReminders.forEach((reminder, index) => {
      if (reminder.id)
        data.append(
          `event[set_reminders_attributes][${index}][id]`,
          reminder.id
        );
      if (reminder._destroy) {
        data.append(`event[set_reminders_attributes][${index}][_destroy]`, "1");
      } else {
        if (reminder.days)
          data.append(
            `event[set_reminders_attributes][${index}][days]`,
            reminder.days
          );
        if (reminder.hours)
          data.append(
            `event[set_reminders_attributes][${index}][hours]`,
            reminder.hours
          );
        if (reminder.minutes)
          data.append(
            `event[set_reminders_attributes][${index}][minutes]`,
            reminder.minutes
          );
        if (reminder.weeks)
          data.append(
            `event[set_reminders_attributes][${index}][weeks]`,
            reminder.weeks
          );
      }
    });

    // === USERS ===
    if (Array.isArray(formData.user_id)) {
      if (formData.user_id.length > 0) {
        formData.user_id.forEach((id) => data.append("event[user_ids][]", id));
      } else {
        data.append("event[user_ids][]", ""); // to clear users
      }
    }

    // For groups
    if (formData.group_id) {
      const groupIds = formData.group_id.split(",").filter(Boolean);
      if (groupIds.length > 0) {
        groupIds.forEach((id) => data.append("event[group_id][]", id));
      } else {
        data.append("event[group_id][]", ""); // to clear groups
      }
    }

    // === RSVP FIELDS ===
    if (formData.rsvp_action === "yes") {
      data.append("event[rsvp_name]", formData.rsvp_name || "");
      data.append("event[rsvp_number]", formData.rsvp_number || "");
    }

    // === REMOVED EXISTING IMAGES ===
    const originalIds = formData.existingImages?.map((img) => img.id) || [];
    const currentIds =
      formData.previewImage
        ?.filter((img) => img.isExisting)
        .map((img) => img.id) || [];

    const removedIds = originalIds.filter((id) => !currentIds.includes(id));
    removedIds.forEach((id) => data.append("event[removed_image_ids][]", id));

    // === EVERYTHING ELSE (Primitive values only) ===
    Object.entries(formData).forEach(([key, value]) => {
      if (
        [
          "cover_image",
          "attachfile",
          "existingImages",
          "newImages",
          "previewImage",
          "shared",
          "set_reminders_attributes",
          "user_id",
          "rsvp_name",
          "rsvp_number",
        ].includes(key)
      ) {
        return; // Skip handled keys
      }

      if (value !== null && value !== undefined && typeof value !== "object") {
        data.append(`event[${key}]`, value);
      }
    });



    // === SEND REQUEST ===
    try {
      const response = await axios.put(`${baseURL}events/${id}.json`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Event updated successfully!");
      navigate("/event-list");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Get local date and time in "YYYY-MM-DDTHH:MM" format
    const pad = (n) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const handleCancel = () => {
    navigate(-1);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleCoverImageUpload = (newImageList) => {
    if (!newImageList || newImageList.length === 0) return;

    const file = newImageList[0].file;
    if (!file) return;

    // Check if it's an image file
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Please upload a valid image file");
      return;
    }

    // Check file size (3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image size must be less than 3MB");
      return;
    }

    setImage(newImageList);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="main-content">
        <div className="">
          <div className="module-data-section container-fluid">
            <div className="module-data-section p-3">
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Edit Event</h3>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Project</label>
                        <SelectBox
                          options={projects.map((project) => ({
                            value: project.id, // Ensure this matches API response field
                            label: project.project_name, // Ensure correct field name
                          }))}
                          defaultValue={formData.project_id || ""}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              project_id: value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Type</label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_type"
                          placeholder="Enter Event Type"
                          value={formData.event_type || ""}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event Name
                          <span className="otp-asterisk"> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_name"
                          placeholder="Enter Event Name"
                          value={formData.event_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event At</label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_at"
                          placeholder="Enter Event At"
                          value={formData.event_at}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event From</label>
                        <input
                          className="form-control"
                          type="datetime-local"
                          name="from_time"
                          placeholder="Enter Event From"
                          value={formatDateForInput(formData.from_time) || ""}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event To</label>
                        <input
                          className="form-control"
                          type="datetime-local"
                          name="to_time"
                          placeholder="Enter Event To"
                          value={formatDateForInput(formData.to_time)}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Description</label>
                        <textarea
                          className="form-control"
                          rows={1}
                          name="description"
                          placeholder="Enter Project Description"
                          value={formData.description}
                          onChange={handleChange}
                        />
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
                                Max Upload Size for video 10 MB and for image 3
                                MB
                              </span>
                            )}
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachfile"
                          accept="image/*,video/*" // ✅ Accept only images and videos
                          multiple
                          onChange={handleFileChange} // Handle file selection
                        />
                      </div>

                      {/* Image Preview with Remove Button */}
                      {Array.isArray(formData.previewImage) &&
                        formData.previewImage.length > 0 && (
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {formData.previewImage.map((fileObj, index) => {
                              const { url, type, isExisting } = fileObj;
                              const isVideo = type.startsWith("video");

                              return (
                                <div key={index} className="position-relative">
                                  {isVideo ? (
                                    <video
                                      src={url}
                                      controls
                                      className="rounded"
                                      style={{
                                        maxWidth: "100px",
                                        maxHeight: "100px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={url}
                                      alt={`Preview ${index}`}
                                      className="img-fluid rounded"
                                      style={{
                                        maxWidth: "100px",
                                        maxHeight: "100px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                  {/* Remove button */}
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm position-absolute"
                                    style={{
                                      top: "-5px",
                                      right: "-5px",
                                      fontSize: "10px",
                                      width: "20px",
                                      height: "20px",
                                      padding: "0",
                                      borderRadius: "50%",
                                    }}
                                    onClick={() => handleRemoveImage(index)}
                                    title={
                                      isExisting
                                        ? "Remove existing image"
                                        : "Remove new image"
                                    }
                                  >
                                    ×
                                  </button>
                                  {/* Badge to show if image is existing or new */}
                                  <small
                                    className={`badge ${isExisting ? "bg-info" : "bg-success"
                                      } position-absolute`}
                                    style={{
                                      bottom: "-5px",
                                      left: "5px",
                                      fontSize: "8px",
                                    }}
                                  >
                                    {isExisting ? "" : ""}
                                  </small>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                    <div className="col-md-3">
                      <div className="form-group mt-3">
                        <label>
                          Cover Image
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
                        </label>
                        {/* <ImageUploadingButton
                          value={image}
                          onChange={handleCoverImageUpload}
                          btntext="Upload Cover Image"
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
                                cover_image: cropped.file,
                                existingCoverImage: null, 
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
                        /> */}

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
                            cursor: "pointer"
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: "#f8f9fa",
                              padding: "8px 16px",
                              borderRight: "1px solid #ccc"
                            }}
                          >
                            Choose file
                          </span>
                          <span style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
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

                        <div className="mt-2 d-flex flex-wrap">
                          {Array.isArray(formData.event_image_16by9) && formData.event_image_16by9.length > 0 ? (
                            formData.event_image_16by9.map((file, index) => (
                              <div
                                key={index}
                                className="position-relative"
                                style={{ marginRight: "10px", marginBottom: "10px" }}
                              >
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="img-fluid rounded"
                                  style={{
                                    maxWidth: "100px",
                                    maxHeight: "100px",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            ))
                          ) : croppedImage ? (
                            <div className="position-relative">
                              <img
                                src={croppedImage}
                                alt="Cover Preview"
                                className="img-fluid rounded"
                                style={{
                                  maxWidth: "100px",
                                  maxHeight: "100px",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ) : formData.existingCoverImage ? (
                            <div className="position-relative">
                              <img
                                src={formData.existingCoverImage.url}
                                alt="Existing Cover"
                                className="img-fluid rounded"
                                style={{
                                  maxWidth: "100px",
                                  maxHeight: "100px",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>

                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group mt-3">
                        <label>Mark Important</label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="is_important"
                              value="true"
                              checked={formData.is_important === true}
                              onChange={handleRadioChange}
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="is_important"
                              value="false"
                              checked={formData.is_important === false}
                              onChange={handleRadioChange}
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Share With Radio Buttons */}
                    <div className="col-md-4">
                      <div className="form-group mt-3">
                        <label>Share With</label>
                        <div className="d-flex gap-3">
                          {/* All */}
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="shared"
                              value="all"
                              checked={formData.shared === "all"}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  shared: "all",
                                  user_id: [],
                                  group_id: "",
                                }))
                              }
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              All
                            </label>
                          </div>
                          {/* Individuals */}
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="shared"
                              value="individual"
                              checked={formData.shared === "individual"}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  shared: "individual",
                                  group_id: "",
                                }))
                              }
                              disabled={
                                !eventUserID || eventUserID.length === 0
                              }
                            />
                            <label
                              className="form-check-label"
                              style={{
                                color:
                                  !eventUserID || eventUserID.length === 0
                                    ? "gray"
                                    : "black",
                              }}
                            >
                              Individuals
                            </label>
                          </div>
                          {/* Groups */}
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="shared"
                              value="group"
                              checked={formData.shared === "group"}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  shared: "group",
                                  user_id: [],
                                }))
                              }
                            />
                            <label
                              className="form-check-label"
                              style={{
                                color:
                                  !groups || groups.length === 0
                                    ? "black"
                                    : "black",
                              }}
                            >
                              Groups
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Individuals MultiSelect */}
                      {formData.shared === "individual" && (
                        <div className="form-group">
                          <label>Event User ID</label>
                          <MultiSelectBox
                            options={eventUserID?.map((user) => ({
                              value: user.id,
                              label: `${user.firstname} ${user.lastname}`,
                            }))}
                            value={
                              Array.isArray(formData.user_id)
                                ? formData.user_id.map((userId) => {
                                  const user = eventUserID.find(
                                    (u) => u.id === userId
                                  );
                                  return user
                                    ? {
                                      value: userId,
                                      label: `${user.firstname} ${user.lastname}`,
                                    }
                                    : {
                                      value: userId,
                                      label: `User ${userId}`,
                                    };
                                })
                                : []
                            }
                            onChange={(selectedOptions) =>
                              setFormData((prev) => ({
                                ...prev,
                                user_id: selectedOptions.map(
                                  (option) => option.value
                                ),
                              }))
                            }
                          />
                        </div>
                      )}

                      {/* Groups MultiSelect */}
                      {formData.shared === "group" && (
                        <div className="form-group">
                          <label>Share with Groups</label>
                          <MultiSelectBox
                            options={groups?.map((group) => ({
                              value: group.id,
                              label: group.name,
                            }))}
                            value={
                              formData.group_id
                                ? formData.group_id.split(",").map((id) => ({
                                  value: id,
                                  label:
                                    groups.find(
                                      (group) => group.id.toString() === id
                                    )?.name || `Group ${id}`,
                                }))
                                : []
                            }
                            onChange={(selectedOptions) =>
                              setFormData((prev) => ({
                                ...prev,
                                group_id: selectedOptions
                                  .map((option) => option.value)
                                  .join(","),
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-md-3">
                      <div className="form-group mt-3">
                        <label>Send Email</label>
                        <div className="d-flex">
                          {/* Yes Option */}
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="true"
                              checked={formData.email_trigger_enabled === true} // Compare as boolean
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  email_trigger_enabled:
                                    e.target.value === "true", // Convert to boolean
                                }))
                              }
                              required
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              Yes
                            </label>
                          </div>

                          {/* No Option */}
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="false"
                              checked={formData.email_trigger_enabled === false} // Compare as boolean
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  email_trigger_enabled:
                                    e.target.value === "true", // Convert to boolean
                                }))
                              }
                              required
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>RSVP Action</label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="rsvp_action"
                              value="yes"
                              checked={formData.rsvp_action === "yes"}
                              onChange={handleChange}
                              required
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="rsvp_action"
                              value="no"
                              checked={formData.rsvp_action === "no"}
                              onChange={handleChange}
                              required
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Show RSVP Name and RSVP Number only if RSVP Action is "yes" */}
                    {formData.rsvp_action === "yes" && (
                      <>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>RSVP Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter RSVP Name"
                              name="rsvp_name"
                              value={formData.rsvp_name || ""}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>RSVP Number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter RSVP Number"
                              name="rsvp_number"
                              value={formData.rsvp_number || ""}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Shared</label>
                        <input
                          className="form-control"
                          type="text"
                          name="shared"
                          placeholder="Enter Event Shared"
                          value={formData.shared}
                          onChange={handleChange}
                        />
                      </div>
                    </div> */}

                    <div className="col-md-6">
                      <label className="form-label">Set Reminders</label>

                      {/* Input fields for adding new reminders */}
                      <div className="row mb-2">
                        <div className="col-md-4">
                          <SelectBox
                            options={timeOptions}
                            value={reminderUnit || ""}
                            onChange={(value) => {
                              setReminderUnit(value);
                              setReminderValue("");
                            }}
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Value"
                            value={reminderValue}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const unit = reminderUnit;
                              const constraints = timeConstraints[unit] || {
                                min: 0,
                                max: Infinity,
                              };
                              if (
                                val >= constraints.min &&
                                val <= constraints.max
                              ) {
                                setReminderValue(e.target.value);
                              }
                            }}
                            min={timeConstraints[reminderUnit]?.min || 0}
                            max={timeConstraints[reminderUnit]?.max || ""}
                            title={
                              reminderUnit
                                ? `Must be between ${timeConstraints[reminderUnit].min} to ${timeConstraints[reminderUnit].max} ${reminderUnit}`
                                : "Please select a time unit first"
                            }
                            disabled={!reminderUnit}
                          />
                        </div>

                        <div className="col-md-4">
                          <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={handleAddReminder}
                            disabled={!reminderValue || !reminderUnit}
                            style={{
                              height: "35px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            Add Reminder
                          </button>
                        </div>
                      </div>

                      {/* Display added reminders */}
                      {formData.set_reminders_attributes
                        .filter((reminder) => !reminder._destroy)
                        .map((reminder, index) => (
                          <div className="row mb-2" key={index}>
                            <div className="col-md-4">
                              <select
                                className="form-control"
                                value={reminder.unit}
                                disabled
                                style={{ backgroundColor: "#f8f9fa" }}
                              >
                                {timeOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-4">
                              <input
                                type="number"
                                className="form-control"
                                value={reminder.value}
                                readOnly
                                style={{ backgroundColor: "#f8f9fa" }}
                              />
                            </div>

                            <div className="col-md-4">
                              <button
                                type="button"
                                className="btn btn-danger w-100"
                                onClick={() => handleRemoveReminder(index)}
                                style={{
                                  height: "35px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
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
        </div>
      </div>
    </>
  );
};

export default EventEdit;
