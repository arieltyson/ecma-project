// The HIG segmented control as a native radio group: arrow keys move
// between options and screen readers announce "1 of 3, selected".

import { useId, type ReactNode } from "react";
import "./SegmentedControl.css";

interface Option<T extends string> {
  readonly value: T;
  readonly label: ReactNode;
}

export function SegmentedControl<const T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  readonly label: string;
  readonly options: readonly Option<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="segmented">
      <legend className="visually-hidden">{label}</legend>
      {options.map((option) => (
        <label key={option.value} className="segmented-option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
