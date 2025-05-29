import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import MultiSelectBox from "../components/base/MultiSelectBox";

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});

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
    share_groups: "",
    shareWith: "individual", // Default to individual
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

  // Set Reminders
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [reminders, setReminders] = useState([]);

  const handleAddReminder = () => {
    if (day === "" && hour === "") return;

    const newReminder = { days: day || 0, hours: hour || 0 };

    setFormData((prevFormData) => ({
      ...prevFormData,
      set_reminders_attributes: [
        ...prevFormData.set_reminders_attributes,
        newReminder,
      ],
    }));

    setDay("");
    setHour("");
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
      console.log("Updated Reminders:", reminders);

      return {
        ...prevFormData,
        set_reminders_attributes: reminders,
      };
    });
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
        const formattedReminders = (data.reminders || []).map((reminder) => ({
          ...reminder,
          days: Number(reminder.days || 0),
          hours: Number(reminder.hours || 0),
          id: reminder.id,
        }));

        // Normalize user_id
        const userIds = Array.isArray(data.user_id)
          ? data.user_id
          : data.user_id
          ? [data.user_id]
          : [];

        // Determine share type
        const shareWith = data.share_groups ? "group" : "individual";

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
          shareWith: shareWith,
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
    setFormData((prev) => ({
      ...prev,
      cover_image: file || null,
      existingCoverImage: null, // Clear existing if new selected
    }));
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
        const response = await axios.get(`${baseURL}groups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setGroups(response.data.groups || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, []);

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
      // Create preview objects for new files
      const newPreviews = files.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        file: file, // Keep reference to the actual file
        isExisting: false, // Flag to identify new images
      }));

      setFormData((prev) => ({
        ...prev,
        attachfile: files, // Store the actual files
        newImages: newPreviews, // Store new image previews separately
        // Combine existing and new images for preview
        previewImage: [...prev.existingImages, ...newPreviews],
      }));
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

    // === COVER IMAGE ===
    if (formData.cover_image instanceof File) {
      data.append("event[cover_image]", formData.cover_image);
    } else if (!formData.cover_image && formData.existingCoverImage === null) {
      // User removed the existing cover image
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

    // === REMINDERS ===
    if (Array.isArray(formData.set_reminders_attributes)) {
      formData.set_reminders_attributes.forEach((reminder, index) => {
        if (reminder.id) {
          data.append(
            `event[set_reminders_attributes][${index}][id]`,
            reminder.id
          );
        }
        data.append(
          `event[set_reminders_attributes][${index}][days]`,
          reminder.days ?? 0
        );
        data.append(
          `event[set_reminders_attributes][${index}][hours]`,
          reminder.hours ?? 0
        );
        if (reminder._destroy) {
          data.append(
            `event[set_reminders_attributes][${index}][_destroy]`,
            "1"
          );
        }
      });
    }

    // === USERS ===
    if (Array.isArray(formData.user_id)) {
      if (formData.user_id.length > 0) {
        formData.user_id.forEach((id) => data.append("event[user_ids][]", id));
      } else {
        data.append("event[user_ids][]", ""); // to clear users
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
          "shareWith",
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
    if (!isoString) return ""; // Handle empty values
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // Extract "YYYY-MM-DDTHH:MM"
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
                          min={getCurrentDateTime()}
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
                          min={getCurrentDateTime()}
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
                        <label>Attachment</label>
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
                                    className={`badge ${
                                      isExisting ? "bg-info" : "bg-success"
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
                        <label>Cover Image</label>
                        <input
                          className="form-control"
                          type="file"
                          name="cover_image"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                        />
                        {/* Cover Image Preview */}
                        {(formData.cover_image ||
                          formData.existingCoverImage) && (
                          <div className="position-relative mt-2">
                            <img
                              src={
                                formData.cover_image
                                  ? URL.createObjectURL(formData.cover_image)
                                  : formData.existingCoverImage?.url
                              }
                              alt="Cover Preview"
                              className="img-fluid rounded"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                objectFit: "cover",
                              }}
                            />
                            {/* ...remove button... */}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
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
                            <label className="form-check-label">Yes</label>
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
                            <label className="form-check-label">No</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Share With Radio Buttons */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Share With</label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="shareWith"
                              value="individual"
                              checked={formData.shareWith === "individual"}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  shareWith: "individual",
                                }))
                              }
                              disabled={
                                !eventUserID || eventUserID.length === 0
                              } // Disable if no users available
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
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="shareWith"
                              value="group"
                              checked={formData.shareWith === "group"}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  shareWith: "group",
                                }))
                              }
                              disabled={!groups || groups.length === 0} // Disable if no groups available
                            />
                            <label
                              className="form-check-label"
                              style={{
                                color:
                                  !groups || groups.length === 0
                                    ? "gray"
                                    : "black",
                              }}
                            >
                              Groups
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Conditional rendering based on selected option */}
                      {formData.shareWith === "individual" && (
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
                                        }; // Fallback if user not found
                                  })
                                : []
                            }
                            onChange={(selectedOptions) => {
                              console.log("Selected Users:", selectedOptions);
                              setFormData((prev) => ({
                                ...prev,
                                user_id: selectedOptions.map(
                                  (option) => option.value
                                ),
                              }));
                            }}
                          />
                        </div>
                      )}

                      {formData.shareWith === "group" && (
                        <div className="form-group">
                          <label>Share with Groups</label>
                          <MultiSelectBox
                            options={groups?.map((group) => ({
                              value: group.id,
                              label: group.name,
                            }))}
                            value={
                              formData.share_groups
                                ? formData.share_groups
                                    .split(",")
                                    .map((id) => ({
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
                                share_groups: selectedOptions
                                  .map((option) => option.value)
                                  .join(","),
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
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
                            <label className="form-check-label">Yes</label>
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
                            <label className="form-check-label">No</label>
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
                            <label className="form-check-label">Yes</label>
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
                            <label className="form-check-label">No</label>
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

                    <div className="col-md-12">
                      <label className="form-label">Set Reminders</label>
                      <div className="row mb-2">
                        <div className="col-md-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Days"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            min="0"
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Hours"
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            min="0"
                          />
                        </div>
                        <div className="col-md-2">
                          <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={handleAddReminder}
                            disabled={!day && !hour}
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Fixed reminders display - Always display numeric values */}
                      {formData.set_reminders_attributes
                        .filter((reminder) => !reminder._destroy) // Exclude reminders marked for deletion
                        .map((reminder, index) => (
                          <div className="row mb-2" key={index}>
                            <div className="col-md-2">
                              <input
                                type="text"
                                className="form-control"
                                value={`${Number(reminder.days)} Day(s)`}
                                readOnly
                              />
                            </div>
                            <div className="col-md-2">
                              <input
                                type="text"
                                className="form-control"
                                value={`${Number(reminder.hours)} Hour(s)`}
                                readOnly
                              />
                            </div>
                            <div className="col-md-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger w-100"
                                onClick={() => handleRemoveReminder(index)}
                              >
                                Remove
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
