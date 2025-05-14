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
    shared: "",
    share_groups: "",
    attachfile: [],
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

  const [reminderDateTime, setReminderDateTime] = useState(""); // Value for the date-time reminder
  const [reminders2, setReminders2] = useState([]); // List of reminders

  const handleAddNReminder = () => {
    if (new Date(reminderDateTime) >= new Date(formData.from_time)) {
      alert("Reminder date must be earlier than the Event From date.");
      return;
    }

    const diffInMs = new Date(formData.from_time) - new Date(reminderDateTime);

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
      (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    setReminders2((prev) => [...prev, { date: reminderDateTime, days, hours }]);

    setReminderDateTime("");
  };
  // const [reminderDateTime, setReminderDateTime] = useState(""); // Value for the date-time reminder
  // const [reminders, setReminders] = useState([]); // List of reminders

  // const handleAddReminder = () => {

  //   if (new Date(reminderDateTime) >= new Date(formData.from_time)) {
  //     alert("Reminder date must be earlier than the Event From date.");
  //     return;
  //   }

  //   const diffInMs = new Date(formData.from_time) - new Date(reminderDateTime);

  //   const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  //   const hours = Math.floor(
  //     (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  //   );

  //   setReminders((prev) => [...prev, { date: reminderDateTime, days, hours }]);

  //   setReminderDateTime("");
  // };

  // const handleRemoveReminder = (index) => {
  //   setReminders((prev) => prev.filter((_, i) => i !== index));
  // };

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
    setFormData((prevFormData) => ({
      ...prevFormData,
      set_reminders_attributes: prevFormData.set_reminders_attributes.filter(
        (_, i) => i !== index
      ),
    }));
  };
  // console.log("AA", eventType);
  console.log("bb", eventUserID);

  // Handle input change for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //for files into array
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); // Convert FileList to array
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    // ✅ Filter only valid image files
    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      e.target.value = ""; // Reset input field
      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      attachfile: [...prevFormData.attachfile, ...validFiles], // Append files
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

    // Required fields (text fields)
    // if (!formData.property_type) {
    //   errors.push("Project Type is required.");
    //   return errors; // Return the first error immediately
    // }
    // if (!formData.event_type) {
    //   errors.push("Event Type is Reqired.");
    //   return errors; // Return the first error immediately
    // }
    if (!formData.event_name) {
      errors.push("Event Name is required.");
      return errors; // Return the first error immediately
    }
    // if (!formData.event_at) {
    //   errors.push("Event At is required.");
    //   return errors; // Return the first error immediately
    // }
    // if (!formData.from_time) {
    //   errors.push("Event from time is required.");
    //   return errors; // Return the first error immediately
    // }
    // if (!formData.to_time) {
    //   errors.push("Event to Time is required.");
    //   return errors; // Return the first error immediately
    // }
    // if (!formData.rsvp_action) {
    //   errors.push("RSVP action is required.");
    //   return errors; // Return the first error immediately
    // }
    // if (formData.rsvp_action === "yes") {
    //   if (!formData.rsvp_name) {
    //     errors.push("RSVP Name is required.");
    //   }
    //   if (!formData.rsvp_number) {
    //     errors.push("RSVP Number is required.");
    //   }
    // }

    // Continue with other form validation checks...

    return errors;
    if (!formData.description) {
      errors.push("Event description is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.publish) {
      errors.push("Event Publish is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.user_id) {
      errors.push("Event User ID is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.comment) {
      errors.push("Event Comment is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.shared) {
      errors.push("Event Shared is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.share_groups) {
      errors.push("Event Shared Group is required.");
      return errors; // Return the first error immediately
    }
    // if (!formData.attachment) {
    //   errors.push("Attachment is required.");
    //   return errors; // Return the first error immediately
    // }

    // File validation (files must be present)
    if (!formData.attachfile) {
      errors.push("attachment is required.");
      return errors; // Return the first error immediately
    }
    // if (formData.two_d_images.length === 0) {
    //   errors.push("At least one 2D image is required.");
    //   return errors; // Return the first error immediately
    // }

    return errors; // Return the first error message if any
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    // Validate form data
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      setLoading(false);
      return;
    }

    // Create FormData to send with the request
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
    data.append("event[shared]", formData.shared);
    data.append("event[share_groups]", formData.share_groups);
    data.append("event[is_important]", formData.is_important);
    data.append("event[email_trigger_enabled]", formData.email_trigger_enabled);
    data.append("event[project_id]", selectedProjectId);
    if (formData.rsvp_action === "yes") {
      data.append("event[rsvp_name]", formData.rsvp_name);
      data.append("event[rsvp_number]", formData.rsvp_number);
    }
    formData.set_reminders_attributes.forEach((reminder, index) => {
      data.append(
        `event[set_reminders_attributes][${index}][days]`,
        reminder.days
      );
      data.append(
        `event[set_reminders_attributes][${index}][hours]`,
        reminder.hours
      );
    });

    // date reminder send
    reminders2.forEach((reminder, index) => {
      data.append(
        `event[set_reminders_attributes][${index}][reminder_on]`,
        reminder.date
      );
    });

    if (formData.attachfile && formData.attachfile.length > 0) {
      formData.attachfile.forEach((file) => {
        if (file instanceof File) {
          data.append("event[event_image]", file);
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
        share_groups: "",
        attachfile: [],
        is_important: "",
        email_trigger_enabled: "",
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
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
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

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
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
                          value={selectedProjectId || ""} // Ensure it's controlled
                          onChange={(value) => setSelectedProjectId(value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event Type
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
                        </label>
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
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event At
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_at"
                          placeholder="Enter Evnet At"
                          value={formData.event_at}
                          required
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event From
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
                        </label>
                        <input
                          className="form-control"
                          type="datetime-local"
                          name="from_time"
                          placeholder="Enter Event From "
                          value={formData.from_time}
                          required
                          min={new Date().toISOString().slice(0, 16)}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event To
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
                        </label>
                        <input
                          className="form-control"
                          type="datetime-local"
                          name="to_time"
                          placeholder="Enter Event To"
                          required
                          value={formData.to_time}
                          min={
                            formData.from_time ||
                            new Date().toISOString().slice(0, 16)
                          }
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Time</label>
                        <input
                          className="form-control"
                          type="time"
                          name="SFDC_Project_Id"
                          placeholder="Enter Event Time"
                          value=""
                        />
                      </div>
                    </div> */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          RSVP Action
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
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
                    </div> */}

                    {/* Conditionally render fields when 'Yes' is selected */}

                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Delete</label>
                        <input
                          className="form-control"
                          type="text"
                          name="SFDC_Project_Id"
                          placeholder="Enter Delete"
                          value=""
                        />
                      </div>
                    </div> */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event Description
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
                        </label>
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
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event Publish
                         
                        </label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="publish"
                              value="1"
                              checked={parseInt(formData.publish) === 1} // Convert to number for proper comparison
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  publish: parseInt(e.target.value), // Ensure value is stored as number
                                }))
                              }
                              required
                            />
                            <label className="form-check-label">Yes</label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="publish"
                              value="0"
                              checked={parseInt(formData.publish) === 0} // Convert to number for proper comparison
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  publish: parseInt(e.target.value), // Ensure value is stored as number
                                }))
                              }
                              required
                            />
                            <label className="form-check-label">No</label>
                          </div>
                        </div>
                      </div>
                    </div> */}

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
                            <label className="form-check-label">Yes</label>
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
                            <label className="form-check-label">No</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event Comment
                         
                        </label>
                        <textarea
                          className="form-control"
                          rows={1}
                          name="comment"
                          placeholder="Enter Comment"
                          value={formData.comment}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div> */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event Shared
                        
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          required
                          name="shared"
                          placeholder="Enter Event Shared"
                          value={formData.shared}
                          onChange={handleChange}
                        />
                      </div>
                    </div> */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event Share Groups
                         
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          required
                          name="share_groups"
                          placeholder="Enter Shared Groups"
                          value={formData.share_groups}
                          onChange={handleChange}
                        />
                      </div>
                    </div> */}

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Attachment
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
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
                          accept="image/*" // Ensures only image files can be selected
                          multiple
                          required
                          onChange={(e) => handleFileChange(e, "attachfile")}
                        />
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
                              name="shareWith"
                              value="individual"
                              checked={formData.shareWith === "individual"}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  shareWith: "individual",
                                }))
                              }
                            />
                            <label className="form-check-label" style={{ color: "black" }}>
                              Individuals
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="shareWith"
                              value="group"
                              // checked={formData.shareWith === "group"}
                              disabled
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  shareWith: "group",
                                }))
                              }
                            />
                            <label className="form-check-label" style={{ color: "black" }}>Groups</label>
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
                              formData.user_id
                                ? formData.user_id.split(",").map((id) => ({
                                    value: id,
                                    label:
                                      eventUserID.find(
                                        (user) => user.id.toString() === id
                                      )?.firstname +
                                      " " +
                                      eventUserID.find(
                                        (user) => user.id.toString() === id
                                      )?.lastname,
                                  }))
                                : []
                            } // Map the string of IDs back to objects for display
                            onChange={(selectedOptions) =>
                              setFormData((prev) => ({
                                ...prev,
                                user_id: selectedOptions
                                  .map((option) => option.value)
                                  .join(","), // Join IDs into a comma-separated string
                              }))
                            }
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
                                      label: groups.find(
                                        (group) => group.id.toString() === id
                                      )?.name,
                                    }))
                                : []
                            } // Map the string of IDs back to objects for display
                            onChange={(selectedOptions) =>
                              setFormData((prev) => ({
                                ...prev,
                                share_groups: selectedOptions
                                  .map((option) => option.value)
                                  .join(","), // Join IDs into a comma-separated string
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
                            <label className="form-check-label">Yes</label>
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
                            <label className="form-check-label">No</label>
                          </div>
                        </div>
                      </div>
                    </div>
                     <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          RSVP Action
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
                        </label>
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
                            style={{
                              height: "35px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            className="btn btn-danger w-100"
                            onClick={handleAddReminder}
                            disabled={!day && !hour}
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {formData.set_reminders_attributes.map(
                        (reminder, index) => (
                          <div className="row mb-2" key={index}>
                            <div className="col-md-2">
                              <input
                                type="text"
                                className="form-control"
                                value={`${reminder.days} Day(s)`}
                                readOnly
                              />
                            </div>
                            <div className="col-md-2">
                              <input
                                type="text"
                                className="form-control"
                                value={`${reminder.hours} Hour(s)`}
                                readOnly
                              />
                            </div>
                            <div className="col-md-2">
                              <button
                                style={{
                                  height: "35px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                className="btn btn-sm btn-danger w-100"
                                onClick={() => handleRemoveReminder(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event User ID
                         
                        </label>
                        <MultiSelectBox
                          options={eventUserID?.map((user) => ({
                            value: user.id,
                            label: `${user.firstname} ${user.lastname}`,
                          }))}
                          value={
                            formData.user_id
                              ? formData.user_id.split(",").map((id) => ({
                                  value: id,
                                  label:
                                    eventUserID.find(
                                      (user) => user.id.toString() === id
                                    )?.firstname +
                                    " " +
                                    eventUserID.find(
                                      (user) => user.id.toString() === id
                                    )?.lastname,
                                }))
                              : []
                          } // Map the string of IDs back to objects for display
                          onChange={(selectedOptions) =>
                            setFormData((prev) => ({
                              ...prev,
                              user_id: selectedOptions
                                .map((option) => option.value)
                                .join(","), // Join IDs into a comma-separated string
                            }))
                          }
                        />
                      </div>
                    </div> */}

                    {/* For Date Selection  */}
                    {/* <div className="col-6">
                        <div className="form-group">
                        <label>Set Reminders</label>
                        <div className="d-flex align-items-center mb-2">
                          
                          <input
                            className="form-control me-2"
                            placeholder="Time Before"
                            type="datetime-local"
                            value={reminderDateTime}
                            onChange={(e) =>
                              setReminderDateTime(e.target.value)
                            }
                          />
                          <button
                            className="btn btn-danger"
                            onClick={handleAddNReminder}
                            disabled={!reminderDateTime}
                          >
                            Add
                          </button>
                        </div>

                       
                        <div className="col-6">
                          {reminders2.map((reminder, index) => (
                            <div
                              key={index}
                              className="d-flex m-4 justify-content-between align-items-center mb-2"
                            >
                              <span>
                                {reminder.date} -{" "}
                                {reminder.days > 0
                                  ? `${reminder.days} day${
                                      reminder.days > 1 ? "s" : ""
                                    }`
                                  : ""}
                                {reminder.hours > 0
                                  ? ` ${reminder.hours} hour${
                                      reminder.hours > 1 ? "s" : ""
                                    }`
                                  : ""}{" "}
                                before
                              </span>
                              <div className="d-flex">
                                <button
                                  className="btn btn-sm btn-danger ms-2"
                                  onClick={() => handleRemoveNReminder(index)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>  */}
                    {/* <div className="col-4 ">
                        <div className="d-flex">
                          <div>Hours defore</div>
                          <div>Days before</div>
                          <div>
                            <button>Destroy</button>
                          </div>
                        </div>
                      </div> */}
                    {/* </div> */}
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
