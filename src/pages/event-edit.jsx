import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const EventEdit = () => {
  const { id } = useParams();

  console.log("id", id);
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
    is_important: "false",
    email_trigger_enabled: "false",
  });

  console.log("Data", formData);

  const [eventType, setEventType] = useState([]);
  const [eventUserID, setEventUserID] = useState([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/events/${id}.json`
        );

        console.log("resp", response);
        setFormData(response?.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    if (id) fetchEvent();
  }, [id]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, attachfile: files }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "attachfile" && formData.attachfile.length > 0) {
        formData.attachfile.forEach((file) => {
          data.append("event[event_image]", file);
        });
      } else {
        data.append(`event[${key}]`, formData[key]);
      }
    });

    try {
      await axios.put(
        `https://panchshil-super.lockated.com/events/${id}.json`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Event updated successfully!");
      navigate("/event-list");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event.");
    }
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return ""; // Handle empty values
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // Extract "YYYY-MM-DDTHH:MM"
  };

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="module-data-section p-3">
              <div className="card mt-3 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Event Update</h3>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Types</label>
                        <select
                          name="event_type"
                          className="form-control form-select"
                          value={formData.event_type || "NA"}
                          onChange={handleChange}
                        >
                          {/* <option value="">Select Event Type</option> */}
                          {eventType.map((type, index) => (
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
                          value={formData.event_name || "NA"}
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
                          value={formData.event_at || "NA"}
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
                          value={formatDateForInput(formData.from_time) || "NA"}
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
                          value={formatDateForInput(formData.to_time) || "NA"}
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
                          value={formData.rsvp_action || "NA"}
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
                          value={formData.description || "NA"}
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
                          value={formData.publish || "NA"}
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
                          value={formData.comment || "NA"}
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
                          value={formData.shared || "NA"}
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
                          value={formData.share_groups || "NA"}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      {formData.previewImage ? (
                        <img
                          src={formData.previewImage}
                          alt="Uploaded Preview"
                          className="img-fluid rounded mt-2"
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                      ) : (
                        <img
                          src={formData?.attachfile?.document_url || "NA"}
                          className="img-fluid rounded mt-2"
                          alt={formData?.title || "Banner Image"}
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                      )}
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
                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2">
                    <button
                      onClick={handleSubmit}
                      type="submit"
                      className="purple-btn2 w-100"
                    >
                      Update
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
      </div>
    </>
  );
};

export default EventEdit;
