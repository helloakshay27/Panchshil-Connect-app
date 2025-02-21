import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SitevisitCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    project_id: "",
    project_name: "",
    scheduled_at: "",
    selected_slot: "",
  });

  const [projectsType, setProjectsType] = useState([]);
  const [slots, setSlots] = useState([]);

  const apiUrl = "https://panchshil-super.lockated.com/site_schedule_requests";
  const projectsApiUrl =
    "https://panchshil-super.lockated.com/get_all_projects.json";
  const slotsApiUrl =
    "https://panchshil-super.lockated.com/site_schedule/get_site_schedules_for_user.json";
  const authToken = "4DbNsI3Y_weQFh2uOM_6tBwX0F9igOLonpseIR0peqs";
  const projectsAuthToken = "UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY";

  const formatDateForApi = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    axios
      .get(projectsApiUrl, {
        headers: {
          Authorization: `Bearer ${projectsAuthToken}`,
        },
      })
      .then((response) => {
        const data = response.data;
        const allProjects = [];

        if (data.featured) {
          allProjects.push(data.featured);
        }

        if (data.projects && Array.isArray(data.projects)) {
          allProjects.push(...data.projects);
        }

        setProjectsType(allProjects);
      })
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  // Fetch slots when user selects a date and project
  const fetchSlots = async (selectedDate, selectedProjectId) => {
    if (!selectedDate || !selectedProjectId) {
      console.error("Project ID and date are required to fetch slots.");
      return;
    }

    try {
      const formattedDate = formatDateForApi(selectedDate);
      const response = await axios.get(slotsApiUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { project_id: selectedProjectId, date: formattedDate },
      });

      console.log(
        "Fetching slots for project:",
        selectedProjectId,
        "date:",
        formattedDate,
        response.data
      );

      setSlots(response.data?.slots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to fetch slots.");
      setSlots([]);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updatedForm = { ...prev, [name]: value };

      if (name === "project_name") {
        const selectedProject = projectsType.find(
          (p) => p.id === parseInt(value)
        );

        updatedForm.project_name = selectedProject?.project_name || "";
        updatedForm.project_id = selectedProject?.id || "";
      }

      if (updatedForm.project_id && updatedForm.scheduled_at) {
        fetchSlots(updatedForm.scheduled_at, updatedForm.project_id);
      }

      return updatedForm;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.scheduled_at ||
      !formData.project_id ||
      !formData.selected_slot
    ) {
      toast.error("Please fill all required fields, including a time slot.");
      setLoading(false)
      return;
    }

    const requestData = {
      site_schedule_request: {
        scheduled_at: formatDateForApi(formData.scheduled_at),
        site_schedule_id: 2,
        project_id: formData.project_id,
        selected_slot: formData.selected_slot,
      },
    };

    try {
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      toast.success("Form submitted successfully");
      console.log("Response from API:", response.data);
      navigate("/sitevisit-list");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Error submitting schedule: ${error.message}`);
    } finally {
      setLoading(false)
    }
  };

  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="module-data-section p-3">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header3">
                <h3 className="card-title">Site Visit Create</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Project Selection */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Project Name <span style={{ color: "red" }}> *</span>
                        </label>
                        <select
                          className="form-control form-select"
                          name="project_name"
                          value={formData.project_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="" disabled>
                            Select Project
                          </option>
                          {projectsType.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.project_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Date <span style={{ color: "red" }}> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="date"
                          name="scheduled_at"
                          value={formData.scheduled_at}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slot Selection */}
                  {slots.length > 0 && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Select Available Slot</label>
                          <select
                            className="form-control form-select"
                            name="selected_slot"
                            value={formData.selected_slot || ""}
                            onChange={handleChange}
                            required
                          >
                            <option value="" disabled>
                              Select a time slot
                            </option>
                            {slots.map((slot) => (
                              <option
                                key={slot.id}
                                value={slot.id}
                                disabled={slot.slot_disabled}
                                style={{ color: slot.slot_color_code }}
                              >
                                {slot.ampm_timing}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="row mt-2 justify-content-center">
                    <div className="col-md-2">
                      <button type="submit" className="purple-btn2 w-100" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
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
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitevisitCreate;
