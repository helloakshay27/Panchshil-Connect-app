import React from "react";
import "./form-controls.css";

export default function FormTextField({
  label,
  value = "",
  onChange,
  placeholder = "",
  required = false,
  multiline = false,
  rows = 3,
  type = "text",
  name,
  id,
  disabled = false,
  className = "",
  ...props
}) {
  const fieldId = id || name || label?.toLowerCase().replace(/\s+/g, "-");
  const Field = multiline ? "textarea" : "input";

  return (
    <div className={`form-control-field ${disabled ? "form-control-field--disabled" : ""} ${className}`}>
      {label && (
        <label className="form-control-field__label" htmlFor={fieldId} title={label}>
          {label}
          {required && <span className="form-control-field__required"> *</span>}
        </label>
      )}
      <Field
        id={fieldId}
        name={name}
        type={multiline ? undefined : type}
        rows={multiline ? rows : undefined}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={multiline ? "form-control-field__textarea" : "form-control-field__input"}
        {...props}
      />
    </div>
  );
}
