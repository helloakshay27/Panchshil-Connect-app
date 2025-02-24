import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const SitevisitEdit = () => {
  const [formData, setFormData] = useState({
    id: "",
    project_id: "",
    project_name: "",
    scheduled_at: "",
    selected_slot: "",
  });

  const { id } = useParams(); // Get ID from URL params for editing
  const [projectsType, setProjectsType] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const apiUrl =
    `https://panchshil-super.lockated.com/site_schedule_requests/${id}.json`;
  const projectsApiUrl =
    "https://panchshil-super.lockated.com/get_all_projects.json";
  const slotsApiUrl =
    "https://panchshil-super.lockated.com/site_schedule/get_site_schedules_for_user.json";

  const authToken = "4DbNsI3Y_weQFh2uOM_6tBwX0F9igOLonpseIR0peqs";
  const projectsAuthToken = "UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY";
  const authenticationToken = "eH5eu3-z4o42iaB-npRdy1y3MAUO4zptxTIf2YyT7BA";

  // Helper function to format date as DD-MM-YYYY
  const formatDateForApi = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Fetch project list on mount
  useEffect(() => {
    axios
      .get(projectsApiUrl, {
        headers: { Authorization: `Bearer ${projectsAuthToken}` },
      })
      .then((response) => setProjectsType(response.data.projects))
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  // Fetch site visit details when editing
  useEffect(() => {
    if (id) {
      axios
        .get(`${apiUrl}`, {
          headers: { Authorization: `Bearer ${authenticationToken}` },
        })
        .then((response) => {
          const siteVisit = response.data;
          setFormData({
            project_id: siteVisit.project_id,
            project_name: siteVisit.project_name,
            scheduled_at: siteVisit.scheduled_at,
            selected_slot: siteVisit.selected_slot,
          });

          // Fetch slots for this project & date
          fetchSlots(siteVisit.scheduled_at, siteVisit.project_id);
        })
        .catch((error) =>
          console.error("Error fetching site visit data:", error)
        );
    }
  }, [id]);

  // Fetch slots dynamically when project or date changes
  useEffect(() => {
    if (formData.project_id && formData.scheduled_at) {
      fetchSlots(formData.scheduled_at, formData.project_id);
    }
  }, [formData.project_id, formData.scheduled_at]);

  const fetchSlots = async (selectedDate, selectedProjectId) => {
    if (!selectedDate || !selectedProjectId) return;

    try {
      const formattedDate = formatDateForApi(selectedDate);
      const response = await axios.get(slotsApiUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { project_id: selectedProjectId, date: formattedDate },
      });

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

      if (name === "project_id") {
        const selectedProject = projectsType.find(
          (p) => p.id === parseInt(value)
        );
        updatedForm.project_name = selectedProject?.project_name || "";
      }

      return updatedForm;
    });
  };

  // Handle form submission (Create or Update)
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
      let response;

      if (id) {
        // If ID exists, update the existing record
        response = await axios.put(`${apiUrl}`, requestData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authenticationToken}`,
          },
        });
        toast.success("Schedule updated successfully!");
      } else {
        // If no ID, create a new record
        response = await axios.post(apiUrl, requestData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        toast.success("Form submitted successfully!");
      }

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
                <h3 className="card-title">Site Visit Edit</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Project Selection */}
                    <div className="col-md-3">
                      <label>
                        Project Name
                        <span style={{ color: "red", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <select
                        className="form-control form-select"
                        name="project_id"
                        value={formData.project_id || "N/A"}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Project
                        </option>
                        {projectsType.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.project_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Selection */}
                    <div className="col-md-3">
                      <label>
                        Date
                        <span style={{ color: "red", fontSize: "16px" }}>
                          *
                        </span>
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

                  {/* Slot Selection */}
                  {slots.length > 0 && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label>Select Available Slot</label>
                        <select
                          className="form-control form-select"
                          name="selected_slot"
                          value={formData.selected_slot}
                          onChange={handleChange}
                          required
                        >
                          <option value="" disabled>
                            Select a time slot
                          </option>
                          {slots.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                              {slot.ampm_timing}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="row mt-4 justify-content-center">
                    <div className="col-md-2">
                      <button
                        onClick={handleSubmit}
                        type="submit"
                        className="purple-btn2 w-100"
                        disabled={loading}
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
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitevisitEdit;
