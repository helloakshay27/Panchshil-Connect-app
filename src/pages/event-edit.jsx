import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const EventEdit = () => {
  const { eventId } = useParams(); // Get event ID from URL params
  const navigate = useNavigate();
  //const { id } = useParams();
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

  const [eventType, setEventType] = useState([]);
  const [eventUserID, setEventUserID] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/events/${eventId}.json`
        );
        setFormData(response.data.event); // Set existing event data in form
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/events.json"
        );
        setEventType(response.data.events);
      } catch (error) {
        console.error("Error fetching event types:", error);
      }
    };

    fetchEventTypes();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/users/get_users"
        );
        setEventUserID(response.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Handle input change for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      alert("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      e.target.value = "";
      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      attachfile: validFiles,
    }));
  };

  // Handle radio input changes
  const handleRadioChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = (formData) => {
    const errors = [];
    if (!formData.event_name) errors.push("Event Name is required.");
    if (!formData.event_at) errors.push("Event At is required.");
    if (!formData.from_time) errors.push("Event from time is required.");
    if (!formData.to_time) errors.push("Event to Time is required.");
    if (!formData.rsvp_action) errors.push("RSVP action is required.");
    if (!formData.description) errors.push("Event description is required.");
    if (!formData.comment) errors.push("Event Comment is required.");
    if (!formData.shared) errors.push("Event Shared is required.");
    if (!formData.share_groups) errors.push("Event Shared Group is required.");
    if (!formData.attachfile.length) errors.push("Attachment is required.");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      console.log(validationErrors);
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
    data.append("event[user_id]", formData.user_id);
    data.append("event[comment]", formData.comment);
    data.append("event[shared]", formData.shared);
    data.append("event[share_groups]", formData.share_groups);
    data.append("event[is_important]", formData.is_important);
    data.append("event[email_trigger_enabled]", formData.email_trigger_enabled);

    if (formData.attachfile.length > 0) {
      formData.attachfile.forEach((file) => {
        data.append("event[event_image]", file);
      });
    }

    try {
      const response = await axios.put(
        `https://panchshil-super.lockated.com/events/${eventId}.json`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Event updated successfully!");
      navigate("/event-list");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event.");
    }
  };


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
                          value={formData.event_type || eventId?.event_type}
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
                          value={formData.user_id || event?.user_id}
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

export default EventEdit;
