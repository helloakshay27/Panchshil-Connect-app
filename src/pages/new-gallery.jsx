import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const NewGallery = () => {
  const { id } = useParams(); // Corrected ID extraction
  const [projectsType, setprojectsType] = useState([]);
  const [galleryType, setGalleryType] = useState([]);
   const [galleryData, setGalleryData] = useState([]);


  const [formData, setFormData] = useState({
    galleryType: "",
    projectId: "",
    name: "",
    title: "",
    attachment: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  useEffect(() => {
    if (!id) return;

    const fetchGallery = async () => {
      setLoading(true);
      setError(""); // Reset error state

      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/galleries/${id}.json`
        );

        setFormData({
          galleryType: response.data?.gallery_type_id || "",
          projectId: response.data?.project_id || "",
          name: response.data?.name || "",
          title: response.data?.title || "",
          attachment: null,
        });

        setGalleryData(response.data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
        setError("Failed to fetch gallery details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("gallery[project_id]", formData.projectId);
    data.append("gallery[gallery_type_id]", formData.galleryType);
    data.append("gallery[name]", formData.name);
    data.append("gallery[title]", formData.title);
    if (formData.attachment) {
      data.append("gallery[attachment]", formData.attachment);
    }

    try {
      const response = await axios.put(
        `https://panchshil-super.lockated.com/galleries/${id}.json`,
        data
      );
      alert("Gallery updated successfully!");
      console.log("Success:", response.data);
    } catch (error) {
      setError("Failed to update the gallery. Please try again.");
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/get_property_types.json";

      try {
        const response = await axios.get(url, {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
        });

        setprojectsType(response.data?.property_types);
        // console.log("projectsType", projectsType);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);
  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/gallery_types.json?project_id=1";

      try {
        const response = await axios.get(url, {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
        });

        setGalleryType(response.data?.gallery_types);
        // console.log("projectsType", projectsType);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="card mx-4 pb-4 mt-4">
              <div className="card-header">
                <h3 className="card-title">Add Gallery</h3>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {loading ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Gallery Type</label>
                        <select
                          className="form-control form-select"
                          name="galleryType"
                          value={formData.galleryType || galleryData.gallery_type_id} 
                          onChange={handleInputChange}
                        >
                          <option value="" disabled>
                            {galleryData.gallery_type}
                          </option>
                          {galleryType.map((type, index) => (
                            <option key={index} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Project Types</label>
                        <select
                          className="form-control form-select"
                          name="type_of_project"
                          value={formData.projectId || galleryData.project_id} 
                          onChange={handleInputChange}
                        >
                          <option value="" disabled>
                            {galleryData.project_name}                         
                        </option>
                          {projectsType.map((type, index) => (
                            <option key={index} value={type.id}>
                              {type.property_type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          className="form-control"
                          type="text"
                          name="name"
                          placeholder="Enter name"
                          value={formData.name || galleryData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          className="form-control"
                          type="text"
                          name="title"
                          placeholder="Enter title"
                          value={formData.title|| galleryData.title}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Attachment</label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachment"
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Submit Button */}
            <div className="row mt-3 justify-content-center">
              <div className="col-md-2">
                <button
                  type="submit"
                  className="purple-btn2 w-100"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Gallery"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewGallery;
