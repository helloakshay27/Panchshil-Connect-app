import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
  });

  console.log("formData", formData);
  const [eventType, setEventType] = useState([]);
  const [eventUserID, setEventUserID] = useState([]);
  const [files, setFiles] = useState([]);

  console.log("AA", eventType);
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
  const handleFileChange = (e, fieldName) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    // Filter only valid image files
    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      alert("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      e.target.value = ""; // Reset the input if invalid file is detected
      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      attachfile: validFiles, // Store only valid images
    }));
  };

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
    if (!formData.event_at) {
      errors.push("Event At is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.from_time) {
      errors.push("Event from time is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.to_time) {
      errors.push("Event to Time is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.rsvp_action) {
      errors.push("RSVP action is required.");
      return errors; // Return the first error immediately
    }
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

    // Validate form data
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n")); // Show all errors in an alert
      return; // Stop form submission
    }
  

    // Create FormData to send with the request
    const data = new FormData();

    // Populate FormData with values from formData
    data.append("event[event_type]", formData.event_type);
    data.append("event[event_name]", formData.event_name);
    data.append("event[event_at]", formData.event_at);
    data.append("event[from_time]", formData.from_time);
    data.append("event[to_time]", formData.to_time);
    data.append("event[rsvp_action]", formData.rsvp_action);
    data.append("event[description]", formData.description);
    data.append("event[publish]", formData.publish);
    data.append("event[user_id]", formData.user_id);
    data.append("event[comment]", formData.comment);
    data.append("event[shared]", formData.shared);
    data.append("event[share_groups]", formData.share_groups);
    data.append("event[is_important]", formData.is_important);
    data.append("event[email_trigger_enabled]", formData.email_trigger_enabled);

    // Append files to FormData
    if (formData.attachfile.length > 0) {
      formData.attachfile.forEach((file, index) => {
        data.append("event[event_image]", file);
      });
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "attachfile" && value.length > 0) {
        value.forEach((file) => data.append("event[event_image]", file));
      } else {
        data.append(`event[${key}]`, value);
      }
    });
    
    // Log the data object to see what it contains
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      // Make the POST request
      const response = await axios.post(
        "https://panchshil-super.lockated.com/events.json",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // Authorization: `Bearer <your-token>`, // Replace with actual token
          },
        }
      );
      console.log(response.data);
      toast.success("Event created successfully");
      navigate("/event-list");
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/events.json";

      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/events.json",
          {}
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
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/users/get_users";

      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/users/get_users",
          {
            // headers: {
            //   Authorization: `Bearer ${token}`,
            // },
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

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="module-data-section p-3">
              <div className="card mt-3 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Event Create</h3>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Types</label>
                        <select
                          className="form-control form-select"
                          name="event_type"
                          value={formData.event_type}
                          onChange={handleChange}
                        >
                          <option value="" disabled>
                            Select Event Type
                          </option>
                          {eventType?.map((type, index) => (
                            <option key={index} value={type.id}>
                              {type.event_type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Name</label>
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
                          placeholder="Enter Evnet At"
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
                          value={formData.from_time}
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
                          value={formData.to_time}
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
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>RSVP Action</label>
                        <input
                          className="form-control"
                          type="text"
                          name="rsvp_action"
                          placeholder="Enter RSVP Action"
                          value={formData.rsvp_action}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
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
                        <label>Event Publish</label>
                        <input
                          className="form-control"
                          type="text"
                          name="publish"
                          placeholder="Enter Event Publish"
                          value={formData.publish}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event User ID</label>
                        <select
                          className="form-control form-select"
                          name="user_id"
                          value={formData.user_id}
                          onChange={handleChange}
                        >
                          <option value="" disabled>
                            Select User ID
                          </option>
                          {eventUserID?.map((user, index) => (
                            <option
                              key={index}
                              value={user.firstname + " " + user.lastname}
                            >
                              {user.firstname} {user.lastname}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Comment</label>
                        <textarea
                          className="form-control"
                          rows={1}
                          name="comment"
                          placeholder="Enter Project Description"
                          value={formData.comment}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
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
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Share Groups</label>
                        <input
                          className="form-control"
                          type="text"
                          name="share_groups"
                          placeholder="Enter Shared Groups"
                          value={formData.share_groups}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Attachment
                          <span />
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachfile"
                          accept="image/*" // Ensures only image files can be selected
                          multiple
                          onChange={(e) => handleFileChange(e, "attachfile")}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-check mt-4">
                        <label className="form-group">Event is Important</label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="is_important"
                          value="true"
                          checked={formData.is_important === "true"}
                          onChange={handleRadioChange}
                        />

                        <input
                          className="form-check-input"
                          type="radio"
                          name="is_important"
                          value="false"
                          checked={formData.is_important === "false"}
                          onChange={handleRadioChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-check mt-4">
                        <label className="form-group">
                          Event Email Trigger Enabled
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="email_trigger_enabled"
                          value="true"
                          checked={formData.email_trigger_enabled === "true"}
                          onChange={handleRadioChange}
                        />

                        <input
                          className="form-check-input"
                          type="radio"
                          name="email_trigger_enabled"
                          value="false"
                          checked={formData.email_trigger_enabled === "false"}
                          onChange={handleRadioChange}
                        />
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventCreate;
