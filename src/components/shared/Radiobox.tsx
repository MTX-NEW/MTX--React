import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { RadioboxItem } from "../../interfaces/types";

interface RadioboxProps {
  group: RadioboxItem[];
  title: string;
  onChange: (value: any) => void;
}

const Radiobox: React.FC<RadioboxProps> = ({ group, title, onChange }) => {
  const handleChange = (value: any) => {
    onChange(value);
  };
  const radioboxStyle = {
    "&.MuiRadio-root": {
      color: "#d9e2ef",
    },
    "&.Mui-checked	": {
      color: "#005399",
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "0.875rem",
      fontWeight: "semibold",
    },
  };
  return (
    <div className="flex flex-col gap-y-2">
      <label className="text-black font-bold text-sm">{title}</label>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        onChange={handleChange}
      >
        {group.map((item, index) => (
          <FormControlLabel
            key={index}
            value={item.value}
            sx={radioboxStyle}
            control={<Radio sx={radioboxStyle} />}
            label={item.label}
          />
        ))}
      </RadioGroup>
    </div>
  );
};

export default Radiobox;
