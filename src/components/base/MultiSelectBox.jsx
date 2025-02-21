import React from "react";
import Select from "react-select";

export default function MultiSelectBox({
  options,
  value,
  onChange,
  placeholder,
}) {
  const customStyles = {
    control: (base) => ({
      ...base,
      maxHeight: "65px",
      overflowY: "auto",
      position: "relative",
      zIndex: 10,
      border: "1px solid #ccc",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      position: "absolute",
      top: "100%",
    }),
    option: (base, state) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: state.isSelected
        ? "#D3D3D3"
        : state.isFocused
        ? "#de7008"
        : "transparent",
      color: state.isSelected ? "#333" : state.isFocused ? "white" : "black",
      cursor: "pointer",
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
      backgroundColor: "#de7008",
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
        backgroundColor: "#de7008",
        color: "white",
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#de7008",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#de7008",
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
    />
  );
}
