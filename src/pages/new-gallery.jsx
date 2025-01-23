import React, { useState } from "react";
import axios from "axios";

const NewGallery = () => {
  const [formData, setFormData] = useState({
    galleryType: "",
    projectId: "",
    name: "",
    title: "",
    attachment: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("gallery[project_id]", formData.projectId);
    data.append("gallery[gallery_type_id]", formData.galleryType);
    data.append("gallery[name]", formData.name);
    data.append("gallery[title]", formData.title);
    if (formData.attachment) {
      data.append("attachment", formData.attachment);
    }

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/galleries.json",
        data
      );
      console.log("Success:", response.data);
      alert("Gallery created successfully!");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Failed to create the gallery. Please try again.");
    }
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <form onSubmit={handleSubmit}>
              <div className="card mx-4 pb-4 mt-4">
                <div className="card-header">
                  <h3 className="card-title">New Gallery</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Gallery Type</label>
                        <select
                          className="form-control form-select"
                          name="galleryType"
                          value={formData.galleryType}
                          onChange={handleInputChange}
                          style={{ width: "100%" }}
                        >
                          <option value="">Select a Gallery Type</option>
                          <option value="1">Type 1</option>
                          <option value="2">Type 2</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Project ID</label>
                        <select
                          className="form-control form-select"
                          name="projectId"
                          value={formData.projectId}
                          onChange={handleInputChange}
                          style={{ width: "100%" }}
                        >
                          <option value="">Select a Project ID</option>
                          <option value="1">Project 1</option>
                          <option value="2">Project 2</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Name Title</label>
                        <input
                          className="form-control"
                          type="text"
                          name="name"
                          placeholder="Enter name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Attachment File</label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachment"
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Submit Button Outside Card */}
              <div className="row mt-2 justify-content-center">
                    <div className="col-md-2">
                    <button type="submit" className="purple-btn2 w-100">
                  Submit
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

export default NewGallery;
