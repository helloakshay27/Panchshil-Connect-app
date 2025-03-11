import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SpecificationUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [setupName, setSetupName] = useState("");
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(""); // Store the existing image URL
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(
        `https://panchshil-super.lockated.com/specification_setups/${id}.json`
      )
      .then((response) => {
        console.log("Fetched Data:", response.data); // Debugging API Response
        setSetupName(response.data.name);
        if (response.data.icon_url) {
          setIconPreview(
            response.data.icon_url.includes("http")
              ? response.data.icon_url
              : `https://panchshil-super.lockated.com${response.data.icon_url}`
          );
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [id]);

  const handleCancel = () => {
    setSetupName("");
    setIcon(null);
    setIconPreview("");
    navigate(-1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setIcon(file);
    setIconPreview(URL.createObjectURL(file)); // Show preview for new file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("specification_setup[name]", setupName);
    if (icon) formData.append("icon", icon); // Append only if a new file is selected

    try {
      await axios.put(
        `https://panchshil-super.lockated.com/specification_setups/${id}.json`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Specification updated successfully!");
      navigate("/specification-list");
    } catch (error) {
      console.error("Error updating specification:", error);
      toast.error("Failed to update specification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Edit Specification</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        className="form-control"
                        type="text"
                        value={setupName}
                        onChange={(e) => setSetupName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Icon</label>
                      <input
                        className="form-control"
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        onChange={handleFileChange}
                      />
                      {/* Show Existing Icon Preview */}
                      {iconPreview && (
                        <div className="mt-2">
                          <p>Current Icon:</p>
                          <img
                            src={iconPreview}
                            alt="Existing Icon"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "contain",
                              border: "1px solid #ddd",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
      </div>
    </div>
  );
};

export default SpecificationUpdate;
