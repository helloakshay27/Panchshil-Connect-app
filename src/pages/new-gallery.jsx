import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SelectBox from "../components/base/SingleSelect";
import { toast } from "react-hot-toast";

const NewGallery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [seeAll, setSeeAll] = useState(false);

  const [formData, setFormData] = useState({
    galleryType: "",
    projectId: "",
    name: "",
    title: "",
    attachment: [],
  });

  // Fetch Gallery Data if Editing
  useEffect(() => {
    if (!id) return;

    const fetchGallery = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/galleries/${id}.json`
        );
        const data = response.data;

        setFormData({
          galleryType: data?.gallery_type_id || "",
          projectId: data?.project_id || "",
          name: data?.name || "",
          title: data?.title || "",
          attachment: [],
        });
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [id]);

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
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

        // Ensure default project is set after projects are loaded
        setFormData((prev) => ({
          ...prev,
          projectId: prev.projectId || response.data.projects[0]?.id || "",
        }));
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const fileArray = Array.from(files);
      setFormData((prevData) => ({
        ...prevData,
        attachment: fileArray,
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
  };

  // Validate Form
  const validateForm = () => {
    let errors = {};

    if (!formData.projectId) {
      errors.projectId = "Project type is mandatory";
      toast.error("Project type is mandatory");
    } else if (!formData.name.trim()) {
      errors.name = "Name is mandatory";
      toast.error("Name is mandatory");
    } else if (!formData.title.trim()) {
      errors.title = "Title is mandatory";
      toast.error("Title is mandatory");
    } else if (!formData.attachment || formData.attachment.length === 0) {
      errors.attachment = "Gallery image is mandatory";
      toast.error("Gallery image is mandatory");
    }

    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = new FormData();

    // Append text fields
    data.append("gallery[project_id]", formData.projectId);
    data.append("gallery[gallery_type_id]", formData.galleryType);
    data.append("gallery[name]", formData.name);
    data.append("gallery[title]", formData.title);

    // ✅ Append multiple files as gallery[attachments][]
    if (formData.attachment.length > 0) {
      formData.attachment.forEach((file) => {
        data.append("gallery[attachments][]", file);
      });
    }

    try {
      await axios.post(
        "https://panchshil-super.lockated.com/galleries.json",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Gallery created successfully!");
      navigate("/gallery-list");
    } catch (error) {
      toast.error("Failed to create gallery.");
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);

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
                <div className="row">
                  {/* Project Dropdown */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Project</label>
                      <SelectBox
                        options={projects.map((proj) => ({
                          value: proj.id,
                          label: proj.project_name,
                        }))}
                        value={formData.projectId} // ✅ Use value, not defaultValue
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            projectId: value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter name"
                      />
                    </div>
                  </div>

                  {/* Title Input */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter title"
                      />
                    </div>
                  </div>

                  {/* Attachment */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Attachment</label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachment"
                        multiple
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
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

export default NewGallery;
