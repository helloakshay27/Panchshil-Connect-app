import React from "react";
import FormSelect from "./FormSelect";

export default function SelectBox({
  label,
  options = [],
  defaultValue,
  value,
  onChange,
  style = {},
  className = "",
  isDisableFirstOption = false,
  disabled = false,
  required = false,
  placeholder = "Select",
  isSearchable = true,
}) {
  const selectedValue = value !== undefined ? value : defaultValue;

  return (
    <div className={className} style={style}>
      <FormSelect
        label={label}
        options={options}
        value={selectedValue ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        isSearchable={isSearchable}
        isDisableFirstOption={isDisableFirstOption}
      />
    </div>
  );
}
