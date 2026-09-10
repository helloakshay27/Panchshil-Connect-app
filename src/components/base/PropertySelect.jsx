import React from "react";
import FormSelect from "./FormSelect";

export default function PropertySelect({
  label,
  options,
  defaultValue,
  onChange,
  style = {},
  className = "",
  isDisableFirstOption = false,
  projectDetails = false,
}) {
  return (
    <div className={className} style={style}>
      <FormSelect
        label={label}
        options={options}
        value={defaultValue ?? ""}
        onChange={(value, option) => onChange(option)}
        isDisableFirstOption={isDisableFirstOption}
        className={projectDetails ? "property-select--project-details" : ""}
      />
    </div>
  );
}
