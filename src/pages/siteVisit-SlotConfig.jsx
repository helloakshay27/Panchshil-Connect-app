import React, { useState, useEffect } from "react";
import axios from "axios";

const SiteVisitSlotConfig = () => {
  const [startHour, setStartHour] = useState(0);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(0);
  const [endMinute, setEndMinute] = useState(0);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59 minutes

  // Fetch projects from the API with Authorization header
  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        "https://panchshil-super.lockated.com/projects.json",
        {
          headers: {
            Authorization: `Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE`,
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

  // Fetch projects when the component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      project_id: selectedProject,
      start_hour: startHour,
      start_minute: startMinute,
      end_hour: endHour,
      end_minute: endMinute,
      start_date: startDate,
      end_date: endDate,
    };

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/site_schedules",
        postData,
        {
          headers: {
            Authorization: `Bearer 4DbNsI3Y_weQFh2uOM_6tBwX0F9igOLonpseIR0peqs`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Slot created successfully!");
      console.log("Data successfully submitted:", response.data);
    } catch (error) {
      console.error(
        "Error submitting data:",
        error.response?.data || error.message
      );
    }

    // Log the form data (You can replace this with further logic if needed)
    console.log("Form Submitted with data:", {
      startHour,
      startMinute,
      endHour,
      endMinute,
      selectedProject,
      startDate,
      endDate,
    });
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="module-data-section p-3">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Site Visit Slot Configuration</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          className="form-control"
                          type="date"
                          name="start_date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          placeholder="Enter Event Start Date"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>End Date</label>
                        <input
                          className="form-control"
                          type="date"
                          name="end_date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          placeholder="Enter Event End Date"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Start Hours</label>
                        <select
                          className="form-control"
                          value={startHour}
                          onChange={(e) => setStartHour(Number(e.target.value))}
                        >
                          {hours.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Start Minutes</label>
                        <select
                          className="form-control"
                          value={startMinute}
                          onChange={(e) =>
                            setStartMinute(Number(e.target.value))
                          }
                        >
                          {minutes.map((minute) => (
                            <option key={minute} value={minute}>
                              {minute.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>End Hours</label>
                        <select
                          className="form-control"
                          value={endHour}
                          onChange={(e) => setEndHour(Number(e.target.value))}
                        >
                          {hours.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>End Minutes</label>
                        <select
                          className="form-control"
                          value={endMinute}
                          onChange={(e) => setEndMinute(Number(e.target.value))}
                        >
                          {minutes.map((minute) => (
                            <option key={minute} value={minute}>
                              {minute.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Project</label>
                        <select
                          className="form-control form-select"
                          value={selectedProject}
                          onChange={handleProjectChange}
                        >
                          <option value="" disabled>
                            Select Project
                          </option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.project_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Submit Button Section */}
                  </div>
                  <div className="col-md-2 mt-3">
                    <button type="submit" className="purple-btn2 w-80">
                      Submit
                    </button>
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

export default SiteVisitSlotConfig;
