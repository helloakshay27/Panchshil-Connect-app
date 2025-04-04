import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [previewImg, setPreviewImg] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    project_id: "",
    attachfile: null,
    // existingImages: [],
  });

  useEffect(() => {
    fetchBanner();
    fetchProjects();
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await axios.get(
        `${baseURL}banners/${id}.json`
      );
      if (response.data) {
        setFormData({
          title: response.data.title,
          project_id: response.data.project_id,
          // existingImages: response.data.banner_images || [],
          attachfile: response.data?.attachfile?.document_url || null,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch banner data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${baseURL}projects.json`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setProjects(response.data.projects || []);
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      return;
    }

    console.log(validFiles[0])

    setPreviewImg(URL.createObjectURL(validFiles[0]));
    setFormData({ ...formData, attachfile: validFiles[0] });
  };

  console.log(formData);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is mandatory";
    }
    if (!formData.project_id) {
      newErrors.project_id = "Project is mandatory";
    }
    if (formData.attachfile===null) {
      newErrors.attachfile = "At least one banner image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append("banner[title]", formData.title);
      sendData.append("banner[project_id]", formData.project_id);
      sendData.append("banner[banner_image]", formData.attachfile)

     const res= await axios.put(
        `${baseURL}banners/${id}.json`,
        sendData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(res)

      toast.success("Banner updated successfully");
      navigate("/banner-list");
    } catch (error) {
      console.log(error)
      toast.error("Error updating banner");
    } finally {
      setLoading(false);
    }
  };

  console.log(formData);

  const handleCancel = () => navigate(-1);

  return (
    <div className="main-content">
      <div className="website-content overflow-hidden">
        <div className="module-data-section">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Edit Banner</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                      {errors.title && (
                        <span className="text-danger">{errors.title}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Project *</label>
                      <SelectBox
                        options={projects.map((p) => ({
                          label: p.Project_Name,
                          value: p.id,
                        }))}
                        defaultValue={formData.project_id}
                        onChange={(value) =>
                          setFormData({ ...formData, project_id: value })
                        }
                      />
                      {errors.project_id && (
                        <span className="text-danger">{errors.project_id}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Banner Image *</label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachfile"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                      {errors.attachfile && (
                        <span className="text-danger">{errors.attachfile}</span>
                      )}
                      <div className="mt-2">
                        {previewImg ? (
                          <img
                            src={previewImg}
                            className="img-fluid rounded mt-2"
                            alt="Banner Preview"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ) : formData.attachfile ? (
                          <img
                            src={formData.attachfile}
                            className="img-fluid rounded mt-2"
                            alt="Existing Banner"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>No image selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="row mt-2 justify-content-center">
          <div className="col-md-2">
            <button
              onClick={handleSubmit}
              className="purple-btn2 w-100"
              disabled={loading}
            >
              Submit
            </button>
          </div>
          <div className="col-md-2">
            <button onClick={handleCancel} className="purple-btn2 w-100">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerEdit;
