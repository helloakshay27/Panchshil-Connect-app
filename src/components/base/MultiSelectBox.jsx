import React from "react";
import FormMultiSelect from "./FormMultiSelect";

export default function MultiSelectBox({
  label,
  required = false,
  options = [],
  value,
  onChange,
  placeholder = "Select",
  isCheckbox = false,
  maxSelected,
  className = "",
  disabled = false,
}) {
  return (
    <FormMultiSelect
      className={className}
      label={label}
      required={required}
      options={options}
      value={Array.isArray(value) ? value : []}
      onChange={onChange}
      placeholder={placeholder}
      isCheckbox={isCheckbox}
      maxSelected={maxSelected}
      disabled={disabled}
    />
  );
}
