import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";




const BannerAdd = () => {

  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
   
        banner_type: "",
        banner_redirect: "",
        company_id: "",
        title: "",
        attachfile: [] 
  
  });

  console.log("data",formData)

  useEffect(() => {

    const fetchBanners = async () => {
      try {
        const response = await axios.get(
          " https://panchshil-super.lockated.com/company_setups.json",{
            method: "GET",
            headers: {
              Authorization: `Bearer kD8B8ZeWZQAd2nQ-70dcfLXgYHLQh-zjggvuuE_93BY`,
              "Content-Type": "application/json",
            },

          }
        );
        
        console.log("response", response.data);
        setProjects(response.data); // Assuming the API returns an object with a "banners" field
        setLoading(false);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setError("Failed to fetch banners. Please try again later.");
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

// this is for dropdown
  const handleCompanyChange = (e) => {
    const formData = e.target.value
    setFormData((prevFormData) => ({
       ...prevFormData, 
       company_id : formData,
       
    }));
  };
  console.log("data",formData)

 //this is for input value
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name] : e.target.value})
  }

  //for files into array
  const handleFileChange = (e,fieldName) => {
    const files = e.target.files
    setFormData((prevFormData) => ({
      ...prevFormData,
      attachfile: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const attachfile = formData.attachfile || []
    // Prepare the data for the POST request
    try {
      const sendData = new FormData()
      sendData.append("banner[title]", formData.title || "")
      sendData.append("banner[company_id]", formData.company_id || "")
      Array.from(formData.attachfile).forEach((file, index) => {
        sendData.append(`banner[banner_image]`, file);
      });
      const response = await axios.post("https://panchshil-super.lockated.com/banners.json", sendData)
      
        toast.success("form submited successfully")
        console.log("response", response)
    } catch (error) {
      toast.error(`Error creating banner: ${error.message}`);
    }
  };

  return (
    <>
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">New Banner</h3>
              </div>
              <div className="card-body">
                <div className="row">
                <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Title<span />
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
                        onChange={(e) => handleFileChange(e,"attachfile")}
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
                      <button onClick={handleSubmit} type="submit" className="purple-btn2 w-100">
                        Submit
                      </button>
                    </div>
                  </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default BannerAdd;
