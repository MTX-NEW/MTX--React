import React from "react";
import { MenuItem, Select } from "@mui/material";

interface DropboxProps {
  items: DropdownItem[];
  title: string;
}

const Dropbox: React.FC<DropboxProps> = ({ items, title }) => {
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
