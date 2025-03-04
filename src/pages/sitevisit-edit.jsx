import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";

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
    "https://panchshil-super.lockated.com/site_schedule/all_site_schedule_slots.json";

  const authToken = localStorage.getItem('access_token');
  // const projectsAuthToken = "UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY";
  // const authenticationToken = "eH5eu3-z4o42iaB-npRdy1y3MAUO4zptxTIf2YyT7BA";

  // Helper function to format date as DD-MM-YYYY
  const formatDateForApi = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };


  const fetchSites = async () => {

    const response = await axios.get(`https://panchshil-super.lockated.com/site_schedule_requests/${id}.json`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })

    setFormData(response.data)
  }

  console.log("Respp", formData)

  useEffect(() => {
    fetchSites()
  }, [])
  // Fetch project list on mount
  useEffect(() => {
    axios
      .get(projectsApiUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => setProjectsType(response.data.projects))
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  // Fetch site visit details when editing
  // useEffect(() => {
  //   if (id) {
  //     axios
  //       .get(`${apiUrl}`, {
  //         headers: { Authorization: `Bearer ${authToken}` },
  //       })
  //       .then((response) => {
  //         const siteVisit = response.data;
  //         console.log(siteVisit)
  //         setFormData({
  //           project_id: siteVisit.project_id,
  //           project_name: siteVisit.project_name,
  //           scheduled_at: siteVisit.scheduled_at,
  //           selected_slot: siteVisit.selected_slot,
  //         });

  //         // Fetch slots for this project & date
  //         fetchSlots(siteVisit.scheduled_at, siteVisit.project_id);
  //       })
  //       .catch((error) =>
  //         console.error("Error fetching site visit data:", error)
  //       );
  //   }
  // }, []);

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

  console.log(slots)

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
            Authorization: `Bearer ${authToken}`,
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
            <form onSubmit={handleSubmit}>
              <div className="card mt-3 pb-4 mx-4">
                <div className="card-header3">
                  <h3 className="card-title">Edit Site Visit</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Project Selection */}
                    <div className="col-md-3">
                      <label>
                        Project Name trerngfggh
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      {/* <select
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
                      </select> */}

                      <SelectBox
                        options={
                          projectsType.map((project) => ({
                            label: project.project_name,
                            value: project.id,
                          }))
                        }
                        defaultValue={formData.project_id}
                        onChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            project_id: value,
                          }))
                        }}
                      />
                    </div>

                    {/* Date Selection */}
                    <div className="col-md-3">
                      <label>
                        Date
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
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
                </div>
              </div>

              <div className="card mt-3 pb-4 mx-4">
                <div className="card-header3">
                  <h3 className="card-title">Address</h3>
                </div>
                <div className="card-body mt-0 pb-0">
                  <div className="row">
                    {/* Address Section */}
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>
                          Address Line 1
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            *
                          </span>{" "}
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Address Line 1"
                          name="address_line_1"
                        // value={formData.Address.address_line_1}
                        // onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>
                          Address Line 2
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            *
                          </span>{" "}
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Address Line 2"
                          name="address_line_2"
                        // value={formData.Address.address_line_2}
                        // onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>
                          City
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="City"
                          name="city"
                        // value={formData.Address.city}
                        // onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>
                          State
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="State"
                          name="state"
                        // value={formData.Address.state}
                        // onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>
                          Pin Code
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Pin Code"
                          name="pin_code"
                          // value={formData.Address.pin_code}
                          maxLength={6} // Restrict input to 6 characters
                        // onChange={(e) => {
                        //   const { name, value } = e.target;
                        //   // Allow only numbers and max 6 digits
                        //   if (/^\d{0,6}$/.test(value)) {
                        //     setFormData((prevData) => ({
                        //       ...prevData,
                        //       Address: { ...prevData.Address, [name]: value },
                        //     }));
                        //   }
                        // }}
                        />
                      </div>
                    </div>

                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>
                          Country
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Country"
                          name="country"
                        // value={formData.Address.country}
                        // onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

export default SitevisitEdit;
