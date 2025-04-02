import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import "../mor.css";

const Testimonials = () => {
  const [companySetupOptions, setCompanySetupOptions] = useState([]);
  const [companySetupId, setCompanySetupId] = useState("");
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState("");  // State for user profile
  const [userType, setUserType] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [buildingTypeOptions, setBuildingTypeOptions] = useState([]);
  const [buildingTypeId, setBuildingTypeId] = useState("");
  const [buildingType, setBuildingType] = useState({ id: "", name: "" });

  useEffect(() => {
    const fetchCompanySetups = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/company_setups.json",
          {
            headers: {
              Authorization:
                "Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE",
            },
          }
        );

        console.log("Raw API Response:", response.data);

        if (response.data && Array.isArray(response.data.company_setups)) {
          setCompanySetupOptions(response.data.company_setups);
        } else {
          console.warn("Unexpected API response format:", response.data);
          setCompanySetupOptions([]);
        }
      } catch (error) {
        console.error("Error fetching company setup data:", error);

        if (error.response) {
          console.error("API Response Error:", error.response.data);
        }
        setCompanySetupOptions([]);
      }
    };

    fetchCompanySetups();
  }, []);
  
  useEffect(() => {
    const fetchBuildingTypes = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/building_types.json",
          {
            headers: {
              Authorization:
                "Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE",
            },
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          setBuildingTypeOptions(response.data);
        }
      } catch (error) {
        console.error("Error fetching building type data:", error);
      }
    };

    fetchBuildingTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Dismiss previous toast notifications before showing new ones
    toast.dismiss();

    if (!userName.trim() || !userProfile.trim() || !content.trim()) {
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }

    const data = {
      testimonial: {
        // company_setup_id: companySetupId,
        building_id: buildingTypeId ? buildingTypeId.toString() : null,
        building_type: buildingTypeOptions.find((option) => option.id === buildingTypeId)?.building_type || null,
        user_name: userName.trim(),
        profile_of_user: userProfile.trim(),
        content: content.trim(),
      },
    };
    console.log("Submitting data:", data);

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/testimonials.json",
        data,
        {
          headers: {
            Authorization: "Bearer kD8B8ZeWZQAd2nQ-70dcfLXgYHLQh-zjggvuuE_93BY",
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from POST:", response.data);

      toast.success("Data saved successfully!");

      // Reset form fields
      
      setUserName("");
      setUserProfile(""); // Reset User Profile
      setUserType("");
      setContent("");

      navigate("/testimonial-list");
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }

      toast.error("Failed to submit. Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <form onSubmit={handleSubmit}>
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Create Testimonials</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* User Name */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          User Name
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="userName"
                          placeholder="Enter user name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* User Profile */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          User Profile
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="userProfile"
                          placeholder="Enter user profile"
                          value={userProfile}
                          onChange={(e) => setUserProfile(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* User Type */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          User Type
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <SelectBox
                          options={[
                            { label: "User", value: "User" },
                            { label: "Admin", value: "Admin" },
                            { label: "Resident", value: "Resident" },
                          ]}
                          defaultValue={userType}
                          onChange={(value) => setUserType(value)}
                        />
                      </div>
                    </div> */}

                    {/* Building Type */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Building Type
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <SelectBox
                          options={buildingTypeOptions.map((option) => ({
                            label: option.building_type, // Display Name
                            value: option.id, // ID
                          }))}
                          value={buildingTypeId}
                          onChange={(value) => setBuildingTypeId(value)}
                        />
                      </div>
                    </div>

                    {/* Content (Description) */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Description
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="content"
                          placeholder="Enter Description"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="row mt-2 justify-content-center">
                <div className="col-md-2">
                  <button
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
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;
