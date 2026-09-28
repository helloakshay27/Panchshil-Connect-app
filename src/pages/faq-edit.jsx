import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const FaqEdit = () => {
  const connectEvents = useConnectEvents();
  const [formData, setFormData] = useState({
    faq_category_id: "",
    faq_sub_category_id: "",
    faqs: [],
  });

  console.log("formdata", formData);

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
  const [hasFetched, setHasFetched] = useState(false);

  const navigate = useNavigate();
  const { faqId } = useParams();

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await axios.get(`${baseURL}faq_categories.json`, {
          headers: getAuthHeaders(),
        });

        const categoriesData = res.data?.faq_categories || res.data || [];
        const formattedCategories = categoriesData.map((category) => ({
          id: category?.id ?? "",
          name: category?.name || category?.faq_category_name || "Unnamed Category",
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

          const filteredSubCategories = subCategoriesData.filter(
            (subCat) =>
              String(subCat.faq_category_id || subCat.faq_category?.id) ===
              String(formData.faq_category_id)
          );

          const formattedSubCategories = filteredSubCategories.map(
            (subCategory) => ({
              id: subCategory?.id ?? "",
              name:
                subCategory?.name ||
                subCategory?.faq_sub_category_name ||
                "Unnamed Sub Category",
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

  // Fetch existing FAQ data
  // useEffect(() => {
  //   if (faqId && !hasFetched) {
  //     const fetchFaqData = async () => {
  //       try {
  //         setLoading(true);
  //         const res = await axios.get(`${baseURL}faqs/${faqId}.json`, {
  //           headers: getAuthHeaders(),
  //         });

  //         const faqData = res.data?.faq || res.data;

  //         if (faqData) {
  //           setFormData({
  //             faq_category_id: faqData.faq_category_id || "",
  //             faq_sub_category_id: faqData.faq_sub_category_id || "",
  //             faqs: [
  //               {
  //                 id: faqData.id,
  //                 faq_category_id: faqData.faq_category_id || "",
  //                 faq_sub_category_id: faqData.faq_sub_category_id || "",
  //                 question: faqData.question || "",
  //                 answer: faqData.answer || "",
  //                 site_id: faqData.site_id || "",
  //                 active: faqData.active !== undefined ? faqData.active : true,
  //                 faq_tag: faqData.faq_tag || "",
  //                 isExisting: true,
  //               },
  //             ],
  //           });

  //           setHasFetched(true);
  //         }
  //       } catch (err) {
  //         console.error("Failed to fetch FAQ:", err);
  //         toast.error("Failed to load FAQ data");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchFaqData();
  //   }
  // }, [faqId, hasFetched]);

  useEffect(() => {
  if (faqId && !hasFetched) {
    const fetchFaqData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseURL}faqs/${faqId}.json`, {
          headers: getAuthHeaders(),
        });

        const faqData = res.data?.faq || res.data;

        if (faqData) {
          const categoryId =
            faqData.faq_category_id ||
            faqData.faq_category?.id ||
            "";
          const subCategoryId =
            faqData.faq_sub_category_id ||
            faqData.faq_sub_category?.id ||
            "";

          setFormData({
            faq_category_id: categoryId === "" ? "" : String(categoryId),
            faq_sub_category_id: subCategoryId === "" ? "" : String(subCategoryId),
            faqs: [
              {
                id: faqData.id,
                faq_category_id: categoryId,
                faq_sub_category_id: subCategoryId,
                question: faqData.question || "",
                answer: faqData.answer || "",
                site_id: faqData.site_id || "",
                active: faqData.active !== undefined ? faqData.active : true,
                faq_tag: faqData.faq_tag || "",
                isExisting: true,
              },
            ],
          });

          // Set question and answer input fields
          setQuestion(faqData.question || "");
          setAnswer(faqData.answer || "");

          setHasFetched(true);
        }
      } catch (err) {
        console.error("Failed to fetch FAQ:", err);
        toast.error("Failed to load FAQ data");
      } finally {
        setLoading(false);
      }
    };
    fetchFaqData();
  }
}, [faqId, hasFetched]);

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

    const newFaq = {
      question: question.trim(),
      answer: answer.trim(),
      site_id: parseInt(selectedSiteId),
      active: true,
      faq_tag: faqTag.trim(),
      isExisting: false, // Flag for new FAQ
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

  const handleEditFaq = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      ),
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!formData.faq_category_id) {
  //     toast.error("FAQ Category is required");
  //     return;
  //   }

  //   if (formData.faqs.length === 0) {
  //     toast.error("At least one FAQ is required");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // Update existing FAQ - only PUT method used
  //     const existingFaq = formData.faqs.find((faq) => faq.isExisting);
  //     if (existingFaq) {
  //       const payload = {
  //         faq: {
  //           faq_category_id: parseInt(formData.faq_category_id),
  //           faq_sub_category_id: parseInt(formData.faq_sub_category_id),
  //           question: existingFaq.question,
  //           answer: existingFaq.answer,
  //           site_id: parseInt(existingFaq.site_id),
  //           active: existingFaq.active,
  //           faq_tag: existingFaq.faq_tag,
  //         },
  //       };

  //       await axios.put(`${baseURL}faqs/${faqId}.json`, payload, {
  //         headers: getAuthHeaders(),
  //       });
  //     }

  //     toast.success("FAQ updated successfully!");
  //     navigate("/faq-list");
  //   } catch (error) {
  //     console.error("Error:", error);
  //     const errorMessage =
  //       error.response?.data?.message || "Failed to update FAQ";
  //     toast.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Sync question and answer state to formData.faqs[0]
  setFormData((prev) => ({
    ...prev,
    faqs: prev.faqs.map((faq, i) =>
      i === 0
        ? { ...faq, question: question.trim(), answer: answer.trim() }
        : faq
    ),
  }));

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

  if (question.trim() === "" || answer.trim() === "") {
    toast.error("Question and Answer are required");
    return;
  }

  if (formData.faqs.length === 0) {
    toast.error("At least one FAQ is required");
    return;
  }

  setLoading(true);

  try {
    const existingFaq = {
      ...formData.faqs[0],
      question: question.trim(),
      answer: answer.trim(),
    };
    const payload = {
      faq: {
        faq_category_id: parseInt(formData.faq_category_id),
        faq_sub_category_id: parseInt(formData.faq_sub_category_id),
        question: existingFaq.question,
        answer: existingFaq.answer,
        site_id: parseInt(existingFaq.site_id),
        active: existingFaq.active,
        faq_tag: existingFaq.faq_tag,
      },
    };

    await axios.put(`${baseURL}faqs/${faqId}.json`, payload, {
      headers: getAuthHeaders(),
    });

    connectEvents.onRecordSaved({ mode: "updated" });
    toast.success("FAQ updated successfully!");
    navigate("/faq-list");
  } catch (error) {
    console.error("Error:", error);
    const errorMessage =
      error.response?.data?.message || "Failed to update FAQ";
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
          <form id="faqEditForm" onSubmit={handleSubmit}>
            <div className="card banner-form-card mt-3 pb-4">
              <div className="card-header banner-form-section-header">
                <h3 className="banner-form-section-heading">
                  <span className="banner-form-section-icon" aria-hidden="true">
                    <HelpCircle size={16} strokeWidth={1.8} />
                  </span>
                  Edit FAQ
                </h3>
              </div>
              <div className="card-body">
                <div className="row banner-form-fields">
                  <div className="col-md-3">
                    <div className="form-group">
                      <SelectBox
                        label="FAQ Category"
                        required={
                          baseURL === "https://dev-panchshil-super-app.lockated.com/" ||
                          baseURL === "https://kalpataru.lockated.com/" ||
                          baseURL === "https://rustomjee-live.lockated.com/"
                        }
                        placeholder={
                          categoriesLoading
                            ? "Loading categories..."
                            : "Select Category"
                        }
                        options={categories.map((category) => ({
                          value: String(category.id),
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
                        required={
                          baseURL === "https://dev-panchshil-super-app.lockated.com/" ||
                          baseURL === "https://kalpataru.lockated.com/" ||
                          baseURL === "https://rustomjee-live.lockated.com/"
                        }
                        placeholder={
                          subCategoriesLoading
                            ? "Loading subcategories..."
                            : "Select Sub Category"
                        }
                        options={subCategories.map((subCategory) => ({
                          value: String(subCategory.id),
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
                </div>


                 
                  {/* <div className="col-md-2 mt-2">
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
                </div> */}

               
                {/* {formData.faqs.length > 0 && (
                  <div className="col-md-12 mt-4">
                    <div className="mt-4 tbl-container w-100">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>Sr No</th>
                            <th>Question</th>
                            <th>Answer</th>
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
                                <td>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={faq.question}
                                    onChange={(e) =>
                                      handleEditFaq(
                                        index,
                                        "question",
                                        e.target.value
                                      )
                                    }
                                    disabled={loading}
                                    style={{ minWidth: "200px" }}
                                  />
                                </td>
                                <td>
                                  <textarea
                                    className="form-control"
                                    value={faq.answer}
                                    onChange={(e) =>
                                      handleEditFaq(
                                        index,
                                        "answer",
                                        e.target.value
                                      )
                                    }
                                    disabled={loading}
                                    rows="1"
                                    style={{ minWidth: "250px" }}
                                  />
                                </td>
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
                )} */}
              </div>

              <div className="banner-form-actions">
                <button
                  type="submit"
                  form="faqEditForm"
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
            </div>

            <button type="submit" style={{ display: "none" }} />
          </form>
      </div>
    </div>
  );
};

export default FaqEdit;
