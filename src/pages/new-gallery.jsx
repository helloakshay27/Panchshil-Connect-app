import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SelectBox from "../components/base/SingleSelect";
import { toast } from "react-hot-toast";

const NewGallery = () => {
  const { id } = useParams(); // Corrected ID extraction
  const [projectsType, setprojectsType] = useState([]);
  const [galleryType, setGalleryType] = useState([]);
  const [galleryData, setGalleryData] = useState([]);

  const [imagePreviews, setImagePreviews] = useState([]);
  const [seeAll, setSeeAll] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [formData, setFormData] = useState({
    galleryType: "",
    projectId: "",
    name: "",
    title: "",
    attachment: [],
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    // setFormData((prevData) => ({
    //   ...prevData,
    //   [name]: files ? files[0] : value,
    // }));

    if (files) {
      const fileArray = Array.from(files);
      setFormData((prevData) => ({
        ...prevData,
        [name]: fileArray,
      }));

      // Generate preview URLs
      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    console.log(formData);
  };

  useEffect(() => {
    if (!id) return;

    const fetchGallery = async () => {
      setLoading(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [id]);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.projectId || String(formData.projectId).trim() === "") {
      newErrors.projectId = "Project type is mandatory";
      toast.error("Project type is mandatory");
    } else if (!formData.name.trim()) {
      newErrors.name = "Name is mandatory";
      toast.error("Name is mandatory");
    } else if (!formData.title.trim()) {
      newErrors.title = "Title is mandatory";
      toast.error("Title is mandatory");
    } else if (!formData.attachment || formData.attachment.length === 0) {
      newErrors.attachment = "Banner image is mandatory";
      toast.error("Banner image is mandatory");
    }

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Prevent form submission if validation fails
    }

    setLoading(true);

    const data = new FormData();
    data.append("gallery[project_id]", selectedProjectId);
    data.append("gallery[gallery_type_id]", formData.galleryType);
    data.append("gallery[name]", formData.name);
    data.append("gallery[title]", formData.title);
    if (formData.attachment) {
      data.append("gallery[attachment]", formData.attachment);
    }

    try {
      const response = await axios.post(
        `https://panchshil-super.lockated.com/galleries.json`,
        data
      );
      toast.success("Gallery updated successfully!");
      console.log("Success:", response.data);
      navigate("/gallery-list");
    } catch (error) {
      toast.error("Failed to update the gallery. Please try again.");
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url =
        "https://panchshil-super.lockated.com/get_property_types.json";

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
    const fetchProject = async () => {
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
        console.error(
          "Error fetching projects:",
          error.response?.data || error.message
        );
      }
    };

    fetchProject();
    fetchProjects();
  }, []);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
    console.log(imagePreviews.length);
    setFormData((prevData) => ({
      ...prevData,
      attachment: prevData.attachment.filter((_, i) => i !== index),
    }));
    console.log(formData);
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="card mx-4 pb-4 mt-4">
              <div className="card-header">
                <h3 className="card-title">Create Gallery</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  <div className="row">
                    {/* <div className="col-md-3">
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
                    </div> */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Gallery Type<span style={{ color: "#de7008" }}> *</span>
                        </label>
                        <SelectBox
                          options={galleryType.map((type) => ({
                            value: type.id,
                            label: type.name,
                          }))}
                          defaultValue={
                            formData.galleryType || galleryData.gallery_type_id
                          }
                          onChange={(value) =>
                            setFormData((prevData) => ({
                              ...prevData,
                              galleryType: value,
                            }))
                          }
                          isDisableFirstOption={true}
                          className="custom-selectbox"
                        />
                      </div>
                    </div> */}
                    <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>
                          Project
                          <span style={{ color: "#de7008" }}> *</span>
                        </label>
                        <SelectBox
                          options={projects.map((proj) => ({
                            value: proj.id,
                            label: proj.project_name,
                          }))}
                          value={selectedProjectId || ""} // Ensure it's controlled
                          onChange={(value) => setSelectedProjectId(value)}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Project Types
                          <span style={{ color: "#de7008" }}> *</span>
                        </label>
                        <SelectBox
                          options={projectsType.map((type) => ({
                            value: type.id,
                            label: type.property_type,
                          }))}
                          defaultValue={
                            formData.projectId || galleryData.project_id
                          }
                          onChange={(value) =>
                            setFormData((prevData) => ({
                              ...prevData,
                              projectId: value,
                            }))
                          }
                          isDisableFirstOption={true}
                          className="custom-selectbox"
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Name<span style={{ color: "#de7008" }}> *</span>
                        </label>
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
                        <label>
                          Title<span style={{ color: "#de7008" }}> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="title"
                          placeholder="Enter title"
                          value={formData.title || galleryData.title}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Attachment<span style={{ color: "#de7008" }}> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachment"
                          multiple
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="row mt-3">
                      {(seeAll ? imagePreviews : imagePreviews.slice(0, 3)).map(
                        (preview, index) => (
                          <div
                            key={index}
                            className="col-md-1 position-relative"
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index}`}
                              className="img-thumbnail mt-2"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="position-absolute border-0 rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                top: 2,
                                right: -5,
                                height: 20,
                                width: 20,
                                backgroundColor: "var(--red)",
                                color: "white",
                              }}
                              onClick={() => handleRemoveImage(index)}
                            >
                              x
                            </button>
                          </div>
                        )
                      )}
                      {imagePreviews.length > 3 && (
                        <span
                          className="mt-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => setSeeAll(!seeAll)}
                        >
                          {seeAll ? "See Less" : "See All"}
                        </span>
                      )}
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
                  className="purple-btn2-shadow w-100"
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

export default NewGallery;
