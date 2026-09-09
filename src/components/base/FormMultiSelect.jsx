import React from "react";
import Select from "react-select";
import "./form-controls.css";

export default function FormMultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select",
  required = false,
  disabled = false,
  isSearchable = true,
  isCheckbox = false,
  maxSelected,
  className = "",
}) {
  const selectedOptions = Array.isArray(value) ? value : [];
  const selectedValues = selectedOptions.map((option) => option.value);
  const atMax = maxSelected != null && selectedValues.length >= maxSelected;

  const checkboxFormatOptionLabel = (option) => (
    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="checkbox"
        readOnly
        checked={selectedValues.includes(option.value)}
        style={{ accentColor: "var(--red, #de7008)" }}
      />
      <span>{option.label}</span>
    </span>
  );

  return (
    <div className={`form-select-field ${disabled ? "form-select-field--disabled" : ""} ${className}`}>
      {label && (
        <span className="form-select-field__label">
          {label}
          {required && <span className="form-select-field__required"> *</span>}
        </span>
      )}
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={(selected) => onChange?.(selected || [])}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={isSearchable}
        closeMenuOnSelect={!isCheckbox}
        hideSelectedOptions={!isCheckbox}
        formatOptionLabel={isCheckbox ? checkboxFormatOptionLabel : undefined}
        isOptionDisabled={(option) => atMax && !selectedValues.includes(option.value)}
        classNamePrefix="select"
        menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>
  );
}
