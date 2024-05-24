import React from "react";
import { MenuItem, Select } from "@mui/material";
import { DropdownItem } from "../../interfaces/types";

interface DropboxProps {
  items: DropdownItem[];
  title: string;
  onChange: (value: any) => void;
}

const Dropbox: React.FC<DropboxProps> = ({ items, title, onChange }) => {
  const handleChange = (value: any) => {
    onChange(value);
  };
  return (
    <div className="flex flex-col gap-y-2">
      <label className="text-black font-bold text-sm">{title}</label>
      <Select
        sx={{
          height: "40px",
          "&:hover": {
            borderColor: "#d9e2ef",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#005399",
          },
        }}
        onChange={handleChange}
        defaultValue=""
      >
        {items.map((item, index) => (
          <MenuItem key={index} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default Dropbox;
