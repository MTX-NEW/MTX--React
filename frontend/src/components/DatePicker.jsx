import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import "@/index.css";

const DatePicker = ({ label, value, onChange, error, placeholder, disabled, size = "small", ...props }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDatePicker 
        label={label}
        value={value}
        onChange={(newValue) => onChange(newValue)}
        disabled={disabled}
        slotProps={{
          textField: {
            fullWidth: true,
            error: Boolean(error),
            helperText: error,
            size: size,
            placeholder: placeholder,
            sx: {
              '& .MuiInputBase-root': {
                height: '40px',
                fontSize: '0.875rem',
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.875rem',
                transform: label ? 'translate(14px, 12px) scale(1)' : undefined
              },
              '& .MuiInputLabel-shrink': {
                transform: 'translate(14px, -6px) scale(0.75)'
              }
            },
            ...props
          }
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
