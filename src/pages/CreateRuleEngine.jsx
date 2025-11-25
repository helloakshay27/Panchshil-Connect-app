import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchMasterAttributes,
  fetchSubAttributes,
  fetchMasterRewardOutcomes,
  fetchSubRewardOutcomes,
} from "./Confi/ruleEngineApi";
import {baseURL} from "./baseurl/apiDomain"
import { masterOperators } from "./operatorsData";

const CreateRuleEngine = () => {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState([
    {
      id: 1,
      masterAttribute: "",
      subAttribute: "",
      masterOperator: "",
      subOperator: "",
      condition_type: "",
      value: "",
      master_operator: "",
    },
  ]);

  const token = localStorage.getItem("access_token");

  const [ruleName, setRuleName] = useState("");
  const [displayRuleName, setDisplayRuleName] = useState("");
  const [masterAttributes, setMasterAttributes] = useState([]);
  const [selectedMasterAttribute, setSelectedMasterAttribute] = useState("");
  const [subAttributes, setSubAttributes] = useState([]);

  const [masterRewardOutcomes, setMasterRewardOutcomes] = useState([]);
  const [selectedMasterRewardOutcomes, setSelectedMasterRewardOutcomes] =
    useState({ id: "", name: "" });
  const [subRewardOutcomes, setSubRewardOutcomes] = useState([]);
  const [subRewardOutcomesnew, setsubRewardOutcomesnew] = useState([]);
  const [selectedSubRewardOutcome, setSelectedSubRewardOutcome] =
    useState(null);

  const [selectedMasterOperator, setSelectedMasterOperator] = useState("");
  const [subOperators, setSubOperators] = useState([]);
  const [selectedSubOperator, setSelectedSubOperator] = useState("");

  const [error, setError] = useState("");
  const [parameter, setParameter] = useState("");
  const [previousValue, setPreviousValue] = useState("");

  const handleMasterOperatorChange = (e) => {
    const selectedName = e.target.value;
    setSelectedMasterOperator(selectedName);

    const selectedMaster = masterOperators.find(
      (op) => op.name === selectedName
    );

    setSubOperators(selectedMaster ? selectedMaster.subOptions : []);

    setSelectedSubOperator("");
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === "uat-loyalty.lockated.com") {
      const staticMasterAttributes = [
        {
          id: 1,
          display_name: "User Actions",
          sub_attributes: [
            { id: 101, attribute_name: "Referral", display_name: "Referral" },
            {
              id: 102,
              attribute_name: "App Download",
              display_name: "App Download",
            },
            {
              id: 103,
              attribute_name: "Social Media Interactions",
              display_name: "Social Media Interactions",
            },
            {
              id: 104,
              attribute_name: "Purchases made",
              display_name: "Purchases made",
            },
            {
              id: 105,
              attribute_name: "Reviews or feedback submission",
              display_name: "Reviews or feedback submission",
            },
            {
              id: 106,
              attribute_name: "Adding members",
              display_name: "Adding members",
            },
          ],
        },
        {
          id: 2,
          display_name: "Transaction events",
          sub_attributes: [
            {
              id: 201,
              attribute_name: "Total purchase value",
              display_name: "Total purchase value",
            },
            {
              id: 202,
              attribute_name: "Transaction frequency",
              display_name: "Transaction frequency",
            },
            {
              id: 203,
              attribute_name: "First-time purchase",
              display_name: "First-time purchase",
            },
            {
              id: 204,
              attribute_name: "Predefined product/category purchase",
              display_name: "Predefined product/category purchase",
            },
          ],
        },
        {
          id: 3,
          display_name: "Time based events",
          sub_attributes: [
            {
              id: 301,
              attribute_name: "Event completion before/after a date",
              display_name: "Event completion before/after a date",
            },
            {
              id: 302,
              attribute_name: "Inactivity for a specified period",
              display_name: "Inactivity for a specified period",
            },
            {
              id: 303,
              attribute_name: "Anniversary/birthday triggers",
              display_name: "Anniversary/birthday triggers",
            },
            {
              id: 304,
              attribute_name: "Time-limited offers",
              display_name: "Time-limited offers",
            },
          ],
        },
        {
          id: 4,
          display_name: "User demographics/segments",
          sub_attributes: [
            {
              id: 401,
              attribute_name: "Membership tier (Bronze, Silver, Gold)",
              display_name: "Membership tier (Bronze, Silver, Gold)",
            },
            {
              id: 402,
              attribute_name: "Customer location/region",
              display_name: "Customer location/region",
            },
            {
              id: 403,
              attribute_name: "Targeted offers for specific user segments",
              display_name: "Targeted offers for specific user segments",
            },
            {
              id: 404,
              attribute_name: "Customer age/gender",
              display_name: "Customer age/gender",
            },
          ],
        },
        {
          id: 5,
          display_name: "Engagement/Behaviour",
          sub_attributes: [
            {
              id: 501,
              attribute_name: "Login frequency",
              display_name: "Login frequency",
            },
            {
              id: 502,
              attribute_name: "App usage frequency",
              display_name: "App usage frequency",
            },
            {
              id: 503,
              attribute_name: "Cart abandonment",
              display_name: "Cart abandonment",
            },
          ],
        },
        {
          id: 6,
          display_name: "Milestones",
          sub_attributes: [
            {
              id: 601,
              attribute_name: "X transactions in a month",
              display_name: "X transactions in a month",
            },
            {
              id: 602,
              attribute_name: "Y referrals completed",
              display_name: "Y referrals completed",
            },
            {
              id: 603,
              attribute_name: "Z amount spent in a specific category",
              display_name: "Z amount spent in a specific category",
            },
          ],
        },
        {
          id: 7,
          display_name: "Tier-based",
          sub_attributes: [
            {
              id: 701,
              attribute_name: "Points required for upgrading tier",
              display_name: "Points required for upgrading tier",
            },
            {
              id: 702,
              attribute_name: "Minimum conditions for downgrading tier",
              display_name: "Minimum conditions for downgrading tier",
            },
          ],
        },
      ];
      setMasterAttributes(staticMasterAttributes);

      const staticRewardOutcomes = [
        {
          id: 1,
          display_name: "Points-Based Rewards",
          lock_model_name: "Points-Based Rewards",
          sub_reward_outcome: [
            { id: 101, display_name: "Fixed points" },
            { id: 102, display_name: "Variable points" },
            { id: 103, display_name: "Multiplier" },
          ],
        },
        {
          id: 2,
          display_name: "Discounts/Coupon",
          lock_model_name: "Discounts/Coupon",
          sub_reward_outcome: [
            { id: 201, display_name: "Fixed Discount" },
            { id: 202, display_name: "Percentage Discount" },
            { id: 203, display_name: "Coupon Code" },
          ],
        },
        {
          id: 3,
          display_name: "Tier Promotion",
          lock_model_name: "Tier Promotion",
          sub_reward_outcome: [
            { id: 301, display_name: "Tier Upgrade" },
            { id: 302, display_name: "Tier Downgrade" },
          ],
        },
        {
          id: 4,
          display_name: "Product/Service Offers",
          lock_model_name: "Product/Service Offers",
          sub_reward_outcome: [
            { id: 401, display_name: "Exclusive Access" },
            { id: 402, display_name: "Free Shipping" },
          ],
        },
        {
          id: 5,
          display_name: "Milestone-Based Rewards",
          lock_model_name: "Milestone-Based Rewards",
          sub_reward_outcome: [
            { id: 501, display_name: "Achievement Badge" },
            { id: 502, display_name: "Bonus Reward" },
          ],
        },
        {
          id: 6,
          display_name: "Cashback",
          lock_model_name: "Cashback",
          sub_reward_outcome: [
            { id: 601, display_name: "Fixed Cashback" },
            { id: 602, display_name: "Percentage Cashback" },
          ],
        },
      ];
      setMasterRewardOutcomes(staticRewardOutcomes);
    } else {
      const getData = async () => {
        try {
          const companyId = 44;
          const activeStatus = true;
          const masterAttrs = await fetchMasterAttributes(
            companyId,
            activeStatus
          );
          setMasterAttributes(masterAttrs.master_attributes || []);

          const rewardOutcomes = await fetchMasterRewardOutcomes(
            companyId,
            activeStatus
          );
          console.log("Reward Outcomes:", rewardOutcomes);
          setMasterRewardOutcomes(rewardOutcomes.master_reward_outcome || []);
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };

      getData();
    }
  }, []);

  const handleMasterAttributeChange = async (e) => {
    const selectedId = e.target.value;
    setSelectedMasterAttribute(selectedId);

    const hostname = window.location.hostname;
    if (hostname === "uat-loyalty.lockated.com") {
      const selectedMaster = masterAttributes.find(
        (attr) => attr.id === parseInt(selectedId)
      );
      if (selectedMaster) {
        setSubAttributes(selectedMaster.sub_attributes || []);
      } else {
        setSubAttributes([]);
      }
      return;
    }

    const selectedIndex = masterAttributes.findIndex(
      (attr) => attr.id === parseInt(selectedId)
    );
    console.log(selectedIndex);

    if (selectedIndex !== -1) {
      try {
        const subAttrs = await fetchSubAttributes(selectedId);
        console.log(subAttrs.master_attributes[selectedIndex].sub_attributes);
        const selectedSubAttributes =
          subAttrs.master_attributes[selectedIndex].sub_attributes;
        setSubAttributes(selectedSubAttributes);
      } catch (error) {
        console.error("Error fetching sub attributes:", error);
      }
    } else {
      console.error("Selected ID not found in master attributes");
    }
  };

  const handleMasterSubRewardOutcomeChange = async (e) => {
    const selectedId = e.target.value;

    const selectedOption = e.target.selectedOptions[0];
    const selectedName = selectedOption.getAttribute("data-name");
    setSelectedMasterRewardOutcomes({
      id: selectedId,
      name: selectedName,
    });

    const hostname = window.location.hostname;
    if (hostname === "uat-loyalty.lockated.com") {
      const selectedMaster = masterRewardOutcomes.find(
        (reward) => reward.id === parseInt(selectedId)
      );
      if (selectedMaster) {
        setSubRewardOutcomes(selectedMaster.sub_reward_outcome || []);
      } else {
        setSubRewardOutcomes([]);
      }
      return;
    }

    const selectedIndex = masterRewardOutcomes.findIndex(
      (attr) => attr.id === parseInt(selectedId)
    );
    console.log(selectedIndex);

    if (selectedIndex !== -1) {
      try {
        const subRewardOutcomes = await fetchSubRewardOutcomes(selectedId);
        console.log(
          subRewardOutcomes.master_reward_outcome[selectedIndex]
            .sub_reward_outcome
        );
        const selectedSubRewardOutcomes =
          subRewardOutcomes.master_reward_outcome[selectedIndex]
            .sub_reward_outcome;
        setSubRewardOutcomes(selectedSubRewardOutcomes);
      } catch (error) {
        console.error("Error fetching sub attributes:", error);
      }
    } else {
      console.error("Selected ID not found in master attributes");
    }
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: conditions.length + 1,
        masterAttribute: "",
        subAttribute: "",
        masterOperator: "",
        subOperator: "",
        condition_type: "",
        value: "",
        master_operator: "",
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!ruleName) {
      toast.error("Rule Name is required.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    
    if (!displayRuleName) {
      toast.error("Display Rule Name is required.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    for (let i = 0; i < conditions.length; i++) {
      const cond = conditions[i];
      if (!cond.masterAttribute) {
        toast.error(`Condition ${i + 1}: Master Attribute is required.`, {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
      if (!cond.subAttribute) {
        toast.error(`Condition ${i + 1}: Sub Attribute is required.`, {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
      if (!cond.master_operator) {
        toast.error(`Condition ${i + 1}: Master Operator is required.`, {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
      if (!cond.subOperator) {
        toast.error(`Condition ${i + 1}: Sub Operator is required.`, {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
      if (!cond.value) {
        toast.error(`Condition ${i + 1}: Value is required.`, {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
    }

    if (!selectedMasterRewardOutcomes.name) {
      toast.error("Master Reward Outcome is required.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (isNaN(parameter) || parameter.trim() === "") {
      setError("Parameter value must be a valid number.");
      return;
    }

    const conditionKeys = conditions.map(
      (cond) =>
        `${cond.subAttribute || ""}|${cond.subOperator || ""}|${
          cond.value || ""
        }|${cond.masterAttribute || ""}|${cond.master_operator || ""}`
    );

    const uniqueConditionKeys = new Set(conditionKeys);

    if (uniqueConditionKeys.size !== conditions.length) {
      const duplicates = conditionKeys.filter(
        (key, index) => conditionKeys.indexOf(key) !== index
      );
      setError("Duplicate condition(s) found based on 5-field combination.");
      console.warn("❌ Duplicate condition keys:", [...new Set(duplicates)]);
      console.log("All condition keys:", conditionKeys);
      return;
    } else {
      console.log("✅ All condition combinations are unique.");
    }

    const data = {
      rule_engine_rule: {
        name: ruleName,
        display_rule_name: displayRuleName,
        description: "This is a description of the sample rule.",
        loyalty_type_id: sessionStorage.getItem("selectedId"),
        rule_engine_conditions_attributes: conditions.map((condition) => ({
          condition_attribute: condition.subAttribute || "",
          operator: condition.subOperator || "",
          compare_value: condition.value || "",
          condition_selected_model: Number(condition.masterAttribute) || 1,
          condition_type: condition.condition_type || "",
          master_operator: condition.master_operator || "",
        })),
        rule_engine_actions_attributes: [
          {
            lock_model_name: selectedMasterRewardOutcomes.name || "",
            parameters: [Number(parameter) || ""],
            rule_engine_available_function_id: subRewardOutcomesnew || "",
            action_selected_model:
              Number(selectedMasterRewardOutcomes.id) || "",
          },
        ],
      },
    };

    try {
      const response = await fetch(
        `${baseURL}rule_engine/rules/loyalty_re?token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        navigate("/setup-member/rule-engine");
        console.log("Data created successfully:", responseData);
      } else {
        const errorData = await response.json();
        setError(`Failed to create Rule Engine: ${errorData.message}`);
        console.error("Submission error:", errorData);
      }
    } catch (error) {
      setError("Failed to create Rule Engine. Please try again.");
      console.error("Submission error:", error);
    }
  };

  const removeCondition = (id) => {
    const updatedConditions = conditions.filter(
      (condition) => condition.id !== id
    );
    setConditions(updatedConditions);
  };

  const renderCondition = (condition, index) => (
    <div key={condition.id} className="SetRuleCard mt-4">
      <h5 className="mb-3">
        <span className="title" style={{ fontSize: "20px", fontWeight: "600" }}>
          Set Rule Conditions
        </span>
      </h5>
      <div>
        <h6 className="mt-3">
          <span style={{ fontSize: "18px", fontWeight: "600" }}>
            Condition {condition.id}
            {index > 0 && (
              <button
                onClick={() => removeCondition(condition.id)}
                className="ms-3"
                style={{ border: "none", backgroundColor: "white" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-x"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 1 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 1 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              </button>
            )}
          </span>
        </h6>
      </div>
      {index > 0 && (
        <ul className="nav nav-tabs border-0 mt-3">
          <div className="d-flex gap-3 And-btn rounded">
            <li className="nav-item d-flex p-2 gap-2" role="presentation">
              <input
                type="radio"
                className="nav-link"
                id={`home-tab-${index}`}
                name={`tab-${index}`}
                data-bs-toggle="tab"
                data-bs-target={`#home-tab-pane-${index}`}
                role="tab"
                aria-controls={`home-tab-pane-${index}`}
                aria-selected="true"
                defaultChecked
                onChange={(e) => {
                  const updatedConditions = conditions.map((cond, idx) =>
                    idx === index ? { ...cond, condition_type: "AND" } : cond
                  );
                  setConditions(updatedConditions);
                }}
                checked={condition.condition_type === "AND"}
              />
              <label htmlFor={`home-tab-${index}`} className="and-or-btn">
                AND
              </label>
            </li>
            <li className="nav-item d-flex p-2 gap-2" role="presentation">
              <input
                type="radio"
                className="nav-link"
                id={`profile-tab-${index}`}
                name={`tab-${index}`}
                data-bs-toggle="tab"
                data-bs-target={`#profile-tab-pane-${index}`}
                role="tab"
                aria-controls={`profile-tab-pane-${index}`}
                aria-selected="false"
                onChange={(e) => {
                  const updatedConditions = conditions.map((cond, idx) =>
                    idx === index ? { ...cond, condition_type: "OR" } : cond
                  );
                  setConditions(updatedConditions);
                }}
                checked={condition.condition_type === "OR"}
              />
              <label htmlFor={`profile-tab-${index}`} className="and-or-btn">
                OR
              </label>
            </li>
          </div>
        </ul>
      )}

      <div className="border-btm pb-2 mt-2">
        <div>
          <h4>
            <span
              className="badge setRuleCard"
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#E95420",
                backgroundColor: "#E954202E",
              }}
            >
              IF
            </span>
          </h4>
          <div className="row ms-1 mt-2">
            <fieldset className="border col-md-3 m-2 col-sm-11">
              <legend
                className="float-none"
                style={{ fontSize: "14px", fontWeight: "400" }}
              >
                Master Attribute<span>*</span>
              </legend>
              <select
                required=""
                className="mt-1 mb-1"
                style={{ 
                  fontSize: "14px", 
                  fontWeight: "400",
                  width: "100%",
                  height: "40px",
                  padding: "10px 12px",
                  border: "none",
                  borderRadius: "4px",
                  transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                }}
                onChange={(e) => {
                  const updatedConditions = conditions.map((cond, idx) =>
                    idx === index
                      ? { ...cond, masterAttribute: e.target.value }
                      : cond
                  );
                  setConditions(updatedConditions);
                  handleMasterAttributeChange(e);
                }}
                value={condition.masterAttribute}
                onFocus={(e) => {
                  e.target.style.outline = "2px solid #80bdff";
                }}
                onBlur={(e) => {
                  e.target.style.outline = "none";
                }}
              >
                <option value="">Select Master Attribute </option>
                {masterAttributes.map((attr) => (
                  <option key={attr.id} value={attr.id}>
                    {attr.display_name}
                  </option>
                ))}
              </select>
            </fieldset>
            <div className="col-md-1 d-flex justify-content-center align-items-center">
              <h4>&</h4>
            </div>
            <fieldset className="border col-md-3 m-2 col-sm-11">
              <legend
                className="float-none"
                style={{ fontSize: "14px", fontWeight: "400" }}
              >
                Sub Attribute<span>*</span>
              </legend>
              <select
                required=""
                className="mt-1 mb-1"
                style={{ 
                  fontSize: "14px", 
                  fontWeight: "400",
                  width: "100%",
                  height: "40px",
                  padding: "10px 12px",
                  border: "none",
                  borderRadius: "4px",
                  transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                }}
                disabled={!condition.masterAttribute}
                onChange={(e) => {
                  const updatedConditions = conditions.map((cond, idx) =>
                    idx === index
                      ? { ...cond, subAttribute: e.target.value }
                      : cond
                  );
                  setConditions(updatedConditions);
                }}
                value={condition.subAttribute}
                onFocus={(e) => {
                  e.target.style.outline = "2px solid #80bdff";
                }}
                onBlur={(e) => {
                  e.target.style.outline = "none";
                }}
              >
                <option value="">Select Sub Attribute</option>
                {subAttributes.map((subAttr) => (
                  <option key={subAttr.id} value={subAttr.attribute_name}>
                    {subAttr.display_name}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
        </div>

        <div className="mt-3">
          <h4>
            <span
              className="badge setRuleCard"
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#E95420",
                backgroundColor: "#E954202E",
              }}
            >
              Operator
            </span>
          </h4>
          <div className="row ms-1 mt-2">
            <fieldset className="border col-md-3 m-2 col-sm-11">
              <legend
                className="float-none"
                style={{ fontSize: "14px", fontWeight: "400" }}
              >
                Master Operator<span>*</span>
              </legend>
              <select
                required=""
                className="mt-1 mb-1"
                style={{ 
                  fontSize: "14px", 
                  fontWeight: "400",
                  width: "100%",
                  height: "40px",
                  padding: "10px 12px",
                  border: "none",
                  borderRadius: "4px",
                  transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                }}
                value={condition.master_operator}
                onChange={(e) => {
                  const updatedConditions = conditions.map((cond, idx) =>
                    idx === index
                      ? { ...cond, master_operator: e.target.value }
                      : cond
                  );
                  setConditions(updatedConditions);
                  handleMasterOperatorChange(e);
                }}
                onFocus={(e) => {
                  e.target.style.outline = "2px solid #80bdff";
                }}
                onBlur={(e) => {
                  e.target.style.outline = "none";
                }}
              >
                <option value="">Select Master Operator </option>
                {masterOperators.map((op) => (
                  <option key={op.id} value={op.name}>
                    {op.name}
                  </option>
                ))}
              </select>
            </fieldset>
            <div className="col-md-1 d-flex justify-content-center align-items-center">
              <h4>&</h4>
            </div>
            <fieldset className="border col-md-3 m-2 col-sm-11">
              <legend
                className="float-none"
                style={{ fontSize: "14px", fontWeight: "400" }}
              >
                Sub Operator<span>*</span>
              </legend>
              <select
                required=""
                className="mt-1 mb-1"
                style={{ 
                  fontSize: "14px", 
                  fontWeight: "400",
                  width: "100%",
                  height: "40px",
                  padding: "10px 12px",
                  border: "none",
                  borderRadius: "4px",
                  transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                }}
                disabled={!condition.master_operator}
                value={condition.subOperator}
                onChange={(e) => {
                  const updatedConditions = conditions.map((cond, idx) =>
                    idx === index
                      ? { ...cond, subOperator: e.target.value }
                      : cond
                  );
                  setConditions(updatedConditions);
                }}
                onFocus={(e) => {
                  e.target.style.outline = "2px solid #80bdff";
                }}
                onBlur={(e) => {
                  e.target.style.outline = "none";
                }}
              >
                <option value="">Select Sub Operator </option>
                {subOperators.map((subOp) => (
                  <option key={subOp.id} value={subOp.value}>
                    {subOp.name}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
        </div>

        <div className="mt-3">
          <h4>
            <span
              className="badge setRuleCard"
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#E95420",
                backgroundColor: "#E954202E",
              }}
            >
              Value
            </span>
          </h4>
          <div className="row ms-1 mt-2">
            <fieldset className="border col-md-3 m-2 col-sm-11">
              <legend
                className="float-none"
                style={{ fontSize: "14px", fontWeight: "400" }}
              >
                Value<span>*</span>
              </legend>
              <input
                type="text"
                className="mt-1 mb-1"
                style={{ 
                  fontSize: "14px", 
                  fontWeight: "400",
                  width: "100%",
                  height: "40px",
                  padding: "10px 12px",
                  border: "none",
                  borderRadius: "4px",
                  transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                }}
                placeholder="Enter Point Value"
                value={condition.value}
                onChange={(e) => {
                  const updatedConditions = conditions.map((cond, idx) =>
                    idx === index ? { ...cond, value: e.target.value } : cond
                  );
                  setConditions(updatedConditions);
                }}
                onFocus={(e) => {
                  e.target.style.outline = "2px solid #80bdff";
                }}
                onBlur={(e) => {
                  e.target.style.outline = "none";
                }}
              />
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-100">
        <div className="module-data-section mt-2 mx-3">
          <p className="pointer">
            <Link to="/setup-member/rule-engine">
              <span>Rule Engine</span>
            </Link>{" "}
            &gt; New Rule
          </p>

          <div className="d-flex align-items-center mb-3" style={{gap: '16px'}}>
            <span
              className="title"
              style={{ fontSize: "20px", fontWeight: "600" }}
            >
              New Rule
            </span>
          </div>
          <div className="go-shadow me-3">
            <div className="row ms-1">
              <fieldset className="border col-md-11 m-2 col-sm-11">
                <legend
                  className="float-none"
                  style={{ fontSize: "14px", fontWeight: "400" }}
                >
                  New Rule<span>*</span>
                </legend>
                <input
                  type="text"
                  placeholder="Enter Rule Name"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="mt-1 mb-1"
                  style={{ 
                    fontSize: "14px", 
                    fontWeight: "400",
                    width: "100%",
                    height: "40px",
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: "4px",
                    transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = "2px solid #80bdff";
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = "none";
                  }}
                />
              </fieldset>
              <fieldset className="border col-md-11 m-2 col-sm-11">
                <legend
                  className="float-none"
                  style={{ fontSize: "14px", fontWeight: "400" }}
                >
                  Display Rule Name<span>*</span>
                </legend>
                <input
                  type="text"
                  placeholder="Enter Display Rule Name"
                  value={displayRuleName}
                  onChange={(e) => setDisplayRuleName(e.target.value)}
                  className="mt-1 mb-1"
                  style={{ 
                    fontSize: "14px", 
                    fontWeight: "400",
                    width: "100%",
                    height: "40px",
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: "4px",
                    transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = "2px solid #80bdff";
                  }}
                  onBlur={(e) => {
                    e.target.style.outline = "none";
                  }}
                />
              </fieldset>
            </div>
          </div>

          <div className="main-rule">
            {conditions.map(renderCondition)}

            <button
              className="purple-btn1 mt-2"
              onClick={addCondition}
              style={{ color: "black", fontSize: "16px", fontWeight: "500" }}
            >
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="bi bi-plus"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                </svg>
              </span>
              Add Additional Condition
            </button>

            <div className="mt-3">
              <h4>
                <span
                  className="badge setRuleCard"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#E95420",
                    backgroundColor: "#E954202E",
                  }}
                >
                  THEN
                </span>
              </h4>
              <div className="ms-1 mt-2" style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center' }}>
                <fieldset className="border col-md-3 m-2 col-sm-11">
                  <legend className="float-none" style={{ fontSize: "14px", fontWeight: "400" }}>
                    Master Reward Outcome<span>*</span>
                  </legend>
                  <select
                    required
                    className="mt-1 mb-1 w-100"
                    style={{ 
                      fontSize: "14px", 
                      fontWeight: "400",
                      height: "40px",
                      padding: "10px 12px",
                      border: "none",
                      borderRadius: "4px",
                      transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                    }}
                    onChange={handleMasterSubRewardOutcomeChange}
                    value={selectedMasterRewardOutcomes.id || ""}
                    onFocus={(e) => {
                      e.target.style.outline = "2px solid #80bdff";
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = "none";
                    }}
                  >
                    <option value="" disabled>
                      Select Master Reward Outcome
                    </option>
                    {masterRewardOutcomes.map((reward) => (
                      <option key={reward.id} value={reward.id} data-name={reward.lock_model_name}>
                        {reward.display_name}
                      </option>
                    ))}
                  </select>
                </fieldset>

                <div className="m-2 d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                  <h4 className="m-0">&</h4>
                </div>

                <fieldset className="border col-md-4">
                  <legend className="float-none" style={{ fontSize: "14px", fontWeight: "400" }}>
                    Sub Reward Outcome<span>*</span>
                  </legend>
                  <select
                    required
                    className="mt-1 mb-1 w-100"
                    style={{ 
                      fontSize: "14px", 
                      fontWeight: "400",
                      height: "40px",
                      padding: "10px 12px",
                      border: "none",
                      borderRadius: "4px",
                      transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                    }}
                    disabled={!selectedMasterRewardOutcomes}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setsubRewardOutcomesnew(selectedId);

                      const selectedSubReward = subRewardOutcomes.find(
                        (reward) => reward.id === parseInt(selectedId)
                      );
                      setSelectedSubRewardOutcome(selectedSubReward);
                    }}
                    value={subRewardOutcomesnew}
                    onFocus={(e) => {
                      e.target.style.outline = "2px solid #80bdff";
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = "none";
                    }}
                  >
                    <option value="">Select Sub Reward Outcome</option>
                    {subRewardOutcomes.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.display_name}
                      </option>
                    ))}
                  </select>
                </fieldset>

                <div className="position-relative m-2 col-md-4 col-sm-11" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <fieldset className="border w-100" style={{ position: 'relative' }}>
                    <legend className="float-none" style={{ fontSize: "14px", fontWeight: "400" }}>
                      Parameter <span>*</span>
                    </legend>
                    <input
                      type="text"
                      placeholder="Enter Parameter Value"
                      value={parameter}
                      onChange={(e) => setParameter(e.target.value)}
                      className="mt-1 mb-1 w-100"
                      style={{ 
                        fontSize: "14px", 
                        fontWeight: "400",
                        height: "40px",
                        padding: "10px 12px",
                        border: "none",
                        borderRadius: "4px",
                        transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = "2px solid #80bdff";
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = "none";
                      }}
                    />

                    {selectedSubRewardOutcome?.display_name && (
                      <span
                        style={{
                          marginLeft: '4px',
                          fontSize: "20px",
                          fontWeight: "400",
                          paddingBottom:'5px',
                          color: "#000",
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {selectedSubRewardOutcome.display_name === "Percentage Credit" ||
                        selectedSubRewardOutcome.display_name === "Percent Credit" ||
                        selectedSubRewardOutcome.display_name.toLowerCase().includes("percentage")
                          ? "%"
                          : selectedSubRewardOutcome.display_name.toLowerCase().includes("credit") 
                          ? "Pts"
                          : ""}
                      </span>
                    )}
                  </fieldset>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error" style={{ color: "red" }}>
              {error}
            </div>
          )}

          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button className="purple-btn1 w-100" onClick={handleSubmit}>
                Submit
              </button>
            </div>
            <div className="col-md-2">
              <button
                className="purple-btn2 w-100"
                onClick={() => {
                  setRuleName("");
                  setDisplayRuleName("");
                  setConditions((prevConditions) =>
                    prevConditions.map((condition) => ({
                      ...condition,
                      masterAttribute: "",
                      subAttribute: "",
                      masterOperator: "",
                      subOperator: "",
                      condition_type: "",
                      value: "",
                    }))
                  );
                  setSelectedMasterRewardOutcomes({ id: "", name: "" });
                  setSubRewardOutcomes([]);
                  setParameter("");
                  setSelectedSubRewardOutcome(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default CreateRuleEngine;