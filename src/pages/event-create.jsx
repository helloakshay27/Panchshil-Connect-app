import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import MultiSelectBox from "../components/base/MultiSelectBox";
import { baseURL } from "./baseurl/apiDomain";

const EventCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    event_type: "",
    event_name: "",
    event_at: "",
    from_time: "",
    to_time: "",
    rsvp_action: "",
    description: "",
    publish: "",
    user_id: "",
    comment: "",
    shared: 1,
    group_id: "",
    attachfile: [],
    cover_image: [],
    is_important: "",
    email_trigger_enabled: "",
    set_reminders_attributes: [],
  });

  console.log("formData", formData);
  const [eventType, setEventType] = useState([]);
  const [eventUserID, setEventUserID] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [groups, setGroups] = useState([]);

  // Enhanced reminder state
  const [reminderValue, setReminderValue] = useState("");
  const [reminderUnit, setReminderUnit] = useState("");

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

  console.log("bb", eventUserID);
  console.log("groups", groups);

  // Handle input change for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //for files into array
  const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB
  const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

    for (let file of selectedFiles) {
      const isImage = allowedImageTypes.includes(file.type);
      const isVideo = allowedVideoTypes.includes(file.type);

      // Type validation
      if (!isImage && !isVideo) {
        toast.error(
          `Invalid file type "${file.name}". Only JPG, PNG, GIF, WebP (images) or MP4, WebM, OGG (videos) allowed.`
        );
        e.target.value = "";
        return;
      }

      // Size validation
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        toast.error("Image size must be less than 3MB");
        e.target.value = "";
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        toast.error("Video size must be less than 10MB");
        e.target.value = "";
        return;
      }
    }

    // All files are valid ✅
    setFormData((prevFormData) => ({
      ...prevFormData,
      attachfile: [...prevFormData.attachfile, ...selectedFiles],
    }));
  };

  useEffect(() => {
    console.log("Updated attachfile:", formData.attachfile);
  }, [formData.attachfile]);

  const handleRadioChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update the state with the radio button's value
    }));
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const fileData = selectedFiles.map((file) => ({
      file: file,
      name: file.name,
      type: file.type,
      url: file.type.startsWith("image") ? URL.createObjectURL(file) : null,
    }));
    setFiles([...files, ...fileData]);
  };

  const validateForm = (formData) => {
    const errors = [];

    if (!formData.event_name) {
      errors.push("Event Name is required.");
      return errors; // Return the first error immediately
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    const preparedReminders = prepareRemindersForSubmission();

    // Use backend value for shared
    const backendSharedValue = formData.shared === "all" ? 0 : 1;

    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("event[event_type]", formData.event_type);
    data.append("event[event_name]", formData.event_name);
    data.append("event[event_at]", formData.event_at);
    data.append("event[from_time]", formData.from_time);
    data.append("event[to_time]", formData.to_time);
    data.append("event[rsvp_action]", formData.rsvp_action);
    data.append("event[description]", formData.description);
    data.append("event[publish]", formData.publish);
    data.append("event[user_ids]", formData.user_id);
    data.append("event[comment]", formData.comment);
    data.append("event[shared]", backendSharedValue); // <-- use backend value here
    data.append("event[group_id]", formData.group_id);
    data.append("event[is_important]", formData.is_important);
    data.append("event[email_trigger_enabled]", formData.email_trigger_enabled);
    data.append("event[project_id]", selectedProjectId);

    if (formData.cover_image && formData.cover_image.length > 0) {
      const file = formData.cover_image[0];
      if (file instanceof File) {
        data.append("event[cover_image]", file);
      }
    }

    if (formData.rsvp_action === "yes") {
      data.append("event[rsvp_name]", formData.rsvp_name);
      data.append("event[rsvp_number]", formData.rsvp_number);
    }

    // Updated reminder data appending
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

    if (formData.attachfile && formData.attachfile.length > 0) {
      formData.attachfile.forEach((file) => {
        if (file instanceof File) {
          data.append("event[event_images][]", file);
        } else {
          console.warn("Invalid file detected:", file);
        }
      });
    } else {
      toast.error("Attachment is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${baseURL}events.json`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Event created successfully!");
      setFormData({
        event_type: "",
        event_name: "",
        event_at: "",
        from_time: "",
        to_time: "",
        rsvp_action: "",
        description: "",
        publish: "",
        user_id: "",
        comment: "",
        shared: "",
        group_id: "",
        attachfile: [],
        cover_image: [],
        is_important: "",
        email_trigger_enabled: "",
        set_reminders_attributes: [],
      });

      navigate("/event-list");
    } catch (error) {
      console.error("Error submitting the form:", error);
      if (error.response && error.response.data) {
        toast.error(
          `Error: ${error.response.data.message || "Submission failed"}`
        );
      } else {
        toast.error("Failed to submit the form. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const url = `${baseURL}events.json`;

      try {
        const response = await axios.get(
          `${baseURL}events.json`,

          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        setEventType(response?.data?.events);
        console.log("eventType", eventType);
      } catch (error) {
        console.error("Error fetching Event:", error);
      }
    };

    fetchEvent();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `${baseURL}users/get_users.json`,

          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        setEventUserID(response?.data.users || []);
        // console.log("User", response)
        console.log("eventUserID", eventUserID);
      } catch (error) {
        console.error("Error fetching Event:", error);
      }
    };
    fetchEvent();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${baseURL}projects.json`,

          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data || error.message
        );
      }
    };

    fetchProjects();
  }, []);

  const handleCancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${baseURL}usergroups.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        // If response.data is an array, use it directly
        const groupsData = Array.isArray(response.data)
          ? response.data
          : response.data.usergroups || [];
        setGroups(groupsData);
        console.log("Fetched Groups:", groupsData);
      } catch (error) {
        console.error("Error fetching Groups:", error);
      }
    };

    if (formData.shared === "group" && groups.length === 0) {
      fetchGroups();
    }
  }, [formData.shared]);

  return (
    <>
      <div className="main-content">
        <div className="">
          <div className="module-data-section container-fluid">
            <div className="module-data-section p-3">
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Create Event</h3>
                </div>

                <div className="card-body">
                  {error && <p className="text-danger">{error}</p>}
                  <div className="row">
                    <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>Project</label>
                        <SelectBox
                          options={projects.map((proj) => ({
                            value: proj.id,
                            label: proj.project_name,
                          }))}
                          value={selectedProjectId || ""}
                          onChange={(value) => setSelectedProjectId(value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>Event Type</label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_type"
                          placeholder="Enter Event Type"
                          value={formData.event_type}
                          onChange={handleChange}
                          required
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
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>Event At</label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_at"
                          placeholder="Enter Event At"
                          value={formData.event_at}
                          required
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
                          placeholder="Enter Event From "
                          value={formData.from_time}
                          required
                          // min={new Date().toISOString().slice(0, 16)}
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
                          required
                          value={formData.to_time}
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
                          placeholder="Enter Description"
                          value={formData.description}
                          onChange={handleChange}
                          required
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
                                Max Upload Size 10 MB
                              </span>
                            )}
                          </span>
                          <span />
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachfile"
                          accept="image/* video/*"
                          multiple
                          required
                          onChange={(e) => handleFileChange(e, "attachfile")}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
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
                                Max Upload Size 10 MB
                              </span>
                            )}
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="cover_image"
                          accept="image/*"
                          required
                          onChange={(e) => {
                            const file = e.target.files[0];
                            const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

                            if (file && file.size > MAX_IMAGE_SIZE) {
                              toast.error("Image size must be less than 3MB");
                              e.target.value = ""; // Reset file input
                              return;
                            }

                            setFormData((prevFormData) => ({
                              ...prevFormData,
                              cover_image: file ? [file] : [],
                            }));
                          }}
                        />
                        {formData.cover_image && formData.cover_image[0] && (
                          <img
                            src={URL.createObjectURL(formData.cover_image[0])}
                            alt="Cover Preview"
                            className="img-fluid rounded mt-2"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
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
                              checked={formData.is_important === true} // Ensure boolean comparison
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_important: true, // Store as boolean
                                }))
                              }
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
                              checked={formData.is_important === false} // Ensure boolean comparison
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_important: false, // Store as boolean
                                }))
                              }
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
                        <label>Share With</label>
                        <div className="d-flex gap-3">
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
                                  user_id: "",
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
                                  group_id: "", // clear other
                                }))
                              }
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              Individuals
                            </label>
                          </div>

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
                                  user_id: "", // clear other
                                }))
                              }
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              Groups
                            </label>
                          </div>
                        </div>
                      </div>

                      {formData.shared === "individual" && (
                        <div className="form-group">
                          <label>Event User ID</label>
                          <MultiSelectBox
                            options={eventUserID.map((user) => ({
                              value: user.id,
                              label: `${user.firstname} ${user.lastname}`,
                            }))}
                            value={
                              formData.user_id
                                ? formData.user_id.split(",").map((id) => {
                                    const user = eventUserID.find(
                                      (u) => u.id.toString() === id
                                    );
                                    return {
                                      value: id,
                                      label: `${user?.firstname} ${user?.lastname}`,
                                    };
                                  })
                                : []
                            }
                            onChange={(selectedOptions) =>
                              setFormData((prev) => ({
                                ...prev,
                                user_id: selectedOptions
                                  .map((option) => option.value)
                                  .join(","),
                              }))
                            }
                          />
                        </div>
                      )}

                      {formData.shared === "group" && (
                        <div className="form-group">
                          <label>Share with Groups</label>
                          <MultiSelectBox
                            options={groups.map((group) => ({
                              value: group.id,
                              label: group.name,
                            }))}
                            value={
                              formData.group_id
                                ? formData.group_id.split(",").map((id) => {
                                    const group = groups.find(
                                      (g) => g.id.toString() === id
                                    );
                                    return {
                                      value: id,
                                      label: group?.name,
                                    };
                                  })
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
                      <div className="form-group">
                        <label>Send Email</label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="true"
                              checked={
                                formData.email_trigger_enabled === "true"
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  email_trigger_enabled: e.target.value, // Store "true" as string
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
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="false"
                              checked={
                                formData.email_trigger_enabled === "false"
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  email_trigger_enabled: e.target.value, // Store "false" as string
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
                              required
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
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

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

export default EventCreate;
