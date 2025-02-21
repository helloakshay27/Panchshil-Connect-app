import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]); // Always set as an array
  const [formData, setFormData] = useState({
    banner_type: "",
    banner_redirect: "",
    company_id: "",
    title: "",
    attachfile: [],
  });

  const fetchBanners = async () => {
    try {
      const response = await axios.get(
        `https://panchshil-super.lockated.com/banners/${id}.json`
      );

      if (response.data) {
        setFormData(response.data);
      } else {
        throw new Error("Invalid banner data received.");
      }
    } catch (error) {
      console.error("Error fetching banner:", error);
      setError("Failed to fetch banner. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompany = async () => {
    try {
      const response = await axios.get(
        "https://panchshil-super.lockated.com/company_setups.json",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer hnbLunLzzG9ft5dyVulTBpuQp2mgvfZe_69ukCTa8QQ`,
            "Content-Type": "application/json",
          },
        }
      );

      // Ensure response.data.company_setups is an array before setting state
      if (response.data && Array.isArray(response.data.company_setups)) {
        setProjects(response.data.company_setups);
      } else {
        setProjects([]); // Fallback to empty array if invalid response
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to fetch companies. Please try again later.");
      setProjects([]); // Ensure `projects` is always an array
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompanyChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      company_id: e.target.value,
    }));
  };

  useEffect(() => {
    fetchBanners();
    fetchCompany();
  }, []);

  const handleFileChange = (e, fieldName) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    const filePreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: files, // Store array of files
      previewImage: filePreviews[0], // Store only the first image preview
    }));
  };

  const updateBanners = async () => {
    try {
      if (!id) {
        throw new Error("Banner ID is missing.");
      }

      const postData = new FormData();
      if (formData.attachfile.length > 0) {
        formData.attachfile.forEach((file) =>
          postData.append("banner_image", file)
        );
      }

      postData.append("banner[banner_type]", formData.banner_type);
      postData.append("banner[banner_redirect]", formData.banner_redirect);
      postData.append("banner[company_id]", formData.company_id);
      postData.append("banner[title]", formData.title);

      await axios.put(
        `https://panchshil-super.lockated.com/banners/${id}.json`,
        postData
      );

      toast.success("Updated successfully!");
      navigate("/banner-list");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update the banner. Please try again.");
    }
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-hidden">
          <div className="module-data-section">
            <div className="card mt-4 pb-2 mx-4">
              <div className="card-header">
                <h3 className="card-title">Edit Banner</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          className="form-control"
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter title"
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Company</label>
                        <select
                          className="form-control form-select"
                          value={formData.company_id}
                          name="company_id"
                          onChange={handleCompanyChange}
                        >
                          <option value="">Select a Company</option>
                          {Array.isArray(projects) &&
                            projects.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-3 d-flex gap-3">
                      {formData.previewImage ? (
                        <img
                          src={formData.previewImage}
                          alt="Uploaded Preview"
                          className="img-fluid rounded mt-2"
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                      ) : (
                        <img
                          src={formData?.attachfile?.document_url || "NA"}
                          className="img-fluid rounded mt-2"
                          alt={formData?.title || "Banner Image"}
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                      )}

                      <div className="form-group">
                        <label>Banner</label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachfile"
                          multiple
                          onChange={(e) => handleFileChange(e, "attachfile")}
                          style={{ width: "170%" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="row mt-2 justify-content-center">
              <div className="col-md-2">
                <button
                  onClick={updateBanners}
                  type="submit"
                  className="purple-btn2 w-100"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerEdit;
