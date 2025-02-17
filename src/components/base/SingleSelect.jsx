import React from "react";
import Select from "react-select";

export default function SelectBox({
  label,
  options,
  defaultValue,
  onChange,
  style = {},
  className = "",
  isDisableFirstOption = false, // New prop
}) {
  const customStyles = {
    control: (base) => ({
      ...base,
      maxHeight: "65px",
      overflowY: "auto",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999, // Ensure the dropdown appears above other elements
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999, // Ensure portal menu is on top
    }),
  };

  // Disable the first option if isDisableFirstOption is true
  const formattedOptions = isDisableFirstOption
    ? options.map((option, index) => ({
        ...option,
        isDisabled: index === 0,
      }))
    : options;

  // Handle default value
  const defaultOption = defaultValue
    ? options.find((option) => option.value === defaultValue)
    : null;

  return (
    <div className={`${className}`} style={style}>
      {label && <label>{label}</label>}
      <Select
        options={formattedOptions}
        defaultValue={defaultOption}
        onChange={(selectedOption) => onChange(selectedOption?.value)}
        isOptionDisabled={(option) => option.isDisabled} // Disabling logic
        styles={customStyles}
        menuPortalTarget={document.body} // Render dropdown outside the table
      />
    </div>
  );
}