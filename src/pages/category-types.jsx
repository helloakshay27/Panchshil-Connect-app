import React, { useState } from "react";
import axios from "axios";

const CategoryTypes = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("https://panchshil-super.lockated.com/category_types.json", {
        category_type: { category_type: name },
      });
      alert("Category Type added successfully!");
      setName(""); // Reset input field after success
    } catch (error) {
      console.error("Error adding category type:", error);
      alert("Failed to add category type.");
    }
    setLoading(false);
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Category Type</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name{" "}
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
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

                {/* Submit & Cancel Buttons */}
                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2">
                    <button type="submit" className="purple-btn2 w-100" disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                  <div className="col-md-2">
                    <button type="button" className="purple-btn2 w-100" >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryTypes;
