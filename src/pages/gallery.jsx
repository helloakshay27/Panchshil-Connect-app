import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";
import axios from "axios";

const Gallery = () => {

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/galleries.json?project_id=1"
        );
        console.log("response", response)
        setGalleries(response.data.galleries); // Assuming response.data contains the gallery data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching galleries:", error);
        setError("Failed to fetch galleries. Please try again later.");
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []); // Empty dependency array means this runs only once when the component mounts

   console.log("data", galleries[0]?.title)

  return (
    <>
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Gallery Details</h3>
              </div>

              <div className="card-body">
                <div className="row">
                <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Project ID <span />
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        value={galleries[0]?.project_id}
                        placeholder="Default input"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Gallery Type ID <span />
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        value={galleries[0]?.gallery_type_id}
                        placeholder="Default input"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Title <span />
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        value={galleries[0]?.title}
                        placeholder="Default input"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name <span />
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        value={galleries[0]?.name}
                        placeholder="Default input"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Project Name <span />
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        value={galleries[0]?.project_name}
                        placeholder="Default input"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Gallery Type <span />
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        value={galleries[0]?.gallery_type}
                        placeholder="Default input"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Gallery URL <span />
                      </label>
                     <a
                     href={galleries[0]?.url || '#'}
                     className="form-control"
                     style={{ textDecoration: 'none', color: 'blue' }}
                     target="_blank"
                     rel="noopener noreferrer"
                      >
                     {galleries[0]?.url || 'No URL available'}
                      </a>
                   </div>
                 </div>

                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>Site Name</label>
                      <select
                        className="form-control form-select"
                        style={{ width: "100%" }}
                      >
                        <option selected="selected">Alabama</option>
                        <option>Alaska</option>
                        <option>California</option>
                        <option>Delaware</option>
                        <option>Tennessee</option>
                        <option>Texas</option>
                        <option>Washington</option>
                      </select>
                    </div>
                  </div> */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment
                        <span />
                      </label>
                      <a href={galleries[1]?.attachfile?.document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="form-control">
                      
                       <img
                         // src={galleries[1]?.attachfile?.document_url} 
                           alt={galleries[1]?.attachfile?.document_file_name}
                           className="img-fluid w-100"
                           style={{ height: '100%' }}
                        />
                       </a>

                    </div>
                  </div>
                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        className="form-control form-select"
                        style={{ width: "100%" }}
                      >
                        <option selected="selected">Select Status</option>
                        <option>Active</option>
                        <option>In-Active</option>
                      </select>
                    </div>
                  </div> */}
                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Banner URL <span />
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Default input"
                      />
                    </div>
                  </div> */}
                </div>
              </div>
              
            </div>
            
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Gallery;
