import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";

const FaqCreate = () => {
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

    if (!formData.faq_category_id) {
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

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form id="faqCreateForm" onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create FAQ</h3>
              </div>
              <div className="card-body">
                {/* Category and Subcategory Selection */}
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        FAQ Category <span className="otp-asterisk">*</span>
                      </label>
                      <SelectBox
                        options={[
                          {
                            value: "",
                            label: categoriesLoading
                              ? "Loading categories..."
                              : "Select Category",
                          },
                          ...categories.map((category) => ({
                            value: category.id,
                            label: category.name,
                          })),
                        ]}
                        defaultValue={formData.faq_category_id}
                        onChange={handleCategoryChange}
                        disabled={loading || categoriesLoading}
                      />
                    </div>
                  </div>

                  <div className="col-md-3 mt-1">
                    <div className="form-group">
                      <label>
                        FAQ Sub Category
                        {/* <span className="otp-asterisk">*</span> */}
                      </label>
                      <SelectBox
                        options={[
                          {
                            value: "",
                            label: subCategoriesLoading
                              ? "Loading subcategories..."
                              : "Select Sub Category",
                          },
                          ...subCategories.map((subCategory) => ({
                            value: subCategory.id,
                            label: subCategory.name,
                          })),
                        ]}
                        defaultValue={formData.faq_sub_category_id}
                        onChange={handleSubCategoryChange}
                        disabled={
                          loading ||
                          subCategoriesLoading ||
                          !formData.faq_category_id
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* FAQ Entry Section */}
                <div className="row align-items-center">
                  {/* Question */}
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>
                        Question <span className="otp-asterisk">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="question"
                        placeholder="Enter FAQ Question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>
                        Answer <span className="otp-asterisk">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        name="answer"
                        placeholder="Enter FAQ Answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={loading}
                        rows="1"
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

                  {/* Add Button */}
                  <div className="col-md-2 mt-2">
                    <button
                      type="button"
                      className="purple-btn2 rounded-3"
                      style={{ marginTop: "23px" }}
                      onClick={handleAddFaq}
                      disabled={loading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={26}
                        height={20}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span> Add</span>
                    </button>
                  </div>
                </div>

                {/* FAQ List Table */}
                {formData.faqs.length > 0 && (
                  <div className="col-md-12 mt-4">
                    <div className="mt-4 tbl-container w-100">
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

            {/* Hidden submit button for form submission */}
            <button type="submit" style={{ display: "none" }} />
          </form>

          {/* Visible buttons positioned below the card */}
          <div className="row mt-3 justify-content-center mx-4">
            <div className="col-md-2">
              <button
                type="submit"
                form="faqCreateForm"
                className="purple-btn2 w-100"
                disabled={loading || formData.faqs.length === 0}
              >
                {loading ? "Submiting..." : "Submit"}
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="purple-btn2 w-100"
                onClick={() => navigate("/faq-list")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqCreate;
