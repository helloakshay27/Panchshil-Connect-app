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
    user_id: "",
    comment: "",
    shared: "",
    share_groups: "",
    attachfile: [],
    previewImage: "",
    is_important: "false",
    email_trigger_enabled: "false",
    set_reminders_attributes: []
  });

  console.log("Data", formData);

  const [eventType, setEventType] = useState([]);
  const [eventUserID, setEventUserID] = useState([]);
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
        const response = await axios.get(
          `${baseURL}events/${id}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        // console.log(response?.data);
        setFormData((prev) => ({
          ...prev,
          ...response.data,
          attachfile: null, // Reset file input
          previewImage: response?.data?.attachfile?.document_url || "", // Set existing image preview
          set_reminders_attributes: response.data.reminders || [], // Set existing reminders
        }));
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    if (id) fetchEvent();
    console.log("project_id: " + formData.project_id);
  }, [id]);

  const [projects, setProjects] = useState([]); // State to store projects

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${baseURL}get_all_projects.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Fetched Projects:", response.data);

        setProjects(response.data.projects || []); // Ensure data structure is correct
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // useEffect(() => {
  //   const fetchEventTypes = async () => {
  //     try {
  //       const response = await axios.get(
  //         "${baseURL}events.json",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       setEventType(response.data.events);
  //     } catch (error) {
  //       console.error("Error fetching event types:", error);
  //     }
  //   };
  //   fetchEventTypes();
  // }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${baseURL}users/get_users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        attachfile: file, // Store actual file
        previewImage: URL.createObjectURL(file), // Generate preview
      }));
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "true", // Convert string to boolean
    }));
  };
  const validateForm = () => {
    // const errors = [];
    // if (!formData.event_name) {
    //   errors.push("Event Name is required.");
    //   return errors; // Return the first error immediately
    // }
    // return errors; // Return the first error message if any
    const errors = {}
    if (!formData.event_name) {
      errors.event_name = "Event Name is required.";
    }
    setFormErrors(errors); // Update state with errors

    if(Object.keys(errors).length > 0) {
     toast.error(Object.values(errors)[0]) 
     return false

    }
    return true; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const data = new FormData();

    // Append all form data fields
    Object.keys(formData).forEach((key) => {
      if (key === "attachfile" && formData.attachfile) {
        data.append("event[event_image]", formData.attachfile); // Ensure file is appended
      } else if (key === "set_reminders_attributes") {
        // Append reminders properly
        formData.set_reminders_attributes.forEach((reminder, index) => {
          if (reminder.id) {
            // Include the id for existing reminders
            data.append(`event[set_reminders_attributes][${index}][id]`, reminder.id);
          }
          data.append(`event[set_reminders_attributes][${index}][days]`, reminder.days);
          data.append(`event[set_reminders_attributes][${index}][hours]`, reminder.hours);
          if (reminder._destroy) {
            // Include _destroy flag for reminders marked for deletion
            data.append(`event[set_reminders_attributes][${index}][_destroy]`, true);
          }
        });
      } else {
        data.append(`event[${key}]`, formData[key]);
      }
    });

    // Append RSVP fields if RSVP action is "yes"
    if (formData.rsvp_action === "yes") {
      data.append("event[rsvp_name]", formData.rsvp_name || "");
      data.append("event[rsvp_number]", formData.rsvp_number || "");
    }

    try {
      await axios.put(
        `${baseURL}events/${id}.json`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        }
      );
      toast.success("Event updated successfully!");
      navigate("/event-list");
    } catch (error) {
      console.error("Error updating event:", error);
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
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
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
                          value: project.id,
                          label: project.project_name,
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
                        min={getCurrentDateTime()}
                        value={formatDateForInput(formData.to_time)}
                        onChange={handleChange}
                      />
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
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>

                    {formData.previewImage && (
                      <img
                        src={formData.previewImage}
                        alt="Uploaded Preview"
                        className="img-fluid rounded mt-2"
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          objectFit: "cover",
                        }}
                      />
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
          checked={formData.email_trigger_enabled === "true"}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              email_trigger_enabled: e.target.value,
            }))
          }
        />
        <label className="form-check-label">Yes</label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="email_trigger_enabled"
          value="false"
          checked={formData.email_trigger_enabled === "false"}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              email_trigger_enabled: e.target.value,
            }))
          }
        />
        <label className="form-check-label">No</label>
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
          disabled // Groups option is disabled for now
        />
        <label className="form-check-label" style={{ color: "black" }}>
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
                            value: user.id, // Store user.id
                            label: `${user.firstname} ${user.lastname}`, // Display full name
                          }))}
                          value={
                            Array.isArray(formData.user_id)
                              ? formData.user_id.map((id) => {
                                  const user = eventUserID.find(
                                    (user) => user.id === id
                                  ); // Find the user by ID
                                  return user
                                    ? { value: user.id, label: `${user.firstname} ${user.lastname}` } // Map to value and label
                                    : null;
                                }).filter(Boolean) // Filter out null values
                              : []
                          }
                          onChange={(selectedOptions) =>
                            setFormData((prev) => ({
                              ...prev,
                              user_id: selectedOptions.map(
                                (option) => option.value
                              ), // Store only the IDs
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
            ? formData.share_groups.split(",").map((id) => ({
                value: id,
                label: groups.find((group) => group.id.toString() === id)?.name,
              }))
            : []
        }
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
                          className="btn btn-danger w-100"
                          onClick={handleAddReminder}
                          disabled={!day && !hour}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {formData.set_reminders_attributes
                      .filter((reminder) => !reminder._destroy)
                      .map((reminder, index) => (
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
