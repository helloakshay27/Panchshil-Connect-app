import React from "react";
import Select from "react-select";
import "./form-controls.css";

export default function FormSelect({
  label,
  options = [],
  value = "",
  defaultValue,
  onChange,
  placeholder = "Select",
  required = false,
  disabled = false,
  isSearchable = true,
  isDisableFirstOption = false,
  className = "",
}) {
  const formattedOptions = isDisableFirstOption
    ? options.map((option, index) => ({
        ...option,
        isDisabled: index === 0,
      }))
    : options;

  const selectedValue = value !== "" && value !== null && value !== undefined
    ? value
    : defaultValue;
  const selectedOption = formattedOptions.find(
    (option) => option.value === selectedValue || option.label === selectedValue,
  ) || null;

  const handleChange = (option) => {
    onChange?.(option?.value ?? "", option);
  };

  return (
    <div className={`form-select-field ${disabled ? "form-select-field--disabled" : ""} ${className}`}>
      {label && (
        <span className="form-select-field__label">
          {label}
          {required && <span className="form-select-field__required"> *</span>}
        </span>
      )}
      <Select
        options={formattedOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={isSearchable}
        isOptionDisabled={(option) => option.isDisabled}
        classNamePrefix="select"
        menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>
  );
}
