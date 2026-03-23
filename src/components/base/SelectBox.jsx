import React, { useState, useEffect } from "react";
import Select from "react-select";

export default function SelectBox({
  label,
  options,
  defaultValue,
  value,
  onChange,
  style = {},
  className = "",
  isDisableFirstOption = false,
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  // Controlled mode: sync when `value` prop changes (used in edit forms after async fetch)
  useEffect(() => {
    if (value !== undefined) {
      if (value !== null && value !== "") {
        const found = options.find(
          (option) => option.label === value || option.value === value
        );
        setSelectedOption(found || null);
      } else {
        setSelectedOption(null);
      }
    }
  }, [value, options]);

  // Uncontrolled/legacy mode: sync when `defaultValue` prop changes
  useEffect(() => {
    if (value === undefined && defaultValue) {
      const defaultOption = options.find(
        (option) => option.label === defaultValue || option.value === defaultValue
      );
      setSelectedOption(defaultOption || null);
    }
  }, [defaultValue, options]);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "35px",
      height: "30px",
      padding: "0px 4px",
      borderColor: state.isFocused ? "#80bdff" : base.borderColor,
      boxShadow: state.isFocused ? "0 0 0 4px rgba(128, 189, 255, 0.5)" : base.boxShadow,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0px 6px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "32px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      padding: "5px",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#ccc"
        : state.isFocused
        ? "var(--red)"
        : base.backgroundColor,
      color: state.isSelected ? "#000" : state.isFocused ? "#fff" : "#000",
      cursor: "pointer",
      padding: "10px",
      borderRadius: "4px",
    }),
    multiValueRemove: (base, state) => ({
      ...base,
      color: state.isFocused ? "var(--red)" : base.color,
      "&:hover": {
        backgroundColor: "var(--red)",
        color: "#fff",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#333",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#666",
    }),
  };

  const formattedOptions = isDisableFirstOption
    ? options.map((option, index) => ({
        ...option,
        isDisabled: index === 0,
      }))
    : options;

  const handleChange = (selected) => {
    setSelectedOption(selected);
    onChange(selected?.value);
  };

  return (
    <div className={`${className}`} style={style}>
      {label && <label>{label}</label>}
      <Select
        options={formattedOptions}
        value={selectedOption}
        onChange={handleChange}
        isOptionDisabled={(option) => option.isDisabled}
        styles={customStyles}
        menuPortalTarget={document.body}
      />
    </div>
  );
}