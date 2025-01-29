import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom'

const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
    const [error, setError] = useState(null);
    const [banners, setBanners] = useState([]); // Renamed galleries to banners
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
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
      // console.log("response", response);
    
      const data = response.data

      setFormData(data); // Assuming the API returns an object with a "banners" field
      setLoading(false);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Failed to fetch banners. Please try again later.");
      setLoading(false);
    }
  }

  const fetchCompany = async () => {
    try {
      const response = await axios.get(
        "https://panchshil-super.lockated.com/company_setups.json",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ZGehSTAEWJ728O8k2DZHr3t2wpdpngrH7n8KFN5s6x4`,
            "Content-Type": "application/json",
          },
        }
      );

      setProjects(response.data); // Assuming the API returns an object with a "banners" field
      setLoading(false);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Failed to fetch banners. Please try again later.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleCompanyChange = (e) => {
    const formData = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      company_id: formData,
    }));
  };
  console.log("formdata ", formData);


  useEffect(() => {
    fetchBanners();
    fetchCompany();
  }, [])


  const handleFileChange = (e, fieldName) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
  
    // Generate preview URLs for images
    const filePreviews = files.map(file => URL.createObjectURL(file));
  
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
  
    
    // Ensure attachfile is an array and append each file correctly
    if (formData.attachfile.length > 0) {
      Array.from(formData.attachfile).forEach((file) => {
        postData.append("banner[banner_image]", file);
      });
    }

  
      // Append other form fields to FormData
      postData.append("banner[banner_type]", formData.banner_type);
      postData.append("banner[banner_redirect]", formData.banner_redirect);
      postData.append("banner[company_id]", formData.company_id);
      postData.append("banner[title]", formData.title);
      
  
      // API Call
      const response = await axios.put(
        `https://panchshil-super.lockated.com/banners/${id}.json`,
        postData);
  
      console.log("Update Successful:", response.data);
      toast.success("Updated successfully!");
      navigate("/banner-list");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update the banner. Please try again.");
    }
  };
  
  return (
    <>
    {/* <Header /> */}
    <div className="main-content">
      <div className="website-content overflow-hidden">
        <div className="module-data-section">
          <div className="card mt-4 pb-2 mx-4">
            <div className="card-header">
              <h3 className="card-title">New Banner</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Title
                      <span />
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Default input"
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Company</label>
                    <select
                      className="form-control form-select"
                      style={{ width: "100%" }}
                      value={formData.company_id}
                      name="company_id"
                      onChange={handleCompanyChange}
                    >
                      <option value="">Select a Company</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                
                    
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
                    <label>
                      Banner
                      <span />
                    </label>
                    <input
                      className="form-control"
                      type="file"
                      name="attachfile"
                      multiple
                      placeholder="Default input"
                      onChange={(e) => handleFileChange(e, "attachfile")}
                    />

                    

                  </div>

                </div>
                {/* <div className="col-md-3">
                  <div className="form-group">
                    <label>Banner Type</label>
                    <select
                      className="form-control form-select"
                      style={{ width: "100%" }}>
                      <option selected="selected">Select Status</option>
                      <option>Active</option>
                      <option>In-Active</option>
                    </select>
                  </div>
                </div> */}
              </div>
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
  )
}

export default BannerEdit
