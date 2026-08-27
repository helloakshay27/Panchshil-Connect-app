import React from "react";
import "./event-form-steps.css";

export const EVENT_FORM_STEPS = [
  { key: "details", label: "Event Details" },
  { key: "images", label: "Event Related Images" },
  { key: "preview", label: "Preview" },
];

/* Step tabs for the event create/edit wizard. Clicking a step only jumps
   backward (or to a step already completed) - it never skips ahead of
   `current`, since later steps depend on earlier ones being valid. */
const EventFormSteps = ({ current, onStepClick }) => {
  const currentIndex = EVENT_FORM_STEPS.findIndex((s) => s.key === current);

  return (
    <div className="efs-steps">
      {EVENT_FORM_STEPS.map((step, index) => (
        <React.Fragment key={step.key}>
          {index > 0 && <span className="efs-connector" />}
          <button
            type="button"
            className={`efs-step ${
              step.key === current ? "is-active" : index < currentIndex ? "is-done" : ""
            }`}
            disabled={index > currentIndex}
            onClick={() => index <= currentIndex && onStepClick?.(step.key)}
          >
            {step.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default EventFormSteps;
