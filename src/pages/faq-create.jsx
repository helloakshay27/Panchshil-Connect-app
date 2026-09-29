import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const FaqCreate = () => {
  const connectEvents = useConnectEvents();
  const [formData, setFormData] = useState({
    faq_category_id: "",
    faq_sub_category_id: "",
    faqs: [],
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sites, setSites] = useState([]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [faqTag, setFaqTag] = useState("");

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(false);

  const navigate = useNavigate();

  // Get auth headers
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await axios.get(`${baseURL}faq_categories.json`, {
          headers: getAuthHeaders(),
        });

        const categoriesData = res.data?.faq_categories || res.data || [];
        const formattedCategories = categoriesData.map((category) => ({
          id: category?.id || "",
          name: category?.name || "Unnamed Category",
        }));

        setCategories(formattedCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.faq_category_id) {
      const fetchSubCategories = async () => {
        try {
          setSubCategoriesLoading(true);
          const res = await axios.get(`${baseURL}faq_sub_categories.json`, {
            headers: getAuthHeaders(),
          });

          const subCategoriesData =
            res.data?.faq_sub_categories || res.data || [];
          // Filter subcategories by selected category
          const filteredSubCategories = subCategoriesData.filter(
            (subCat) => subCat.faq_category_id == formData.faq_category_id
          );

          const formattedSubCategories = filteredSubCategories.map(
            (subCategory) => ({
              id: subCategory?.id || "",
              name: subCategory?.name || "Unnamed Sub Category",
            })
          );

          setSubCategories(formattedSubCategories);
        } catch (err) {
          console.error("Failed to fetch subcategories:", err);
          toast.error("Failed to load subcategories");
        } finally {
          setSubCategoriesLoading(false);
        }
      };
      fetchSubCategories();
    } else {
      setSubCategories([]);
      setFormData((prev) => ({ ...prev, faq_sub_category_id: "" }));
    }
  }, [formData.faq_category_id]);

  // Fetch sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setSitesLoading(true);
        const res = await axios.get(`${baseURL}sites.json`, {
          headers: getAuthHeaders(),
        });

        const sitesData = res.data?.sites || res.data || [];
        const formattedSites = sitesData.map((site) => ({
          id: site?.id || "",
          name: site?.name || "Unnamed Site",
        }));

        setSites(formattedSites);
      } catch (err) {
        console.error("Failed to fetch sites:", err);
        toast.error("Failed to load sites");
      } finally {
        setSitesLoading(false);
      }
    };
    fetchSites();
  }, []);

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      faq_category_id: value,
      faq_sub_category_id: "",
    }));
  };

  const handleSubCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      faq_sub_category_id: value,
    }));
  };

  const handleAddFaq = () => {
    if (!question.trim()) {
      toast.error("Question is required");
      return;
    }

    if (!answer.trim()) {
      toast.error("Answer is required");
      return;
    }

     if (
    (baseURL === "https://dev-panchshil-super-app.lockated.com/" ||
      baseURL === "https://kalpataru.lockated.com/" ||
      baseURL === "https://rustomjee-live.lockated.com/")
  ) {
    if (!formData.faq_category_id) {
      toast.error("FAQ Category is required");
      return;
    }

    if (!formData.faq_sub_category_id) {
      toast.error("FAQ Sub Category is required");
      return;
    }
  }

    // if (!selectedSiteId) {
    //   toast.error("Site is required");
    //   return;
    // }

    const newFaq = {
      question: question.trim(),
      answer: answer.trim(),
      site_id: parseInt(selectedSiteId),
      active: true,
      faq_tag: faqTag.trim(),
    };

    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, newFaq],
    }));

    // Clear input fields
    setQuestion("");
    setAnswer("");
    setFaqTag("");
    setSelectedSiteId("");

    toast.success("FAQ added to list");
  };

  const handleDeleteFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
    toast.success("FAQ removed from list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // if (!formData.faq_category_id) {
    //   toast.error("FAQ Category is required");
    //   return;
    // }
    if (
  (baseURL === "https://dev-panchshil-super-app.lockated.com/" || baseURL === "https://rustomjee-live.lockated.com/") &&
  !formData.faq_category_id
) {
  toast.error("FAQ Category is required");
  return;
}

    // if (!formData.faq_sub_category_id) {
    //   toast.error("FAQ Sub Category is required");
    //   return;
    // }

    if (formData.faqs.length === 0) {
      toast.error("At least one FAQ is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        faq_category_id: parseInt(formData.faq_category_id),
        faq_sub_category_id: parseInt(formData.faq_sub_category_id),
        faqs: formData.faqs,
      };

      await axios.post(`${baseURL}faqs.json`, payload, {
        headers: getAuthHeaders(),
      });

      connectEvents.onRecordSaved({ mode: "added" });
      toast.success("FAQs created successfully!");
      navigate("/faq-list"); // Adjust navigation path as needed
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create FAQs";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categoryRequired =
    baseURL === "https://dev-panchshil-super-app.lockated.com/" ||
    baseURL === "https://kalpataru.lockated.com/" ||
    baseURL === "https://rustomjee-live.lockated.com/";

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form id="faqCreateForm" onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <HelpCircle size={16} strokeWidth={1.8} />
                </span>
                Create FAQ
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="FAQ Category"
                      required={categoryRequired}
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : "Select Category"
                      }
                      options={categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                      }))}
                      value={formData.faq_category_id}
                      onChange={handleCategoryChange}
                      disabled={loading || categoriesLoading}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="FAQ Sub Category"
                      required={categoryRequired}
                      placeholder={
                        subCategoriesLoading
                          ? "Loading subcategories..."
                          : "Select Sub Category"
                      }
                      options={subCategories.map((subCategory) => ({
                        value: subCategory.id,
                        label: subCategory.name,
                      }))}
                      value={formData.faq_sub_category_id}
                      onChange={handleSubCategoryChange}
                      disabled={
                        loading ||
                        subCategoriesLoading ||
                        !formData.faq_category_id
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Question"
                      required
                      name="question"
                      placeholder="Enter FAQ Question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Answer"
                      required
                      name="answer"
                      placeholder="Enter FAQ Answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Site Selection */}
                {/* <div className="col-md-2 mt-2">
                    <div className="form-group">
                      <label>Site <span className="otp-asterisk">*</span></label>
                      <SelectBox
                        options={[
                          { value: "", label: sitesLoading ? "Loading sites..." : "Select Site" },
                          ...sites.map((site) => ({
                            value: site.id,
                            label: site.name,
                          })),
                        ]}
                        defaultValue={selectedSiteId}
                        onChange={(value) => setSelectedSiteId(value)}
                        disabled={loading || sitesLoading}
                      />
                    </div>
                  </div> */}

                {/* FAQ Tag */}
                {/* <div className="col-md-2 mt-2">
                    <div className="form-group">
                      <label>FAQ Tag</label>
                      <input
                        className="form-control"
                        type="text"
                        name="faq_tag"
                        placeholder="Enter tags (comma separated)"
                        value={faqTag}
                        onChange={(e) => setFaqTag(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div> */}

                <div className="col-md-3">
                  <div className="form-group">
                    <button
                      type="button"
                      className="banner-form-action-btn w-100"
                      onClick={handleAddFaq}
                      disabled={loading}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {formData.faqs.length > 0 && (
                <div className="col-md-12 mt-4">
                  <div className="tbl-container w-100">
                    <table className="w-100">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Question</th>
                          <th>Answer</th>
                          {/* <th>Site</th> */}
                          {/* <th>FAQ Tag</th> */}
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.faqs.map((faq, index) => {
                          const siteName =
                            sites.find((site) => site.id == faq.site_id)
                              ?.name || "Unknown Site";
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td
                                style={{
                                  maxWidth: "200px",
                                  wordWrap: "break-word",
                                }}
                              >
                                {faq.question}
                              </td>
                              <td
                                style={{
                                  maxWidth: "250px",
                                  wordWrap: "break-word",
                                }}
                              >
                                {faq.answer}
                              </td>
                              {/* <td>{siteName}</td>
                                <td>{faq.faq_tag || '-'}</td> */}
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() => handleDeleteFaq(index)}
                                  disabled={loading}
                                  style={{ color: "#fff" }}
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={loading || formData.faqs.length === 0}
            >
              {loading ? "Submiting..." : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate("/faq-list")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FaqCreate;
