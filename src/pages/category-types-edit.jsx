import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import axios from "axios";

const CategoryTypesEdit = () => {
  const { id } = useParams(); // Get category ID from URL
  const navigate = useNavigate();
  const [categoryType, setCategoryType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch category type details by ID
    axios
      .get(`https://panchshil-super.lockated.com/category_types/${id}.json`)
      .then((response) => {
        if (response.data) {
          setCategoryType(response.data.category_type);
        }
      })
      .catch((error) => console.error("Error fetching category type:", error));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .put(`https://panchshil-super.lockated.com/category_types/${id}.json`, {
        category_type: {
          category_type: categoryType,
        },
      })
      .then(() => {
        setLoading(false);
        toast.success("Category Type updated successfully!");

        navigate("/setup-member/category-types-list"); // Redirect after update
      })
      .catch((error) => {
        toast.error(errorMessage);
        setLoading(false);
      });
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Edit Category Type</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Name Field */}
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
                        value={categoryType}
                        onChange={(e) => setCategoryType(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
              </form>
            </div>
          </div>
          
        </div>
        <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button
                type="submit"
                className="purple-btn2 w-100"
                disabled={loading}
              >
                {loading ? "Updating..." : "Submit"}
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="purple-btn2 w-100"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default CategoryTypesEdit;
