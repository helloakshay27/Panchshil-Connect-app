import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

const OrganizationCreate = () => {
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    sub_domain: "",
    country_id: "",
    mobile: "",
    attachment: null,
  });

  //input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //file upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  //form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("organization[name]", formData.name);
    payload.append("organization[domain]", formData.domain);
    payload.append("organization[sub_domain]", formData.sub_domain);
    payload.append("organization[country_id]", formData.country_id);
    payload.append("organization[mobile]", formData.mobile);
    payload.append("organization[active]", true);
    payload.append("organization[created_by_id]", 1);
    if (formData.attachment) {
      payload.append("organization[logo]", formData.attachment);
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

      console.log("Response:", response); // Log the full response

      if (response.status === 201 || response.status === 200) {
        toast.success("Form submitted successfully");
      }
    } catch (error) {
      toast.error(`Error creating Organization: ${error.message}`);
    }
  };
  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Create Organization</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        placeholder="Enter Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Domain <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="domain"
                        placeholder="Enter Domain"
                        value={formData.domain}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Sub-domain<span style={{ color: "red" }}> *</span>
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
                        Country ID<span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        name="country_id"
                        placeholder="Enter Country ID"
                        value={formData.country_id}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Mobile No. <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="mobile"
                        placeholder="Enter Mobile No."
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment <span style={{ color: "red" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachment"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mt-3 justify-content-center">
                  <div className="col-md-2">
                    <button type="submit" className="purple-btn2 w-100">
                      Create Organization
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

export default OrganizationCreate;
