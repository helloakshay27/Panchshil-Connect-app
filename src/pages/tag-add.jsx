import React, { useState, useEffect } from "react";
import axios from "axios";

const TagAdd = () => {
  const [name, setName] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access_token");

  // Fetch tags
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get("https://panchshil-super.lockated.com/tags.json", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await axios.post("https://panchshil-super.lockated.com/tags.json", { tag: { tag_type: name } }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setName("");
      fetchTags(); // Refresh tag list
    } catch (error) {
      console.error("Error adding tag:", error);
    }
    setLoading(false);
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Tag Type</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name <span style={{ color: "#de7008", fontSize: "16px" }}>*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2">
                    <button type="submit" className="purple-btn2 w-100" disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                  <div className="col-md-2">
                    <button type="button" className="purple-btn2 w-100" onClick={() => setName("")}>Cancel</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Tag List Table */}
          <div className="card mt-4 pb-4 mx-3">
            <div className="card-header">
              <h3 className="card-title">Tags List</h3>
            </div>
            <div className="card-body">
              <table className="tbl-container mt-3">
                <thead>
                  <tr>
                    <th> Sr. no</th>
                    <th>Tag Type</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.length > 0 ? (
                    tags.map((tag,index) => (
                      <tr key={tag.id}>
                        <td>{index + 1}</td>
                        <td>{tag.tag_type}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">
                        No tags available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagAdd;