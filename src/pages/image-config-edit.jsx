import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../mor.css";
import { toast } from "react-hot-toast";
import { baseURL } from "./baseurl/apiDomain";

const EditImagesConfiguration = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from URL parameters
  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  // Fetch specific configuration data by ID
  useEffect(() => {
    const fetchConfiguration = async () => {
      if (!id) {
        toast.error("Configuration ID is required.");
        navigate(-1);
        return;
      }

      try {
        setFetchLoading(true);
        const response = await axios.get(
          `${baseURL}system_constants/${id}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        console.log("Configuration data:", response.data);
        
        // Check if it's an ImagesConfiguration
        if (response.data && response.data.description === "ImagesConfiguration") {
          setConfiguration(response.data);
          setInputValue(response.data.value || "");
        } else {
          toast.error("Invalid configuration type.");
          navigate(-1);
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
        if (error.response?.status === 404) {
          toast.error("Configuration not found.");
        } else {
          toast.error("Failed to load configuration.");
        }
        navigate(-1);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchConfiguration();
  }, [id, navigate]);

  // Handle value change
  const handleValueChange = (newValue) => {
    setInputValue(newValue);
  };

  // Handle update API call
  const handleUpdate = async () => {
    if (!configuration) return;

    setLoading(true);

    try {
      const updateData = {
        system_constant: {
          value: inputValue
        }
      };

      const response = await axios.put(
        `${baseURL}system_constants/${configuration.id}.json`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success(`${configuration.name} updated successfully!`);
       navigate("/setup-member/image-config-list"); // Redirect to the list page after successful update
      
      // Update the configuration state
      setConfiguration(prev => ({ ...prev, value: inputValue }));
      
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      toast.error(
        `Failed to update ${configuration.name}: ${
          error.response?.data?.error || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };


  if (!configuration) {
    return (
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-body text-center">
                <p className="text-muted">Configuration not found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
       <div className="website-content overflow-auto">
         <div className="module-data-section container-fluid">
             <form onSubmit={handleUpdate}>
                <div className="card mt-4 pb-4 mx-4">
                 <div className="card-header">
                   <h3 className="card-title">Edit Images Configuration</h3>
                 </div>
                 <div className="card-body">
              <div className="row">
                <div className="col-md-12 mb-4">
                  <div className="">
                    <div className="">
                      {/* <h5 className="">{configuration.name}</h5> */}
                      <div className="form-group">
                        <label>
                          Value <span className="otp-asterisk">*</span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Enter value"
                          value={inputValue}
                          onChange={(e) => handleValueChange(e.target.value)}
                        />
                      </div>
                      {/* <small className="text-muted">
                        ID: {configuration.id} | Created: {new Date(configuration.created_at).toLocaleDateString()}
                      </small> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </form>

          {/* Update and Cancel Buttons */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button
                type="button"
                className="purple-btn2 w-100"
                onClick={handleUpdate}
                disabled={loading || !configuration}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
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
  );
};

export default EditImagesConfiguration;