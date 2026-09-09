import React from "react";
import Select from "react-select";

export default function MultiSelectBox({
  options,
  value,
  onChange,
  placeholder,
  isCheckbox = false,
  maxSelected, // optional cap - once reached, un-selected options grey out and stop responding to clicks
  projectDetails = false,
}) {
  const selectedValues = Array.isArray(value) ? value.map((v) => v.value) : [];
  const atMax = maxSelected != null && selectedValues.length >= maxSelected;
  const isOptionDisabled = (option) => atMax && !selectedValues.includes(option.value);

  const checkboxFormatOptionLabel = (option) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
      <input
        type="checkbox"
        readOnly
        checked={selectedValues.includes(option.value)}
        style={{ accentColor: "var(--red)", width: "15px", height: "15px", cursor: "pointer" }}
      />
      <span style={{ fontSize: "14px" }}>{option.label}</span>
    </div>
  );
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: projectDetails ? "50px" : "35px",
      padding: "0px 4px",
      height: projectDetails ? "auto" : undefined,
      position: "relative",
      zIndex: 10,
      border: "1px solid #ccc",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(128, 189, 255, 0.5)" : base.boxShadow,
    }),

    valueContainer: (base) => ({
      ...base,
      overflowY: "auto",
      flexWrap: "wrap",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: projectDetails ? "48px" : "32px", // Match the control height
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      position: "absolute",
      top: "100%",
      padding: "5px",
    }),
    option: (base, state) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: state.isDisabled
        ? "transparent"
        : state.isSelected
          ? "#D3D3D3"
          : state.isFocused
            ? "var(--red)"
            : "transparent",
      color: state.isDisabled ? "#b5b3b0" : state.isSelected ? "#333" : state.isFocused ? "white" : "black",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      padding: "10px",
      borderRadius: "4px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#333",
      backgroundColor: "transparent",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--red)",
      color: "white",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "white",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "var(--red)",
        color: "white",
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "hsl(0, 0%, 80%)",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "hsl(0, 0%, 80%)",
    }),
  };

  return (
    <Select
      isMulti
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="basic-multi-select"
      classNamePrefix="select"
      styles={customStyles}
      closeMenuOnSelect={!isCheckbox}
      hideSelectedOptions={!isCheckbox}
      formatOptionLabel={isCheckbox ? checkboxFormatOptionLabel : undefined}
      isOptionDisabled={maxSelected != null ? isOptionDisabled : undefined}
    />
  );
}
