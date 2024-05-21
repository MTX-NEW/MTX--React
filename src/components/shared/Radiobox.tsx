import React from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

interface RadioboxProps {
  group: RadioboxItem[];
  title: string;
}

const Radiobox: React.FC<RadioboxProps> = ({ group, title }) => {
  const radioboxStyle = {
    "&.MuiRadio-root": {
      color: "#d9e2ef",
    },
    "&.Mui-checked	": {
      color: "#005399",
    },
  };
  return (
    <div className="flex flex-col gap-y-2">
      <label className="text-black font-bold text-sm">{title}</label>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
      >
        {group.map((item, index) => (
          <FormControlLabel
            key={index}
            value={item.value}
            control={<Radio sx={radioboxStyle} />}
            label={item.label}
          />
        ))}
      </RadioGroup>
    </div>
  );
};

export default Radiobox;
