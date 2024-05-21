import React from "react";

interface TextBoxProps {
  placeholder: string;
}

const TextBox: React.FC<TextBoxProps> = ({ placeholder }) => {
  return (
    <input
      className="border border-gray-300 focus:border-MTX-blue hover:border-gray-400 p-2 text-sm rounded-md"
      placeholder={placeholder}
    ></input>
  );
};

export default TextBox;
