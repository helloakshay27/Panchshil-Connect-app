import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";

const SitevisitCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    project_id: "",
    project_name: "",
    scheduled_at: "",
    selected_slot: "",
  });

  const [projectsType, setProjectsType] = useState([]);
  const [slots, setSlots] = useState([]);

  // const apiUrl = "https://panchshil-super.lockated.com/site_schedule_requests";
  // const projectsApiUrl =
  //   "https://panchshil-super.lockated.com/get_all_projects.json";
  // const slotsApiUrl =
  //   "https://panchshil-super.lockated.com/site_schedule/all_site_schedule_slots.json";
  // const authToken = "4DbNsI3Y_weQFh2uOM_6tBwX0F9igOLonpseIR0peqs";
  // const projectsAuthToken = "UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY";

  const formatDateForApi = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/projects.json",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  // Fetch slots when user selects a date and project
  const fetchSlots = async (selectedDate, selectedProjectId) => {
    if (!selectedDate || !selectedProjectId) {
      console.error("Project ID and date are required to fetch slots.");
      return;
    }

    try {
      const formattedDate = formatDateForApi(selectedDate);
      const response = await axios.get(
        "https://panchshil-super.lockated.com/site_schedule/all_site_schedule_slots.json",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
          params: { project_id: selectedProjectId, date: formattedDate },
        }
      );

      console.log("site visit slots response", response);

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
      setLoading(false);
      return;
    }

    const requestData = {
      site_schedule_request: {
        scheduled_at: formatDateForApi(formData.scheduled_at),
        site_schedule_id: formData.selected_slot,
        project_id: formData.project_id,
        selected_slot: formData.selected_slot,
      },
    };

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/site_schedule_requests.json",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("Form submitted successfully");
      console.log("Response from API:", response.data);
      navigate("/sitevisit-list");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Error submitting schedule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  console.log("formdata", formData);

  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="module-data-section p-3">
            <form onSubmit={handleSubmit}>
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header3">
                  <h3 className="card-title">Create Site Visit</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Project Selection */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Project<span style={{ color: "#de7008" }}> *</span>
                        </label>
                        <SelectBox
                          options={projects.map((proj) => ({
                            label: proj.project_name,
                            value: proj.id,
                          }))}
                          defaultValue={formData.project_id}
                          onChange={(value) =>
                            setFormData({ ...formData, project_id: value })
                          }
                        />
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Date <span style={{ color: "#de7008" }}> *</span>
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
                          <SelectBox
                            options={slots.map((slot) => ({
                              label: `${slot.start_time} to ${slot.end_time}`,
                              value: slot.id,
                              disabled: slot.slot_disabled,
                            }))}
                            defaultValue={formData.selected_slot || ""}
                            onChange={(value) => {
                              setFormData({
                                ...formData,
                                selected_slot: value,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="row my-4 justify-content-center">
                <div className="col-md-2">
                  <button
                    type="submit"
                    className="purple-btn2 purple-btn2-shadow w-100"
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="purple-btn2 purple-btn2-shadow w-100"
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
  );
};

export default SitevisitCreate;
