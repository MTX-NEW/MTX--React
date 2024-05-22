import React from "react";

interface TextBoxProps {
  placeholder: string;
  className?: string;
}

const TextBox: React.FC<TextBoxProps> = ({ placeholder, className }) => {
  return (
    <input
      className={`border border-gray-300 focus:border-MTX-blue hover:border-gray-400 p-2 text-sm rounded-md ${className}`}
      placeholder={placeholder}
    ></input>
  );
};

export default TextBox;
