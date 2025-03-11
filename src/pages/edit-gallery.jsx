import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
// import SelectBox from "../components/base/SingleSelect";
import { toast } from "react-hot-toast";

const EditGallery = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    projectId: location.state?.gallery?.project_id || "",
    name: location.state?.gallery?.name || "",
    title: location.state?.gallery?.title || "",
    gallery_image: null,
  });
  console.log(formData.projectId);
  const [imagePreview, setImagePreview] = useState(
    location.state?.gallery?.attachfile?.document_url || null
  );

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/galleries/${id}.json`
        );
        const data = response.data;

        setFormData((prev) => ({
          ...prev,
          projectId: data.project_id || prev.projectId, // ✅ Ensure projectId is set properly
          name: data.name || "",
          title: data.title || "",
          gallery_image: null,
        }));

        if (data.attachfile?.document_url) {
          setImagePreview(data.attachfile.document_url);
        }
      } catch (error) {
        toast.error("Failed to fetch gallery data.");
      } finally {
        setLoading(false);
      }
    };

    if (!location.state?.gallery) {
      fetchGallery();
    }
  }, [id, location.state?.gallery]);

  // Fetch Projects List
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

        setFormData((prev) => ({
          ...prev,
          projectId: prev.projectId || response.data.projects[0]?.id || "", // Set first project as default if none is set
        }));
      } catch (error) {
        toast.error("Failed to fetch projects.");
      }
    };

    fetchProjects();
    console.log("Projects:", projects);
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, attachment: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Form Submission (Update Gallery)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const data = new FormData();
    data.append("gallery[project_id]", formData.projectId);
    data.append("gallery[name]", formData.name);
    data.append("gallery[title]", formData.title);

    if (formData.attachment) {
      data.append("gallery[gallery_image][]", formData.attachment);
    }

    try {
      await axios.put(
        `https://panchshil-super.lockated.com/galleries/${id}.json`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Gallery updated successfully!");
      navigate("/gallery-list");
    } catch (error) {
      toast.error("Failed to update gallery.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="card mx-4 pb-4 mt-4">
              <div className="card-header">
                <h3 className="card-title">Edit Gallery</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">Loading...</div>
                ) : (
                  <div className="row">
                    {/* Project Dropdown */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Project</label>
                        <select
                          className="form-control"
                          value={formData.projectId || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              projectId: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select Project</option>
                          {projects.map((proj) => (
                            <option key={proj.id} value={proj.id}>
                              {proj.project_name}
                            </option>
                          ))}
                        </select>
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

                    {/* Attachment Input */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Attachment</label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachment"
                          onChange={handleInputChange}
                        />
                        {imagePreview && (
                          <div className="mt-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{ maxWidth: "100px", maxHeight: "100px" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="row mt-3 justify-content-center">
              <div className="col-md-2">
                <button
                  type="submit"
                  className="purple-btn2 w-100"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Submit"}
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

export default EditGallery;
