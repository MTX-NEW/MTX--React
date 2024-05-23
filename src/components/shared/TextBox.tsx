import React from "react";

interface TextBoxProps {
  placeholder: string;
  className?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "number" | "text" | "password";
  value: any;
}

const TextBox: React.FC<TextBoxProps> = ({
  placeholder,
  className,
  onChange,
  value,
  type,
}) => {
  return (
    <input
      className={`border border-gray-300 focus:border-MTX-blue hover:border-gray-400 p-2 text-sm rounded-md ${className}`}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      type={type}
    ></input>
  );
};

export default TextBox;
