import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import RoundedRadioButtonCard from "../components/reusable/RoundedRadioButtonCard";
import {baseURL} from "../pages/baseurl/apiDomain";
import axios from "axios";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Tier name is required")
    .test('unique-name', 'Tier name already exists.', async function(value) {
      if (!value) return true; // Let required validation handle empty values
      
      try {
        const storedValue = sessionStorage.getItem("selectedId");
        const token = localStorage.getItem("access_token");
        
        // Call the tiers API to check for existing names
        const response = await axios.get(
          `${baseURL}loyalty/tiers.json?access_token=${token}&&q[loyalty_type_id_eq]=${storedValue}`
        );
        
        if (response.data) {
          // Check if tier name already exists (case-insensitive)
          const existingTier = response.data.find(tier => 
            tier.name && tier.name.toLowerCase() === value.toLowerCase()
          );
          
          if (existingTier) {
            return false; // Name already exists
          }
        }
        
        // Also check against other tiers in the current form
        const { tiers } = this.parent;
        if (tiers && tiers.length > 0) {
          const duplicateCount = tiers.filter(tier => 
            tier.name && tier.name.toLowerCase() === value.toLowerCase()
          ).length;
          
          return duplicateCount === 0;
        }
        
        return true;
      } catch (error) {
        console.error("Error checking tier name:", error);
        // If API call fails, still validate against form data
        const { tiers } = this.parent;
        if (!tiers || tiers.length === 0) return true;
        
        const duplicateCount = tiers.filter(tier => 
          tier.name && tier.name.toLowerCase() === value.toLowerCase()
        ).length;
        
        return duplicateCount === 0;
      }
    }),
  exit_points: Yup.number()
    .required("Exit points are required")
    .positive("Exit points must be a positive number"),
  multipliers: Yup.number()
    .required("Multipliers are required")
    .positive("Multipliers must be a positive number"),
  welcome_bonus: Yup.number()
    .required("Welcome bonus is required")
    .positive("Welcome bonus must be a positive number"),
  point_type: Yup.string().required("Point type is required"),
  tiers: Yup.array().of(
    Yup.object().shape({
      name: Yup.string()
        .required("Tier name is required")
        .test('unique-tier-name', 'Tier name already exists.', async function(value) {
          if (!value) return true;
          
          try {
            const storedValue = sessionStorage.getItem("selectedId");
            const token = localStorage.getItem("access_token");
            
            // Call the tiers API to check for existing names
            const response = await axios.get(
              `${baseURL}loyalty/tiers.json?access_token=${token}&&q[loyalty_type_id_eq]=${storedValue}`
            );
            
            if (response.data) {
              // Check if tier name already exists (case-insensitive)
              const existingTier = response.data.find(tier => 
                tier.name && tier.name.toLowerCase() === value.toLowerCase()
              );
              
              if (existingTier) {
                return false; // Name already exists
              }
            }
            
            // Check against main tier name and other tiers in the form
            const { parent } = this.options;
            const mainTierName = parent?.name;
            const allTiers = parent?.tiers || [];
            
            // Check against main tier name
            if (mainTierName && mainTierName.toLowerCase() === value.toLowerCase()) {
              return false;
            }
            
            // Check against other tiers in the array
            const currentIndex = this.path.match(/\[(\d+)\]/)?.[1];
            const duplicates = allTiers.filter((tier, index) => 
              tier.name && 
              tier.name.toLowerCase() === value.toLowerCase() && 
              index !== parseInt(currentIndex)
            );
            
            return duplicates.length === 0;
          } catch (error) {
            console.error("Error checking tier name:", error);
            // If API call fails, still validate against form data
            const { parent } = this.options;
            const mainTierName = parent?.name;
            const allTiers = parent?.tiers || [];
            
            // Check against main tier name
            if (mainTierName && mainTierName.toLowerCase() === value.toLowerCase()) {
              return false;
            }
            
            // Check against other tiers in the array
            const currentIndex = this.path.match(/\[(\d+)\]/)?.[1];
            const duplicates = allTiers.filter((tier, index) => 
              tier.name && 
              tier.name.toLowerCase() === value.toLowerCase() && 
              index !== parseInt(currentIndex)
            );
            
            return duplicates.length === 0;
          }
        }),
      exit_points: Yup.number()
        .required("Exit points are required")
        .positive("Exit points must be a positive number"),
      multipliers: Yup.number()
        .required("Multipliers are required")
        .positive("Multipliers must be a positive number"),
      welcome_bonus: Yup.number()
        .required("Welcome bonus is required")
        .positive("Welcome bonus must be a positive number"),
    })
  ),
});

const NewTier = () => {
  const [step, setStep] = useState(1);
  const [timeframe, setTimeframe] = useState("");
  const [timeframeError, setTimeframeError] = useState("");
  const [tiers, setTiers] = useState([]);
  const navigate = useNavigate();

  const storedValue = sessionStorage.getItem("selectedId");
  const token = localStorage.getItem("access_token");

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
    setTimeframeError("");
  };

  const nextStep = () => {
    if (step === 1 && timeframe) {
      setStep(2);
    } else if (!timeframe) {
      setTimeframeError("Please select a timeframe.");
    }
  };

  const cancelStep = () => {
    setStep(1);
    setTimeframe("");
    setTimeframeError("");
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setStatus }
  ) => {
    try {
      // Additional server-side validation before submission
      const storedValue = sessionStorage.getItem("selectedId");
      const token = localStorage.getItem("access_token");
      
      // Get existing tiers from API
      const existingTiersResponse = await axios.get(
        `${baseURL}loyalty/tiers.json?access_token=${token}&&q[loyalty_type_id_eq]=${storedValue}`
      );
      
      const existingTiers = existingTiersResponse.data || [];
      
      // Check for duplicate tier names across all tiers including main tier and existing tiers
      const allNewTierNames = [values.name, ...(values.tiers || []).map(tier => tier.name)];
      const lowerCaseNewNames = allNewTierNames.map(name => name?.toLowerCase()).filter(Boolean);
      
      // Check against existing tiers in database
      const conflictingTier = existingTiers.find(existingTier => 
        lowerCaseNewNames.some(newName => 
          existingTier.name && existingTier.name.toLowerCase() === newName
        )
      );
      
      if (conflictingTier) {
        setStatus({ error: `Tier name "${conflictingTier.name}" already exists.` });
        setSubmitting(false);
        return;
      }
      
      // Check for duplicates within the new submission
      const hasDuplicates = lowerCaseNewNames.length !== new Set(lowerCaseNewNames).size;
      
      if (hasDuplicates) {
        setStatus({ error: "Tier name already exists in your submission." });
        setSubmitting(false);
        return;
      }

      const formattedTiers = values.tiers?.map((tier) => ({
        loyalty_type_id: Number(storedValue),
        name: tier.name,
        exit_points: Number(tier.exit_points),
        multipliers: Number(tier.multipliers),
        welcome_bonus: Number(tier.welcome_bonus),
        point_type: timeframe,
      }));

      const newTier = {
        loyalty_type_id: Number(storedValue),
        name: values.name,
        exit_points: Number(values.exit_points),
        multipliers: Number(values.multipliers),
        welcome_bonus: Number(values.welcome_bonus),
        point_type: timeframe,
      };

      const data = {
        loyalty_tier:
          formattedTiers?.length > 0 ? [...formattedTiers, newTier] : newTier,
      };

      try {
        // const token = "bfa5004e7b0175622be8f7e69b37d01290b737f82e078414"; // Ensure to replace with your token
        const url =
          formattedTiers?.length > 0
            ? `${baseURL}loyalty/tiers/bulk_create?token=${token}`
            : `${baseURL}loyalty/tiers.json?access_token=${token}`;

        console.log("Final URL:", url);
        console.log("Data Sent:", JSON.stringify(data, null, 2));

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const responseData = await response.json();
          setStatus({ success: "Tier saved successfully!" });
          
          // Show success message and navigate after a delay
          setTimeout(() => {
            resetForm();
            navigate("/setup-member/tiers");
          }, 1500);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || `Unexpected response: ${response.status}`);
        }
      } catch (error) {
        setStatus({
          error: error.message || "Failed to create tier. Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
    } catch (error) {
      setStatus({
        error: error.message || "Failed to validate tier names. Please try again.",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="w-100 px-4" style={{ height: "90%" }}>
      {/* <SubHeader /> */}
      {step === 1 && (
        <div
          className="module-data-section mt-2 flex-grow-1"
          style={{ position: "relative", height: "100%" }}
        >
          {/* <p className="pointer">
            <Link to={"/tiers"}>
              <span>Tiers</span>
            </Link>{" "}
            &gt; Tier Setting
          </p> */}
          <div
            className="border-bottom"
            style={{ fontSize: "16px", paddingBottom: "20px" }}
          >
            <h5 className="d-flex">
              <span className="title" style={{ fontSize: "22px" }}>
                TIER SETTING
              </span>
            </h5>
            <p className="mt-3 ms-4 fw-semibold">
              Point Accumulation Timeframe
            </p>
            <p className="ms-4 text-muted">
              Establish how members enter into higher tiers on points earning
              and time frame.
            </p>
          </div>
          <RoundedRadioButtonCard onChange={handleTimeframeChange} />
          {timeframeError && (
            <div className="text-danger ms-4">{timeframeError}</div>
          )}
          <div
            className="row mt-2 mb-5 justify-content-center align-items-center"
            style={{ position: "absolute", bottom: 0, width: "100%" }}
          >
            <div className="col-md-2">
              <button 
                className="purple-btn1 w-100" 
                onClick={nextStep}
                style={{ 
                  padding: "10px 20px", 
                  fontSize: "16px",
                  minHeight: "40px"
                }}
              >
                Next
              </button>
            </div>
            <div className="col-md-2">
              <button
                className="purple-btn2 w-100"
                onClick={() => navigate("/setup-member/tiers")}
                style={{ 
                  padding: "10px 20px", 
                  fontSize: "16px",
                  minHeight: "40px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="module-data-section mt-2 " style={{ height: "80%" }}>
          {/* <p className="pointer">
            <span>Tier</span> &gt; New Tier
          </p> */}
          <h5 className="mb-3">
            <span className="title">New Tier</span>
          </h5>
          <Formik
            initialValues={{
              name: "",
              exit_points: "",
              multipliers: "",
              welcome_bonus: "",
              point_type: timeframe,
              tiers: [],
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting, status }) => (
              <Form
                className="go-shadow px-3 d-flex justify-content-between"
                style={{
                  height: "100%",
                  flexDirection: "column",
                  marginRight: "26px",
                  overflowY: "auto",
                }}
              >
                {/* Status Messages */}
                {status && (
                  <div className={`alert ${status.success ? 'alert-success' : 'alert-danger'} mt-3`}>
                    {status.success || status.error}
                  </div>
                )}
                
                <div>
                  <div className="row">
                    <div className="col-md-3 col-sm-11 mb-3">
                      <fieldset className="border">
                        <legend className="float-none">
                          Tier Name<span>*</span>
                        </legend>
                        <Field
                          name="name"
                          placeholder="Enter Tier Name"
                          className="form-control border-0"
                        />
                      </fieldset>
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-danger"
                      />
                    </div>

                    <div className="col-md-3 col-sm-11 mb-3">
                      <fieldset className="border">
                        <legend className="float-none">
                          Exit Points<span>*</span>
                        </legend>
                        <Field
                          name="exit_points"
                          placeholder="Enter Exit Points"
                          type="number"
                          className="form-control border-0"
                        />
                      </fieldset>
                      <ErrorMessage
                        name="exit_points"
                        component="div"
                        className="text-danger"
                      />
                    </div>

                    <div className="col-md-3 col-sm-11 mb-3">
                      <fieldset className="border">
                        <legend className="float-none">
                          Multipliers<span>*</span>
                        </legend>
                        <Field
                          name="multipliers"
                          placeholder="Enter Multipliers"
                          type="number"
                          className="form-control border-0"
                        />
                      </fieldset>
                      <ErrorMessage
                        name="multipliers"
                        component="div"
                        className="text-danger"
                      />
                    </div>

                    <div className="col-md-3 col-sm-11 mb-3">
                      <fieldset className="border">
                        <legend className="float-none">
                          Welcome Bonus<span>*</span>
                        </legend>
                        <Field
                          name="welcome_bonus"
                          placeholder="Enter Welcome Bonus"
                          type="number"
                          className="form-control border-0"
                        />
                      </fieldset>
                      <ErrorMessage
                        name="welcome_bonus"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                  </div>

                  <FieldArray name="tiers">
                    {({ insert, remove, push }) => (
                      <div style={{ marginTop: "20px" }}>
                        {values.tiers.length > 0 &&
                          values.tiers.map((tier, index) => (
                            <div
                              className="row position-relative border rounded p-3 mb-3"
                              key={index}
                              style={{ paddingBottom: "20px", paddingTop: "30px" }}
                            >
                              {/* Close button positioned at top-right corner */}
                              <button
                                type="button"
                                className="btn btn-outline-danger rounded-circle position-absolute"
                                style={{
                                  top: "10px",
                                  right: "15px",
                                  width: "28px",
                                  height: "28px",
                                  padding: "0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  zIndex: 10
                                }}
                                onClick={() => remove(index)}
                                title="Remove tier"
                              >
                                ×
                              </button>
                              
                              <div className="col-md-3 col-sm-11 mb-3">
                                <fieldset className="border">
                                  <legend className="float-none">
                                    Tier Name<span>*</span>
                                  </legend>
                                  <Field
                                    name={`tiers[${index}].name`}
                                    placeholder="Enter Tier Name"
                                    className="form-control border-0"
                                  />
                                </fieldset>
                                <ErrorMessage
                                  name={`tiers[${index}].name`}
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                              <div className="col-md-3 col-sm-11 mb-3">
                                <fieldset className="border">
                                  <legend className="float-none">
                                    Exit Points<span>*</span>
                                  </legend>
                                  <Field
                                    name={`tiers[${index}].exit_points`}
                                    placeholder="Enter Exit Points"
                                    type="number"
                                    className="form-control border-0"
                                  />
                                </fieldset>
                                <ErrorMessage
                                  name={`tiers[${index}].exit_points`}
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                              <div className="col-md-3 col-sm-11 mb-3">
                                <fieldset className="border">
                                  <legend className="float-none">
                                    Multipliers<span>*</span>
                                  </legend>
                                  <Field
                                    name={`tiers[${index}].multipliers`}
                                    placeholder="Enter Multipliers"
                                    type="number"
                                    className="form-control border-0"
                                  />
                                </fieldset>
                                <ErrorMessage
                                  name={`tiers[${index}].multipliers`}
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                              <div className="col-md-3 col-sm-11 mb-3">
                                <fieldset className="border">
                                  <legend className="float-none">
                                    Welcome Bonus<span>*</span>
                                  </legend>
                                  <Field
                                    name={`tiers[${index}].welcome_bonus`}
                                    placeholder="Enter Welcome Bonus"
                                    type="number"
                                    className="form-control border-0"
                                  />
                                </fieldset>
                                <ErrorMessage
                                  name={`tiers[${index}].welcome_bonus`}
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            </div>
                          ))}
                        <button
                          type="button"
                          className="purple-btn1"
                          onClick={() =>
                            push({
                              name: "",
                              exit_points: "",
                              multipliers: "",
                              welcome_bonus: "",
                            })
                          }
                        >
                          Add New Tier
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                <div className="row justify-content-center align-items-center">
                  <div className="col-md-2">
                    <button
                      type="submit"
                      className="purple-btn1 w-100"
                      disabled={isSubmitting}
                      style={{ 
                        padding: "10px 20px", 
                        fontSize: "16px",
                        minHeight: "40px"
                      }}
                    >
                      {isSubmitting ? "Saving..." : "Submit"}
                    </button>
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="purple-btn2 w-100"
                      onClick={() => {
                        setTiers([]);
                        navigate("/setup-member/tiers");
                      }}
                      style={{ 
                        padding: "10px 20px", 
                        fontSize: "16px",
                        minHeight: "40px"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default NewTier;
