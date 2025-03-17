import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SelectBox from "../components/base/SelectBox";

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
    gallery_image: null,
  });

  // Fetch Gallery Data if Editing
  useEffect(() => {
    if (!id) return;

    const fetchGallery = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/galleries/get_galleries/${id}.json`
          
        );
        const data = response.data;

        setFormData({
          galleryType: data?.gallery_type_id || "",
          projectId: data?.project_id || "",
          name: data?.name || "",
          title: data?.title || "",
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

      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  const handleRemoveImage = (index) => {
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );

    setFormData((prevData) => {
      // Create a new FileList-like array without the removed file
      const updatedAttachments = [...prevData.attachment].filter(
        (_, i) => i !== index
      );

      return {
        ...prevData,
        attachment: updatedAttachments, // Update the attachment list
      };
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = new FormData();

    data.append("gallery[project_id]", formData.projectId);
    data.append("gallery[gallery_type_id]", formData.galleryType);
    data.append("gallery[name]", formData.name);
    data.append("gallery[title]", formData.title);

    if (formData.attachment.length > 0) {
      formData.attachment.forEach((file) => {
        data.append("gallery[gallery_image][]", file);
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
                        value={formData.projectId} 
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

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="mt-2 d-flex flex-wrap">
                          {imagePreviews.map((src, index) => (
                            <div key={index} className="position-relative me-2">
                              <img
                                src={src}
                                alt={`Preview ${index}`}
                                 className="img-thumbnail mt-2"
                                 style={{
                                  maxWidth: "100px",
                                  maxHeight: "100px",
                                  objectFit: "cover",
                                }}
                              />
                              {/* Discard Button */}
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
                                ✖
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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