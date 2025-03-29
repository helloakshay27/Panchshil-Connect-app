import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const OrganizationCreate = () => {
  const navigate = useNavigate();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    sub_domain: "",
    country_id: "",
    mobile: "",
    attachment: null,
  });
  const [loading, setLoading] = useState(false);

  //input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleMobileChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && value.length > 10) return; // Limit to 10 digits
    setFormData({ ...formData, [name]: value });
  };

  //file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return; // Prevent errors if no file is selected

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Store only the first file in formData (since only one file is supported)
    setFormData({ ...formData, attachment: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss(); // Clears previous toasts to prevent duplicates

    // Validation - Ensures only one error toast appears
    if (!formData.name) {
      toast.error("Organization Name is required.");
      setLoading(false);
      return;
    }
    if (!formData.domain) {
      toast.error("Domain is required.");
      setLoading(false);
      return;
    }
    if (!formData.sub_domain) {
      toast.error("Sub-domain is required.");
      setLoading(false);
      return;
    }
    if (!formData.country_id) {
      toast.error("Country ID is required.");
      setLoading(false);
      return;
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      toast.error("Mobile number must be 10 digits.");
      setLoading(false);
      return;
    }
    if (!formData.attachment) {
      toast.error("Attachment is required.");
      setLoading(false);
      return;
    }

    const payload = new FormData();
    payload.append("organization[name]", formData.name);
    payload.append("organization[domain]", formData.domain);
    payload.append("organization[sub_domain]", formData.sub_domain);
    payload.append("organization[country_id]", formData.country_id);
    payload.append("organization[mobile]", formData.mobile);
    payload.append("organization[active]", true);
    payload.append("organization[created_by_id]", 1);
    if (formData.attachment) {
      payload.append("organization[org_image]", formData.attachment);
    }

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/organizations.json",
        payload,
        {
          headers: {
            Authorization: `Bearer eH5eu3-z4o42iaB-npRdy1y3MAUO4zptxTIf2YyT7BA`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Organization created successfully!");
      }

      setFormData({
        name: "",
        domain: "",
        sub_domain: "",
        country_id: "",
        mobile: "",
        attachment: null,
      });
      setImagePreviews([]);
      navigate("/organization-list"); // Redirect to organization list after success
    } catch (error) {
      console.error(
        "Error creating Organization:",
        error.response?.data || error.message
      );
      toast.error("Failed to create Organization. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      domain: "",
      mobile: "",
      sub_domain: "",
      country_id: "",
    });
    // setSelectedProjectId("");
    navigate(-1);
  };
  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Organization</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name <span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        placeholder="Enter Name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Domain <span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="domain"
                        placeholder="Enter Domain"
                        value={formData.domain}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Sub-domain<span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="sub_domain"
                        placeholder="Enter Sub-domain"
                        value={formData.sub_domain}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Country ID<span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        name="country_id"
                        placeholder="Enter Country ID"
                        value={formData.country_id}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Mobile No<span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text" // Use text to prevent increment/decrement buttons
                        inputMode="numeric" // Helps mobile devices show the number keyboard
                        pattern="\d{10}" // Ensures only numbers are entered
                        placeholder="Enter Mobile No"
                        name="mobile"
                        value={formData.mobile}
                        maxLength={10} // Restrict to 10 digits
                        onChange={handleMobileChange}
                        style={{ appearance: "textfield" }} // Removes number input arrows
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment
                        <span
                          className="tooltip-container"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          [i]
                          {showTooltip && (
                            <span className="tooltip-text">
                              Max Upload Size 10 MB
                            </span>
                          )}
                        </span>{" "}
                        <span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachment"
                        onChange={handleFileChange}
                        multiple // Allow multiple file selection
                      />
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="mt-2 d-flex flex-wrap">
                        {imagePreviews.map((src, index) => (
                          <div key={index} className="position-relative me-2">
                            <img
                              src={src}
                              alt={`Preview ${index}`}
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                borderRadius: "5px",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-3 justify-content-center">
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
  );
};

export default OrganizationCreate;
